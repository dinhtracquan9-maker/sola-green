import argparse, html, json, os, re, sys, urllib.error, urllib.parse, urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PRODUCTS_JS = ROOT / "assets" / "data" / "products.js"
OUT = ROOT / "products"
SITE = "https://www.hanseongbeauty.com"
WA = "https://wa.me/84921909928"

def env(name):
    v = os.getenv(name, "").strip()
    if not v: raise RuntimeError(f"Missing GitHub secret: {name}")
    return v

def slugify(value):
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")

def parse_products():
    src = PRODUCTS_JS.read_text(encoding="utf-8")
    items, seen = [], set()
    for m in re.finditer(r"\{[^{}]*\}", src):
        o = m.group(0)
        n = re.search(r"name:\s*'([^']+)'", o)
        if not n: continue
        def g(k):
            r = re.search(k + r":\s*'([^']*)'", o); return r.group(1) if r else ""
        name = n.group(1); slug = slugify(name)
        if not slug or slug in seen: continue
        seen.add(slug)
        items.append({"name": name, "category": g("category"), "brand": g("brand"),
                      "origin": g("origin"), "tag": g("tag"), "image": g("image"), "slug": slug})
    return items

def generate(p):
    prompt = f'''Write B2B procurement website copy for the product "{p['name']}" (brand: {p['brand'] or 'n/a'}, origin: {p['origin'] or 'n/a'}, category: {p['category']}), sold WHOLESALE by HANSEONG BEAUTY GLOBAL to clinics, spas, resellers and distributors.
This is sourcing/procurement information for professional buyers. It is NOT medical advice and NOT consumer marketing.
Hard rules: do NOT state medical efficacy, dosing, treatment outcomes, prices, stock levels, certifications, regulatory approvals, or claim HANSEONG BEAUTY GLOBAL is an authorised/official distributor. No patient-facing claims.
Focus on: a neutral category-level description of what this product is, what professional buyers evaluate when sourcing it wholesale (authenticity, documentation, storage/cold-chain handling, shipping and lead time), and how to request a wholesale quote.
Return JSON only with keys: meta_description (max 150 chars), intro (35-50 words, plain text), body_html.
body_html: 250-350 words using ONLY these tags: h2, h3, p, ul, li, strong, em. Use 3 H2 sections and one checklist (ul).'''
    payload = json.dumps({"model": env("BLOG_MODEL"), "temperature": 0.5, "max_tokens": 1600,
        "messages": [{"role": "system", "content": "You are a careful B2B editor. Return valid JSON only."},
                     {"role": "user", "content": prompt}]}).encode()
    req = urllib.request.Request(env("BLOG_API_URL"), data=payload,
        headers={"Authorization": f"Bearer {env('BLOG_API_KEY')}", "Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=120) as r: result = json.loads(r.read().decode())
    except urllib.error.HTTPError as exc:
        raise RuntimeError(f"API HTTP {exc.code}: {exc.read().decode(errors='replace')[:500]}") from exc
    try: text = result["choices"][0]["message"]["content"].strip()
    except (KeyError, IndexError, TypeError) as exc:
        raise RuntimeError("API is not chat/completions compatible") from exc
    text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text, flags=re.I)
    return json.loads(text)

def validate(a):
    for k in ("meta_description", "intro", "body_html"):
        if not isinstance(a.get(k), str) or not a[k].strip(): raise RuntimeError(f"Missing field: {k}")
    if len(a["meta_description"]) > 160: raise RuntimeError("meta_description too long")
    bad = re.search(r"<(script|style|iframe|img|a|form)\b", a["body_html"], re.I)
    if bad: raise RuntimeError(f"Forbidden tag: {bad.group(1)}")
    if len(re.sub(r"<[^>]+>", " ", a["body_html"]).split()) < 150: raise RuntimeError("body too short")

def page(p, a):
    name = html.escape(p["name"]); desc = html.escape(a["meta_description"], quote=True)
    cat = html.escape(p["category"]); brand = html.escape(p["brand"] or "International")
    origin = html.escape(p["origin"] or "International"); img = "../" + p["image"]
    img_abs = f"{SITE}/{p['image']}"; url = f"{SITE}/products/{p['slug']}.html"
    wa_link = f"{WA}?text=" + urllib.parse.quote(f"Hi! I'm interested in your products and would like a wholesale quotation.\nProduct: {p['name']}\nDestination country: ")
    ld = json.dumps({"@context": "https://schema.org", "@graph": [
        {"@type": "Product", "name": p["name"], "image": img_abs, "category": p["category"],
         "brand": {"@type": "Brand", "name": p["brand"] or "HANSEONG BEAUTY GLOBAL"},
         "description": a["meta_description"], "url": url},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{SITE}/index.html"},
            {"@type": "ListItem", "position": 2, "name": "Products", "item": f"{SITE}/products.html"},
            {"@type": "ListItem", "position": 3, "name": p["name"], "item": url}]}]}, ensure_ascii=False)
    nav = '<nav class="nav"><div class="wrap nav-inner"><a class="brand brand-logo" href="../index.html"><img src="../assets/icons/logoNgang.png" alt="HANSEONG BEAUTY GLOBAL"></a><div class="article-nav"><a href="../products.html">← All products</a><a class="btn primary" href="../products.html">Build a quote list</a></div></div></nav>'
    footer = '<footer class="footer new-footer"><div class="wrap"><div class="footer-top"><div><img src="../assets/icons/logoNgang.png" alt="HANSEONG BEAUTY GLOBAL"><p>Professional aesthetic wholesale supply for clinics, spas, resellers and distributors worldwide.</p></div><div><b>Explore</b><a href="../products.html">Products</a><a href="../brands.html">Brands</a><a href="../blog/index.html">Journal</a></div><div><b>Company</b><a href="../about.html">About HANSEONG</a><a href="../faq.html">FAQ</a><a href="../contact.html">Contact</a></div><div><b>Connect</b><a href="https://wa.me/84921909928">WhatsApp</a><a href="mailto:hanseongbeauty@gmail.com">Email sales</a></div></div><div class="footer-bottom"><span>© 2026 HANSEONG BEAUTY GLOBAL</span><span>Professional buyers only · Availability varies by market</span></div></div></footer>'
    return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{name} Wholesale | HANSEONG BEAUTY GLOBAL</title><meta name="description" content="{desc}"><link rel="canonical" href="{url}"><meta property="og:type" content="product"><meta property="og:title" content="{name} Wholesale | HANSEONG BEAUTY GLOBAL"><meta property="og:description" content="{desc}"><meta property="og:image" content="{img_abs}"><link rel="icon" href="../assets/icons/logo.png"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet"><link rel="stylesheet" href="../assets/css/style.css"><script type="application/ld+json">{ld}</script></head><body class="article-page">{nav}<main><header class="article-hero"><div class="wrap article-wrap"><span>{html.escape(p["category"].upper())} · WHOLESALE</span><h1>{name}</h1><p>{desc}</p><div class="article-meta"><a href="../index.html">Home</a> › <a href="../products.html">Products</a> › {name}</div></div></header><div class="article-cover wrap"><img src="{img}" alt="{name}" loading="lazy"></div><article class="article-body article-wrap"><p class="article-intro">{html.escape(a["intro"])}</p>{a["body_html"]}<div class="article-callout"><b>Product at a glance</b><ul><li><strong>Brand:</strong> {brand}</li><li><strong>Origin:</strong> {origin}</li><li><strong>Category:</strong> {cat}</li></ul></div><div class="article-end"><h2>Request a wholesale quote for {name}</h2><p>Send your destination country and quantity. Our team will help you check current availability and shipping options.</p><a class="btn primary" href="{wa_link}">Request quotation on WhatsApp →</a></div><p class="disclaimer">General procurement information for professional buyers. Not medical, legal, regulatory or import advice. Product availability varies by market.</p></article></main>{footer}<script src="../assets/js/main.js"></script></body></html>'''

def build_sitemap():
    urls = []
    for f in ["index.html", "products.html", "brands.html", "catalogue.html", "shipping.html", "about.html", "faq.html", "contact.html"]:
        if (ROOT / f).exists(): urls.append(f"{SITE}/{f}")
    for d in ["blog", "products"]:
        p = ROOT / d
        if p.exists():
            for f in sorted(p.glob("*.html")): urls.append(f"{SITE}/{d}/{f.name}")
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    body = "".join(f"<url><loc>{u}</loc><lastmod>{today}</lastmod></url>" for u in urls)
    (ROOT / "sitemap.xml").write_text(
        f'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{body}</urlset>\n',
        encoding="utf-8")
    (ROOT / "robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {SITE}/sitemap.xml\n", encoding="utf-8")
    return len(urls)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    ap.add_argument("--limit", type=int, default=int(os.getenv("BUILD_LIMIT", "60")))
    args = ap.parse_args()
    env("BLOG_API_URL"); env("BLOG_API_KEY"); env("BLOG_MODEL")
    products = parse_products()
    if args.check:
        print(f"Configuration valid. {len(products)} products parsed."); return
    OUT.mkdir(exist_ok=True)
    made = 0
    for p in products:
        target = OUT / f"{p['slug']}.html"
        if target.exists(): continue
        if made >= args.limit: break
        try:
            a = generate(p); validate(a)
        except Exception as exc:
            print(f"SKIP {p['slug']}: {exc}", file=sys.stderr); continue
        target.write_text(page(p, a), encoding="utf-8"); made += 1
        print(f"built products/{p['slug']}.html")
    total = build_sitemap()
    remaining = sum(1 for p in products if not (OUT / f"{p['slug']}.html").exists())
    print(f"Built {made} new page(s). Sitemap has {total} URLs. {remaining} product page(s) still pending.")

if __name__ == "__main__":
    try: main()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr); sys.exit(1)
