// Local UI preview only. No credentials and no repository writes.
const http=require('node:http'), fs=require('node:fs'), path=require('node:path');
const root=path.resolve(__dirname,'..');
const dashboard=require('../server/admin-page.cjs');
const {inspect}=require('../server/image-editor.cjs');
const queue=JSON.parse(fs.readFileSync(path.join(root,'data/blog_queue.json'),'utf8'));
const images=[];
function scan(dir){for(const file of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,file.name);if(file.isDirectory())scan(p);else if(/\.(jpg|png|webp|jfif)$/i.test(p)){const rel=path.relative(root,p).replaceAll('\\','/');images.push({path:rel,name:file.name,url:'/'+rel.split('/').map(encodeURIComponent).join('/')});}}}
scan(path.join(root,'assets/images'));
const articles=queue.topics.filter(t=>t.slug).map(t=>({slug:t.slug,title:t.title,date:t.published_at,image:t.image?t.image.replace(/^\.\./,''):'',locked:false,reviewed:false})).reverse();
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://127.0.0.1');
  if(url.pathname==='/__admin-preview'){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end(dashboard);}
  if(url.pathname==='/api/image-admin'){
    res.setHeader('Content-Type','application/json; charset=utf-8');
    if(url.searchParams.get('action')==='list')return res.end(JSON.stringify({articles,images,revision:'a'.repeat(40)}));
    if(url.searchParams.get('action')==='detail'){
      const slug=url.searchParams.get('slug');if(!/^[a-z0-9-]+$/.test(slug)){res.statusCode=400;return res.end('{}');}
      const info=inspect(fs.readFileSync(path.join(root,'blog',slug+'.html'),'utf8'));
      return res.end(JSON.stringify({...info,imageUrl:info.image.replace(/^\.\./,''),revision:'a'.repeat(40)}));
    }
    res.statusCode=403;return res.end(JSON.stringify({error:'Bản kiểm thử chỉ xem trước, không ghi dữ liệu.'}));
  }
  let target;try{target=path.resolve(root,'.'+decodeURIComponent(url.pathname));}catch{res.statusCode=400;return res.end();}
  if(!target.startsWith(root+path.sep)||url.pathname.includes('..')){res.statusCode=403;return res.end();}
  if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
  if(!fs.existsSync(target)){res.statusCode=404;return res.end();}
  const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'application/javascript','.jpg':'image/jpeg','.jfif':'image/jpeg','.png':'image/png','.webp':'image/webp'};
  if(!mime[path.extname(target)]){res.statusCode=403;return res.end();}
  res.setHeader('Content-Type',mime[path.extname(target)]);fs.createReadStream(target).pipe(res);
});
server.listen(4187,'127.0.0.1',()=>console.log('Local preview: http://127.0.0.1:4187/__admin-preview'));
