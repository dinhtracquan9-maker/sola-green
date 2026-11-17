'use strict';
const $=selector=>document.querySelector(selector);
const state={articles:[],images:[],limit:30,imageLimit:36,current:null,selected:null,busy:false,ready:false,blob:null};
for(const [selector,name,iconOnly] of [['#refresh','refresh-cw',true],['#close','x',true],['#logout','log-out'],['#save','save'],['#library-toggle','images'],['label[for=upload]','image-up']]){
  const target=$(selector);if(iconOnly)target.textContent='';const icon=document.createElement('i');icon.dataset.lucide=name;target.prepend(icon);
}
window.lucide?.createIcons();
function el(tag,cls,text) {const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;}
function norm(s){return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
async function api(action,body) {
  const response=await fetch('/api/image-admin?action='+action,body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{});
  const data=await response.json();
  if(response.status===401){location.replace('/admin/');throw new Error('Phiên đăng nhập hết hạn.');}
  if(!response.ok)throw new Error(data.error || 'Không thể kết nối.');
  return data;
}
function thumbnail(url,cls,alt) {const img=el('img',cls);img.src=url;img.alt=alt || '';img.loading='lazy';img.addEventListener('error',()=>{img.hidden=true;});return img;}
function renderArticles(){
  const q=norm($('#search').value),filter=$('#filter').value;
  const rows=state.articles.filter(a=>norm(a.title+' '+a.slug).includes(q) && (filter==='all'||filter==='locked'&&a.locked||filter==='review'&&!a.reviewed||filter==='missing'&&!a.image));
  $('#total').textContent=rows.length+' bài viết';$('#articles').replaceChildren();
  for(const a of rows.slice(0,state.limit)){
    const row=el('article','article-row');row.append(a.image?thumbnail(a.image,'thumb','Ảnh bìa bài viết'):el('span','thumb muted','Chưa có ảnh'));
    const copy=el('div');copy.append(el('h2','',a.title),el('span','muted',a.date?a.date.slice(0,10):'Bài viết'));
    const button=el('button','quiet','Đổi ảnh');button.addEventListener('click',()=>openEditor(a));
    row.append(copy,el('span','badge'+(a.locked?' locked':''),a.locked?'Đã khóa ảnh':a.reviewed?'Đã chọn ảnh':'Chưa duyệt ảnh'),button);$('#articles').append(row);
  }
  if(!rows.length)$('#articles').append(el('p','empty','Không có bài phù hợp.'));
  $('#more').hidden=rows.length<=state.limit;
}
function renderImages(){
  const q=norm($('#image-search').value);const rows=state.images.filter(i=>norm(i.path).includes(q));$('#images').replaceChildren();
  for(const image of rows.slice(0,state.imageLimit)){
    const button=el('button','image-choice');button.title=image.name;button.setAttribute('aria-pressed',String(state.selected?.imagePath===image.path));
    button.append(thumbnail(image.url,'',image.name),el('span','',image.name));
    button.addEventListener('click',()=>{select({imagePath:image.path,url:image.url,name:image.name});renderImages();});$('#images').append(button);
  }
  if(!rows.length)$('#images').append(el('p','muted','Không tìm thấy ảnh.'));
  $('#more-images').hidden=rows.length<=state.imageLimit;
}
function select(selected){
  if(!state.ready||state.busy)return;
  state.selected=selected;$('#preview').src=selected.url;$('#preview').hidden=false;$('#no-preview').hidden=true;$('#selection').textContent=selected.name || '';
  $('#save').disabled=state.busy||!selected;$('#editor-status').textContent='';
}
async function openEditor(article){
  if(state.busy)return;
  state.current=article;state.selected=null;state.ready=false;$('#article-title').textContent=article.title;$('#editor-status').textContent='Đang đọc ảnh hiện tại…';$('#save').disabled=true;
  $('#alt').value='';$('#upload').value='';$('#history-items').replaceChildren();$('#preview').hidden=true;$('#no-preview').hidden=false;$('#selection').textContent='';
  $('#image-search').value='';state.imageLimit=36;$('#library').hidden=false;renderImages();$('#editor').showModal();state.busy=true;
  try{
    const detail=await api('detail&slug='+encodeURIComponent(article.slug));state.current={...article,...detail};state.ready=true;
    $('#article-title').textContent=detail.title || article.title;$('#alt').value=detail.alt || detail.title || article.title;
    $('#view-article').href='/blog/'+article.slug+'.html';
    if(detail.imageUrl){$('#preview').src=detail.imageUrl;$('#preview').hidden=false;$('#no-preview').hidden=true;}
    for(const h of [...(detail.override?.history || [])].reverse()){
      let path;try{path=decodeURIComponent(h.src.replace(/^\.\.\//,''));}catch{continue;}
      const image=state.images.find(i=>i.path===path);if(!image)continue;
      const button=el('button','quiet');button.title='Khôi phục ảnh này';button.append(thumbnail(image.url,'','Ảnh trước đó'));
      button.addEventListener('click',()=>{select({imagePath:image.path,url:image.url,name:image.name});$('#alt').value=h.alt || detail.title;renderImages();});$('#history-items').append(button);
    }
    $('#history').hidden=!$('#history-items').children.length;$('#editor-status').textContent='';
  }catch(error){$('#editor-status').textContent=error.message;}
  finally{state.busy=false;}
}
function closeEditor(){if(state.busy)return;$('#editor').close();if(state.blob){URL.revokeObjectURL(state.blob);state.blob=null;}}
$('#close').addEventListener('click',closeEditor);$('#cancel').addEventListener('click',closeEditor);
$('#editor').addEventListener('cancel',event=>{if(state.busy)event.preventDefault();});
$('#upload').addEventListener('change',async event=>{
  const file=event.target.files[0];if(!file)return;
  if(file.size>2900000){$('#editor-status').textContent='Chọn ảnh nhỏ hơn 2,9 MB.';event.target.value='';return;}
  if(!/\.(jpe?g|png|webp|jfif)$/i.test(file.name)){$('#editor-status').textContent='Chọn ảnh JPG, PNG hoặc WebP.';return;}
  if(state.blob)URL.revokeObjectURL(state.blob);state.blob=URL.createObjectURL(file);
  const reader=new FileReader();reader.onload=()=>select({upload:String(reader.result).split(',')[1],url:state.blob,name:file.name});reader.readAsDataURL(file);
});
$('#save').addEventListener('click',async()=>{
  if(state.busy||!state.selected)return;
  if($('#alt').value.trim().length<3){$('#editor-status').textContent='Vui lòng nhập mô tả ảnh.';return;}
  state.busy=true;$('#save').disabled=true;$('#editor-status').textContent='Đang lưu ảnh và khóa lựa chọn…';
  try{
    const saved=await api('save',{slug:state.current.slug,revision:state.current.revision,alt:$('#alt').value.trim(),imagePath:state.selected.imagePath,upload:state.selected.upload});
    if(saved.imagePath&&!state.images.some(i=>i.path===saved.imagePath))state.images.unshift({path:saved.imagePath,url:saved.imageUrl,name:saved.imagePath.split('/').pop()});
    state.busy=false;closeEditor();$('#status').textContent='Đã lưu và khóa ảnh. Website sẽ hiển thị sau khi Vercel triển khai xong.';
    const row=state.articles.find(a=>a.slug===state.current.slug);Object.assign(row,{image:saved.imageUrl,locked:true,reviewed:true});renderArticles();
  }catch(error){$('#editor-status').textContent=error.message;state.busy=false;$('#save').disabled=false;}
});
$('#search').addEventListener('input',()=>{state.limit=30;renderArticles();});$('#filter').addEventListener('change',()=>{state.limit=30;renderArticles();});
$('#image-search').addEventListener('input',()=>{state.imageLimit=36;renderImages();});$('#more-images').addEventListener('click',()=>{state.imageLimit+=36;renderImages();});
$('#more').addEventListener('click',()=>{state.limit+=30;renderArticles();});$('#library-toggle').addEventListener('click',()=>{$('#library').hidden=!$('#library').hidden;});
async function load(){
  $('#status').textContent='Đang đọc danh sách bài viết…';$('#refresh').disabled=true;
  try{const data=await api('list');state.articles=data.articles;state.images=data.images;renderArticles();$('#status').textContent='';}
  catch(error){$('#status').textContent=error.message;}finally{$('#refresh').disabled=false;}
}
$('#refresh').addEventListener('click',load);$('#logout').addEventListener('click',async()=>{try{await api('logout',{});location.replace('/admin/');}catch(error){$('#status').textContent=error.message;}});load();
