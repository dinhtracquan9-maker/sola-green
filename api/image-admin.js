const { session, authenticated, equal } = require('../server/image-editor.cjs');
const { client } = require('../server/github-editor.cjs');
const dashboard = require('../server/admin-page.cjs');
const attempts = new Map();
const COOKIE = '__Host-hanseong_editor';
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control','no-store, private');
  res.setHeader('X-Robots-Tag','noindex, nofollow, noarchive');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','no-referrer');
  res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' blob:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
  const json = (status,value) => { res.statusCode=status; res.setHeader('Content-Type','application/json; charset=utf-8'); res.end(JSON.stringify(value)); };
  const password=process.env.IMAGE_ADMIN_PASSWORD || '', secret=process.env.IMAGE_ADMIN_SESSION_SECRET || '', token=process.env.IMAGE_ADMIN_GITHUB_TOKEN || '';
  if(password.length<24 || secret.length<32 || !token) return json(503,{error:'Trang quản trị chưa được kích hoạt. Cần cấu hình bảo mật trên Vercel.'});
  const origin=process.env.IMAGE_ADMIN_ORIGIN || 'https://www.hanseongbeauty.com';
  const url=new URL(req.url,origin), action=url.searchParams.get('action') || 'session';
  if(req.method!==(['login','logout','save'].includes(action)?'POST':'GET')) return json(405,{error:'Phương thức không hợp lệ.'});
  if(req.method==='POST' && (req.headers.origin!==origin || !/^application\/json(?:;|$)/i.test(req.headers['content-type'] || ''))) return json(403,{error:'Yêu cầu không được phép.'});
  try {
    const body=req.method==='POST'?(typeof req.body==='string'?JSON.parse(req.body):req.body || {}):{};
    if(action==='login') {
      const key=String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').slice(0,200), now=Date.now();
      for(const [k,v] of attempts) if(v.until<now) attempts.delete(k);
      if(attempts.size>5000) return json(429,{error:'Vui lòng thử lại sau.'});
      const entry=attempts.get(key) || {count:0,until:now+60000};
      if(entry.count>=5) return json(429,{error:'Quá nhiều lần thử. Vui lòng đợi một phút.'});
      entry.count++; attempts.set(key,entry);
      if(typeof body.password!=='string' || body.password.length>500 || !equal(body.password,password)) { await new Promise(r=>setTimeout(r,1000)); return json(401,{error:'Mật khẩu không đúng.'}); }
      attempts.delete(key);
      res.setHeader('Set-Cookie',`${COOKIE}=${session(secret,password)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=14400`);
      return json(200,{ok:true});
    }
    const cookies=Object.fromEntries(String(req.headers.cookie || '').split(';').map(x=>x.trim().split(/=(.*)/s).slice(0,2)));
    if(!authenticated(cookies[COOKIE],secret,password)) return json(401,{error:'Vui lòng đăng nhập lại.'});
    if(action==='logout') { res.setHeader('Set-Cookie',`${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`); return json(200,{ok:true}); }
    if(action==='session') return json(200,{ok:true});
    if(action==='dashboard') { res.setHeader('Content-Type','text/html; charset=utf-8'); return res.end(dashboard); }
    const github=client(token);
    if(action==='list') return json(200,await github.listing());
    if(action==='detail') return json(200,await github.detail(url.searchParams.get('slug')));
    if(action==='save') return json(200,await github.save(body));
    return json(404,{error:'Không tìm thấy thao tác.'});
  } catch(error) { return json(error.status || 500,{error:error.status?error.message:'Không thể hoàn tất. Tải lại bài để kiểm tra trước khi thử lưu lần nữa.'}); }
};
