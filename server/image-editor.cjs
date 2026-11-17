const { parse } = require('parse5');
const crypto = require('node:crypto');

const escape = (s) => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const attr = (node, key) => node.attrs?.find(a => a.name === key)?.value;
const classes = node => (attr(node, 'class') || '').split(/\s+/);
function walk(node, callback, parents = []) {
  callback(node, parents);
  for (const child of node.childNodes || []) walk(child, callback, [...parents, node]);
}
function inspect(source) {
  const doc = parse(source, { sourceCodeLocationInfo: true });
  let title = '', image = '', alt = '';
  walk(doc, (n, parents) => {
    if (n.tagName === 'h1') {
      walk(n, c => { if (c.nodeName === '#text') title += c.value; });
    }
    if (n.tagName === 'img' && parents.some(p => classes(p).includes('article-cover'))) {
      image = attr(n, 'src') || ''; alt = attr(n, 'alt') || '';
    }
  });
  return { title, image, alt };
}
function updateHtml(source, selected, slug = null) {
  const edits = [];
  walk(parse(source, { sourceCodeLocationInfo: true }), (n, parents) => {
    if (slug === null && n.tagName === 'meta' && n.sourceCodeLocation) {
      const key = attr(n, 'property') || attr(n, 'name');
      if (['og:image','twitter:image','og:image:alt','twitter:image:alt'].includes(key)) {
        const value = key.endsWith(':alt') ? selected.alt : 'https://www.hanseongbeauty.com/' + selected.src.replace(/^\.\.\//,'');
        const attrs = n.attrs.filter(a => a.name !== 'content');
        attrs.push({ name:'content',value });
        edits.push([n.sourceCodeLocation.startOffset,n.sourceCodeLocation.endOffset,'<meta '+attrs.map(a=>`${a.name}="${escape(a.value)}"`).join(' ')+'>']);
      }
    }
    if (n.tagName !== 'img' || !n.sourceCodeLocation) return;
    const matches = slug === null
      ? parents.some(p => classes(p).includes('article-cover'))
      : parents.some(p => p.tagName === 'a' && classes(p).includes('story-card') && attr(p, 'href') === slug + '.html');
    if (!matches) return;
    const loc = n.sourceCodeLocation;
    const attrs = (n.attrs || []).filter(a => !['src', 'alt', 'srcset', 'sizes'].includes(a.name));
    attrs.push({ name: 'src', value: selected.src }, { name: 'alt', value: selected.alt });
    edits.push([loc.startOffset, loc.endOffset, '<img ' + attrs.map(a => `${a.name}="${escape(a.value)}"`).join(' ') + '>']);
  });
  if (slug === null && !edits.some(e => e[2].startsWith('<img '))) throw Object.assign(new Error('Bai nay chua co khung anh tuong thich. Khong thay doi du lieu.'), { status: 422 });
  for (const [start, end, value] of edits.sort((a,b) => b[0]-a[0])) source = source.slice(0,start) + value + source.slice(end);
  return source;
}
function validSlug(value) { return typeof value === 'string' && /^[a-z0-9][a-z0-9-]{0,180}$/.test(value); }
function validImage(value) {
  return typeof value === 'string' && value.startsWith('assets/images/') &&
    !value.split('/').some(p => !p || p === '.' || p === '..') &&
    !/[\\\x00-\x1f?#%]/.test(value) && /\.(jpe?g|png|webp|jfif)$/i.test(value);
}
function session(secret, password, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ exp: now + 4*60*60*1000, v: crypto.createHash('sha256').update(password).digest('hex') })).toString('base64url');
  return payload + '.' + crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}
function equal(a, b) {
  const x = crypto.createHash('sha256').update(String(a)).digest();
  const y = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(x,y);
}
function authenticated(token, secret, password, now = Date.now()) {
  if (typeof token !== 'string' || token.length > 1500) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig || !equal(sig, crypto.createHmac('sha256', secret).update(payload).digest('base64url'))) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return data.exp > now && data.exp <= now + 4*60*60*1000 && equal(data.v, crypto.createHash('sha256').update(password).digest('hex'));
  } catch { return false; }
}
module.exports = { inspect, updateHtml, validSlug, validImage, session, authenticated, equal };
