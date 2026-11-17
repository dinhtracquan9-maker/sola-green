const { inspect, updateHtml, validSlug, validImage } = require('./image-editor.cjs');
const sharp = require('sharp');
const crypto = require('node:crypto');
const REPO = 'dinhtracquan9-maker/sola-green';
const BRANCH = 'main';
const problem = (message, status = 400) => Object.assign(new Error(message), { status });
const encodedPath = p => p.split('/').map(encodeURIComponent).join('/');
function publicUrl(value) {
  let path;
  try { path = decodeURIComponent(value.replace(/^(\.\.\/|\/)/, '')); } catch { return ''; }
  return validImage(path) ? '/' + encodedPath(path) : '';
}

function client(token, fetcher = fetch) {
  async function api(path, method = 'GET', data) {
    const response = await fetcher('https://api.github.com/repos/' + REPO + '/' + path, {
      method, headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'Hanseong-Image-Editor', 'Content-Type': 'application/json' },
      body: data === undefined ? undefined : JSON.stringify(data), signal: AbortSignal.timeout(20000)
    });
    if (!response.ok) throw problem(response.status === 409 || response.status === 422 ? 'Du lieu vua thay doi. Tai lai danh sach truoc khi luu.' : 'Khong the ket noi kho bai viet. Kiem tra quyen GitHub tren Vercel.', response.status === 409 || response.status === 422 ? 409 : 502);
    return response.json();
  }
  async function snapshot() {
    const ref = await api('git/ref/heads/' + BRANCH);
    const revision = ref.object.sha;
    const tree = await api('git/trees/' + revision + '?recursive=1');
    if (tree.truncated) throw problem('Kho anh qua lon; can phan trang truoc khi tiep tuc.', 422);
    const files = new Map(tree.tree.filter(x => x.type === 'blob').map(x => [x.path,x.sha]));
    async function read(path, optional = false) {
      if (!files.has(path)) { if(optional) return null; throw problem('Khong tim thay tep can cap nhat.',404); }
      const blob = await api('git/blobs/' + files.get(path));
      return Buffer.from(blob.content.replace(/\s/g,''), 'base64').toString('utf8');
    }
    return { revision, treeSha: tree.sha, files, read };
  }
  async function listing() {
    const snap = await snapshot();
    const queue = JSON.parse(await snap.read('data/blog_queue.json'));
    const overrides = JSON.parse(await snap.read('data/article_image_overrides.json', true) || '{"version":1,"articles":{}}');
    const bySlug = new Map(queue.topics.filter(t => t.slug).map(t => [t.slug,t]));
    const articles = [...snap.files.keys()].filter(p => /^blog\/[a-z0-9-]+\.html$/.test(p) && p !== 'blog/index.html').map(p => {
      const slug = p.slice(5,-5), t = bySlug.get(slug) || {}, o = overrides.articles[slug];
      const image = o?.src || t.image || '';
      return { slug, title: t.title || slug.replaceAll('-',' '), date: t.published_at || '', image: image ? publicUrl(image) : '', locked: !!o?.locked, reviewed: !!o, product: o?.product_id || '' };
    }).sort((a,b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
    const images = [...snap.files.keys()].filter(validImage).map(path => ({ path, url: publicUrl(path), name: path.split('/').pop() }));
    return { revision: snap.revision, articles, images };
  }
  async function detail(slug) {
    if (!validSlug(slug)) throw problem('Ma bai viet khong hop le.');
    const snap = await snapshot(), source = await snap.read('blog/' + slug + '.html');
    const overrides = JSON.parse(await snap.read('data/article_image_overrides.json', true) || '{"version":1,"articles":{}}');
    const info = inspect(source);
    return { revision: snap.revision, ...info, imageUrl: info.image ? publicUrl(info.image) : '', override: overrides.articles[slug] || null };
  }
  async function save(input) {
    if (!validSlug(input.slug) || typeof input.revision !== 'string' || !/^[a-f0-9]{40}$/.test(input.revision)) throw problem('Du lieu bai viet khong hop le.');
    if (typeof input.alt !== 'string' || input.alt.trim().length < 3 || input.alt.length > 300) throw problem('Mo ta anh can tu 3 den 300 ky tu.');
    const snap = await snapshot();
    if (snap.revision !== input.revision) throw problem('Co thay doi moi. Tai lai bai viet truoc khi luu.',409);
    const pagePath = 'blog/' + input.slug + '.html';
    const source = await snap.read(pagePath);
    const index = await snap.read('blog/index.html');
    const queue = JSON.parse(await snap.read('data/blog_queue.json'));
    const store = JSON.parse(await snap.read('data/article_image_overrides.json',true) || '{"version":1,"articles":{}}');
    let imagePath = input.imagePath, upload;
    if (input.upload) {
      if (typeof input.upload !== 'string' || input.upload.length > 4000000 || !/^[A-Za-z0-9+/]+={0,2}$/.test(input.upload)) throw problem('Anh tai len qua lon hoac khong hop le.');
      const raw = Buffer.from(input.upload,'base64');
      const pipeline = sharp(raw, { limitInputPixels: 25000000, animated: false });
      const meta = await pipeline.metadata();
      if (!['jpeg','png','webp'].includes(meta.format) || (meta.pages || 1) > 1) throw problem('Chi chap nhan anh JPG, PNG hoac WebP tinh.');
      upload = await pipeline.rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 86 }).toBuffer();
      imagePath = 'assets/images/editorial/' + crypto.createHash('sha256').update(upload).digest('hex').slice(0,24) + '.webp';
    }
    if (!validImage(imagePath) || (!upload && !snap.files.has(imagePath))) throw problem('Hay chon anh co trong thu vien.');
    const selected = { src: '../' + encodedPath(imagePath), alt: input.alt.trim() };
    const updated = updateHtml(source,selected);
    const updatedIndex = updateHtml(index,selected,input.slug);
    const prev = store.articles[input.slug];
    const history = [...(prev?.history || [])];
    const current = inspect(source);
    if (!history.length || history.at(-1).src !== current.image || history.at(-1).alt !== current.alt) history.push({ src: current.image, alt: current.alt, changed_at: new Date().toISOString() });
    store.articles[input.slug] = { ...selected, locked: true, updated_at: new Date().toISOString(), history: history.slice(-20) };
    for (const topic of queue.topics) if (topic.slug === input.slug) Object.assign(topic,{ image: selected.src, image_alt: selected.alt, image_locked: true });
    const entries = [];
    for (const [path,content] of [[pagePath,updated],['blog/index.html',updatedIndex],['data/blog_queue.json',JSON.stringify(queue,null,2)+'\n'],['data/article_image_overrides.json',JSON.stringify(store,null,2)+'\n']]) {
      const blob = await api('git/blobs','POST',{ content, encoding:'utf-8' });
      entries.push({ path, mode:'100644',type:'blob',sha:blob.sha });
    }
    if(upload) { const blob = await api('git/blobs','POST',{ content: upload.toString('base64'),encoding:'base64' }); entries.push({ path:imagePath,mode:'100644',type:'blob',sha:blob.sha }); }
    const tree = await api('git/trees','POST',{ base_tree:snap.treeSha,tree:entries });
    const commit = await api('git/commits','POST',{ message:'Editorial: update image for '+input.slug+' [skip ci]', tree:tree.sha,parents:[snap.revision] });
    // Never force an update: an intervening publishing job must not be overwritten.
    await api('git/refs/heads/'+BRANCH,'PATCH',{ sha:commit.sha,force:false });
    return { revision:commit.sha,imagePath,imageUrl:publicUrl(imagePath),locked:true };
  }
  return { listing, detail, save };
}
module.exports = { client, publicUrl };
