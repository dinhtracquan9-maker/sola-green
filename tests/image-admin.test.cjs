const { test } = require('node:test');
const assert = require('node:assert/strict');
const { inspect,updateHtml,validImage,validSlug,session,authenticated } = require('../server/image-editor.cjs');
const handler = require('../api/image-admin.js');
test('sessions reject tampering, expiry and password changes',()=>{
  const s=session('s'.repeat(32),'p'.repeat(24),1000);
  assert.equal(authenticated(s,'s'.repeat(32),'p'.repeat(24),2000),true);
  assert.equal(authenticated(s+'x','s'.repeat(32),'p'.repeat(24),2000),false);
  assert.equal(authenticated(s,'s'.repeat(32),'new password',2000),false);
  assert.equal(authenticated(s,'s'.repeat(32),'p'.repeat(24),15000000),false);
});
test('path validation prevents traversal, SVG and external image URLs',()=>{
  for(const s of ['../x','assets/images/../x.jpg','assets/images/x.svg','https://x/a.jpg','assets/images/a%2fb.jpg'])assert.equal(validImage(s),false);
  assert.equal(validImage('assets/images/Ảnh sản phẩm.jpg'),true);
  assert.equal(validSlug('../index'),false);
});
test('HTML edits preserve article and only target selected cover/card',()=>{
  const s='<h1>A &amp; B</h1><img src="logo.png"><div class="article-cover wrap"><img src="old" alt="old" srcset="old 1x"></div><p>Preserve text</p>';
  const image={src:'../assets/images/new.jpg',alt:'A "product"'};
  const result=updateHtml(s,image);
  assert.equal(inspect(result).title,'A & B');assert.equal(inspect(result).alt,'A "product"');
  assert.ok(result.includes('<p>Preserve text</p>'));assert.ok(result.includes('src="logo.png"'));assert.ok(!result.includes('srcset'));
  const index='<a class="story-card" href="one.html"><img src="old"></a><a class="story-card" href="two.html"><img src="keep"></a>';
  assert.ok(updateHtml(index,image,'one').includes('src="keep"'));
  assert.throws(()=>updateHtml('<h1>No cover</h1>',image));
});
function response(){return {headers:{},setHeader(k,v){this.headers[k]=v;},end(body){this.body=body;}};}
test('protected API fails closed before secrets exist',async()=>{
  const saved={...process.env};delete process.env.IMAGE_ADMIN_PASSWORD;delete process.env.IMAGE_ADMIN_SESSION_SECRET;delete process.env.IMAGE_ADMIN_GITHUB_TOKEN;
  const res=response();await handler({method:'GET',url:'/?action=dashboard',headers:{}},res);
  assert.equal(res.statusCode,503);assert.ok(!res.body.includes('id="save"'));
  Object.assign(process.env,saved);
});
test('API requires auth and exact same-origin mutations',async()=>{
  process.env.IMAGE_ADMIN_PASSWORD='p'.repeat(24);process.env.IMAGE_ADMIN_SESSION_SECRET='s'.repeat(32);process.env.IMAGE_ADMIN_GITHUB_TOKEN='test-only';
  const res=response();await handler({method:'GET',url:'/?action=list',headers:{}},res);assert.equal(res.statusCode,401);
  const cross=response();await handler({method:'POST',url:'/?action=save',headers:{origin:'https://evil.example','content-type':'application/json'}},cross);assert.equal(cross.statusCode,403);
});
