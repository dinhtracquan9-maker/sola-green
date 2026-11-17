const {test}=require('node:test');
const assert=require('node:assert/strict');
const {client,publicUrl}=require('../server/github-editor.cjs');
const sharp=require('sharp');
test('image URLs encode spaces once across save and reload',()=>{
  assert.equal(publicUrl('../assets/images/Photo%20one.jpg'),'/assets/images/Photo%20one.jpg');
  assert.equal(publicUrl('assets/images/Photo one.jpg'),'/assets/images/Photo%20one.jpg');
  assert.equal(publicUrl('https://example.com/a.jpg'),'');
});
function mock(conflict=false){
  const revision='a'.repeat(40),treeSha='b'.repeat(40),calls=[];
  const fixtures={
    'blog/example.html':'<h1>Example</h1><div class="article-cover wrap"><img src="../assets/images/old.jpg" alt="Old"></div><p>Keep this article</p>',
    'blog/index.html':'<a class="story-card" href="example.html"><img src="../assets/images/old.jpg" alt="Old"></a>',
    'data/blog_queue.json':JSON.stringify({topics:[{slug:'example',title:'Example',image:'../assets/images/old.jpg'}]}),
    'data/article_image_overrides.json':'{"version":1,"articles":{}}',
    'assets/images/new.jpg':'jpeg',
    'assets/images/old.jpg':'jpeg'
  };
  const files=Object.entries(fixtures).map(([path],i)=>({path,type:'blob',sha:String(i).padStart(40,'0')}));
  async function fetcher(url,options){
    const route=url.split('/sola-green/')[1],body=options.body?JSON.parse(options.body):null;calls.push({route,method:options.method,body});
    let value={};
    if(route==='git/ref/heads/main')value={object:{sha:revision}};
    else if(route.startsWith('git/trees/')&&options.method==='GET')value={sha:treeSha,tree:files};
    else if(route.startsWith('git/blobs/')&&options.method==='GET'){
      const file=files.find(f=>route.endsWith(f.sha));value={content:Buffer.from(fixtures[file.path]).toString('base64')};
    }else if(route==='git/refs/heads/main'&&conflict)return {ok:false,status:422,json:async()=>({})};
    else value={sha:'c'.repeat(40)};
    return {ok:true,json:async()=>value};
  }
  return {calls,api:client('not-a-real-token',fetcher),revision,treeSha};
}
test('one atomic commit updates article, index, queue and lock history',async()=>{
  const m=mock();await m.api.save({slug:'example',revision:m.revision,alt:'New product packaging',imagePath:'assets/images/new.jpg'});
  const blobs=m.calls.filter(c=>c.route==='git/blobs');
  assert.equal(blobs.length,4);
  assert.ok(blobs[0].body.content.includes('Keep this article'));
  assert.ok(blobs[0].body.content.includes('../assets/images/new.jpg'));
  const history=JSON.parse(blobs[3].body.content);assert.equal(history.articles.example.locked,true);
  assert.equal(history.articles.example.history[0].src,'../assets/images/old.jpg');
  assert.equal(m.calls.find(c=>c.route==='git/trees'&&c.method==='POST').body.base_tree,m.treeSha);
  assert.equal(m.calls.at(-1).body.force,false);
});
test('stale revisions do not write blobs or commits',async()=>{
  const m=mock();await assert.rejects(m.api.save({slug:'example',revision:'d'.repeat(40),alt:'New image',imagePath:'assets/images/new.jpg'}),{status:409});
  assert.ok(!m.calls.some(c=>c.method==='POST'));
});
test('conflicting ref update fails instead of force-pushing',async()=>{
  const m=mock(true);await assert.rejects(m.api.save({slug:'example',revision:m.revision,alt:'New image',imagePath:'assets/images/new.jpg'}),{status:409});
  assert.equal(m.calls.at(-1).body.force,false);
});
test('uploads are raster-validated and resized without cropping',async()=>{
  const m=mock();const upload=await sharp({create:{width:2000,height:1000,channels:3,background:'white'}}).png().toBuffer();
  await m.api.save({slug:'example',revision:m.revision,alt:'Product photo',upload:upload.toString('base64')});
  const image=m.calls.filter(c=>c.route==='git/blobs').at(-1);
  const metadata=await sharp(Buffer.from(image.body.content,'base64')).metadata();
  assert.equal(metadata.width,1600);assert.equal(metadata.height,800);assert.equal(metadata.format,'webp');
});
