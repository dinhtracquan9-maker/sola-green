import argparse, html, json, os, re, sys, urllib.error, urllib.request
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
QUEUE, BLOG = ROOT / "data" / "blog_queue.json", ROOT / "blog"
INDEX = BLOG / "index.html"
START, END = "<!-- AUTO_POSTS_START -->", "<!-- AUTO_POSTS_END -->"

TELEGRAM_URL = "https://t.me/+3aZiyqL7GRQyMDBl"
INSTAGRAM_URL = "https://www.instagram.com/hanseong_beauty_global/"
FACEBOOK_URL = "https://www.facebook.com/hanseongbeautyglobal/"

REAL_IMAGE_RULES = [
    (("allergan", "50"), "../assets/images/Allergan 50 unit.png"),
    (("allergan", "100"), "../assets/images/A Hung Allergan 100.jpg"),
    (("allergan",), "../assets/images/Allergan  full Image.jpg"),
    (("botox", "allergan"), "../assets/images/Botox Allergan 3.jpg"),
    (("botulax",), "../assets/images/Botulax full Image.jpg"),
    (("xeomin",), "../assets/images/Xeomin New Image.jfif"),
    (("rentox", "200"), "../assets/images/Rentox 200.jpg"),
    (("rentox",), "../assets/images/Rentox 100.jfif"),
    (("innotox",), "../assets/images/Phân biệt Innotox anh Hưng 4.jpg"),
    (("juvederm",), "../assets/images/Juvederm Image 2.jpg"),
    (("neuramis",), "../assets/images/Neuramis Deep Image.jpg"),
    (("radiesse",), "../assets/images/Radiesse Image.jpg"),
    (("sculptra",), "../assets/images/Sculptra Image.jpg"),
    (("ultrafill",), "../assets/images/Ultrafill Image.webp"),
    (("vom",), "../assets/images/Vom 3 loai.jfif"),
    (("nabota",), "../assets/images/Nabota ảnh gốc 1.jpg"),
    (("rejuran", "healer"), "../assets/images/Rejuran Healer new Image.jpg"),
    (("rejuran",), "../assets/images/Rejuran Healer Image.jpg"),
    (("nctf",), "../assets/images/NCTF Image.jpg"),
    (("profhilo",), "../assets/images/Profhilo Image 2.jpg"),
    (("juvelook",), "../assets/images/Juvelook Image.jpg"),
    (("asce",), "../assets/images/Asce Image.jpg"),
    (("olidia",), "../assets/images/Olidia image.jpg"),
    (("hairna",), "../assets/images/Hairna Image 2.jpg"),
    (("sedy", "fill"), "../assets/images/Sedy Fill Body Image.jpg"),
    (("senorita",), "../assets/images/Senorita Filler Image.jfif"),
    (("lemon", "bottle"), "../assets/images/Lemon Bottle full image.jpg"),
    (("lipo", "vela"), "../assets/images/Lipo vela Image.jpg"),
    (("lipo", "lab"), "../assets/images/Lipo Lab auth.jfif"),
    (("glutax",), "../assets/images/Glutax 50000000 Image.jpg"),
    (("mounjaro",), "../assets/images/Mounjaro Image.jpg"),
]

CATEGORY_LINKS = {
    "Botulinum Toxin": "../products.html?category=Botulinum%20Toxin",
    "Dermal Fillers": "../products.html?category=Dermal%20Fillers",
    "Skin Boosters": "../products.html?category=Skin%20Booster%20%2F%20Meso",
    "Skin Boosters / PN": "../products.html?category=Skin%20Booster%20%2F%20Meso",
    "Exosome & Meso": "../products.html?category=Skin%20Booster%20%2F%20Meso",
    "Biostimulators": "../products.html?category=Biostimulator",
    "Body Fillers": "../products.html?category=Dermal%20Fillers",
    "Lipolysis": "../products.html?category=Fat%20Dissolving%20%2F%20Weight%20Loss",
    "Weight Management": "../products.html?category=Fat%20Dissolving%20%2F%20Weight%20Loss",
    "IV & Wellness": "../products.html?category=Wellness%20%2F%20Injection",
    "Injection Supplies": "../products.html?category=Supplies%20%2F%20Anesthetic",
    "Numbing & Supplies": "../products.html?category=Supplies%20%2F%20Anesthetic",
}

EXTERNAL_REFERENCES = [
    ("FDA guidance on dermal fillers and botulinum toxin products", "https://www.fda.gov/consumers/consumer-updates/dermal-filler-dos-and-donts-wrinkles-lips-and-more"),
    ("FDA overview of what the agency regulates and approves", "https://www.fda.gov/consumers/consumer-updates/what-does-fda-approve-part-2"),
    ("International Trade Administration export solutions", "https://www.trade.gov/export-solutions"),
]

def env(name):
    value = os.getenv(name, "").strip()
    if not value:
        raise RuntimeError(f"Missing GitHub secret: {name}")
    return value

def load_queue():
    try:
        data = json.loads(QUEUE.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"Invalid blog_queue.json: {exc}") from exc
    if not isinstance(data.get("topics"), list) or not isinstance(data.get("published"), list):
        raise RuntimeError("blog_queue.json requires topics[] and published[]")
    return data

def slugify(value):
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")[:78]

def generate(topic):
    category_url = CATEGORY_LINKS.get(topic["category"], "../products.html")
    prompt = f'''Write an original English article for HANSEONG BEAUTY GLOBAL's professional buyer journal.
Title brief: {topic['title']}
Keyword: {topic['keyword']}; Category: {topic['category']}.
CRITICAL LENGTH REQUIREMENT: html_body must contain AT LEAST 950 words of body text (excluding HTML tags). Write 6 to 8 H2 sections, each with 2-3 full paragraphs of 3-5 sentences, plus one checklist (ul/li). Do not summarise, do not stop early, do not write a short article. Aim for 1000-1200 words. Audience: clinics, spas, resellers and distributors. This is procurement education, not medical advice. Never invent certifications, partnerships, prices, stock, approvals or customer results. Do not claim HANSEONG BEAUTY GLOBAL is an authorised distributor. Mention HANSEONG BEAUTY GLOBAL only in the closing CTA.
Internal link context to naturally mention in plain text: product catalogue {category_url}, quote/contact page ../contact.html, shipping support ../shipping.html, brand overview ../brands.html.
External source context to mention only as general reference topics, not as claims about this product: FDA pages for dermal fillers/botulinum toxin and general export documentation resources.
Return JSON only: title, meta_description (max 155 chars), excerpt (35-50 words), read_time, html_body. html_body may use only h2, h3, p, ul, li, strong and em tags. Do not output a tags; links are added by the website automation.'''
    payload = json.dumps({"model": env("BLOG_MODEL"), "temperature": 0.5, "max_tokens": 4000, "messages": [{"role": "system", "content": "You are a careful B2B editor. Return valid JSON only."}, {"role": "user", "content": prompt}]}).encode()
    request = urllib.request.Request(env("BLOG_API_URL"), data=payload, headers={"Authorization": f"Bearer {env('BLOG_API_KEY')}", "Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(request, timeout=120) as response:
            result = json.loads(response.read().decode())
    except urllib.error.HTTPError as exc:
        raise RuntimeError(f"API HTTP {exc.code}: {exc.read().decode(errors='replace')[:600]}") from exc
    try:
        text = result["choices"][0]["message"]["content"].strip()
    except (KeyError, IndexError, TypeError) as exc:
        raise RuntimeError("API is not chat/completions compatible") from exc
    text = re.sub(r"^```(:json)?\s*|\s*```$", "", text, flags=re.I)
    try:
        return json.loads(text)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"Model returned invalid JSON: {exc}") from exc

def validate(a):
    for key in ("title", "meta_description", "excerpt", "read_time", "html_body"):
        if not isinstance(a.get(key), str) or not a[key].strip():
            raise RuntimeError(f"Missing generated field: {key}")
    if len(a["meta_description"]) > 160:
        raise RuntimeError("Meta description exceeds 160 characters")
    bad = re.search(r"<(script|style|iframe|img|a|form)\b", a["html_body"], re.I)
    if bad:
        raise RuntimeError(f"Forbidden generated tag: {bad.group(1)}")
    words = len(re.sub(r"<[^>]+>", " ", a["html_body"]).split())
    if words < 600:
        raise RuntimeError(f"Article too short: {words} words")

def image_exists(article_src):
    if not article_src.startswith("../"):
        return False
    return (ROOT / article_src[3:]).exists()

def select_cover(topic):
    text = f"{topic.get('keyword', '')} {topic.get('title', '')}".lower()
    for needles, image in REAL_IMAGE_RULES:
        if all(needle in text for needle in needles) and image_exists(image):
            return image
    image = topic.get("image") or "../assets/images/products-1.png"
    return image if image_exists(image) else "../assets/images/products-1.png"

def related_links(topic):
    category_url = CATEGORY_LINKS.get(topic["category"], "../products.html")
    product_name = topic["keyword"].replace(" wholesale", "").replace(" supplier", "").replace(" sourcing", "").replace(" for clinics", "").strip()
    product_query = quote(product_name)
    refs = "".join(
        f'<li><a href="{html.escape(url, quote=True)}" target="_blank" rel="noopener noreferrer">{html.escape(label)}</a></li>'
        for label, url in EXTERNAL_REFERENCES
    )
    return f'''<section class="article-links"><h2>Buyer research links</h2><div class="article-link-grid"><div><h3>Internal HANSEONG links</h3><ul><li><a href="{category_url}">Browse this product category</a></li><li><a href="../products.html?q={product_query}">Search {html.escape(product_name)} in the catalogue</a></li><li><a href="../brands.html">Compare related brands</a></li><li><a href="../shipping.html">Check international shipping support</a></li><li><a href="../contact.html">Request a wholesale quote</a></li></ul></div><div><h3>External reference links</h3><ul>{refs}</ul></div></div></section>'''

def social_cta(topic):
    product_name = topic["keyword"].replace(" wholesale", "").replace(" supplier", "").replace(" sourcing", "").replace(" for clinics", "").strip()
    quote_message = quote(f"Hi HANSEONG BEAUTY GLOBAL, I would like a wholesale quote for {product_name}. Destination country:")
    shipping_message = quote(f"Hi HANSEONG BEAUTY GLOBAL, I want to check shipping options for {product_name}. Destination country:")
    price_message = quote("Hi HANSEONG BEAUTY GLOBAL, please send me the full wholesale price list.")
    return f'''<section class="article-contact-panel"><div class="article-contact-copy"><span>Professional buyer next steps</span><h2>Ready to check availability?</h2><p>Send your product list, estimated quantity and destination country. HANSEONG BEAUTY GLOBAL can help confirm current availability, packaging details and shipment options for professional buyers.</p></div><div class="article-contact-actions"><a class="btn primary" href="https://wa.me/84921909928?text={quote_message}" target="_blank" rel="noopener">Get wholesale quote</a><a class="btn" href="https://wa.me/84921909928?text={shipping_message}" target="_blank" rel="noopener">Check shipping</a> <a class="btn" href="https://wa.me/821021892675?text={quote_message}" target="_blank" rel="noopener">WhatsApp Korea: +82 10-2189-2675</a> <a class="btn" href="https://wa.me/84921909928?text={price_message}" target="_blank" rel="noopener">Request price list</a><a class="btn" href="{TELEGRAM_URL}" target="_blank" rel="noopener noreferrer">Join Telegram</a></div><div class="article-social-row"><a href="{INSTAGRAM_URL}" target="_blank" rel="noopener">Instagram</a><a href="{FACEBOOK_URL}" target="_blank" rel="noopener">Facebook</a><a href="../contact.html">Contact page</a></div><p class="disclaimer">General educational content for professional buyers. Product availability, import requirements and documentation vary by destination market.</p></section>'''

def page(a, slug, category, date, image, topic):
    title, desc = html.escape(a["title"]), html.escape(a["meta_description"], quote=True)
    image = html.escape(image, quote=True)
    return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{title} | HANSEONG BEAUTY GLOBAL</title><meta name="description" content="{desc}"><link rel="canonical" href="https://www.hanseongbeauty.com/blog/{slug}.html"><link rel="icon" href="../assets/icons/logo.png"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet"><link rel="stylesheet" href="../assets/css/style.css"></head><body class="article-page"><nav class="nav"><div class="wrap nav-inner"><a class="brand brand-logo" href="../index.html"><img src="../assets/icons/logoHeader.png" alt="HANSEONG BEAUTY GLOBAL"></a><div class="article-nav"><a href="index.html">← Journal</a><a class="btn primary" href="../products.html">Build a quote list</a></div></div></nav><main><header class="article-hero"><div class="wrap article-wrap"><span>{html.escape(category.upper())} · {html.escape(a['read_time'])}</span><h1>{title}</h1><p>{desc}</p><div class="article-meta">HANSEONG BEAUTY GLOBAL Editorial Team · {date}</div></div></header><div class="article-cover wrap"><img src="{image}" alt="{title}" loading="lazy"></div><article class="article-body article-wrap"><p class="article-intro">{html.escape(a['excerpt'])}</p>{a['html_body']}{related_links(topic)}{social_cta(topic)}</article></main><footer class="footer new-footer"></footer><script src="../assets/js/main.js"></script></body></html>'''

def add_card(a, slug, category, image):
    source = INDEX.read_text(encoding="utf-8")
    if START not in source or END not in source:
        raise RuntimeError("Journal index lacks AUTO_POSTS markers")
    card = f'''\n<a class="story-card" href="{slug}.html"><img src="{html.escape(image, quote=True)}" alt="{html.escape(a['title'])}" loading="lazy"><div><span>{html.escape(category.upper())} · {html.escape(a['read_time'].upper())}</span><h3>{html.escape(a['title'])}</h3><p>{html.escape(a['excerpt'])}</p><b>Read article →</b></div></a>'''
    INDEX.write_text(source.replace(START, START + card, 1), encoding="utf-8")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    data = load_queue()
    env("BLOG_API_URL")
    env("BLOG_API_KEY")
    env("BLOG_MODEL")
    if START not in INDEX.read_text(encoding="utf-8"):
        raise RuntimeError("Automation markers missing from blog/index.html")
    if args.check:
        print("Configuration valid.")
        return
    topic = next((x for x in data["topics"] if x.get("status") == "pending"), None)
    if not topic:
        print("No pending topics.")
        return
    article = generate(topic)
    validate(article)
    slug = slugify(article["title"])
    target = BLOG / f"{slug}.html"
    if target.exists():
        raise RuntimeError(f"Refusing to overwrite {target.name}")
    cover = select_cover(topic)
    now = datetime.now(timezone.utc)
    target.write_text(page(article, slug, topic["category"], now.strftime("%B %d, %Y"), cover, topic), encoding="utf-8")
    add_card(article, slug, topic["category"], cover)
    topic.update({"status": "published", "slug": slug, "published_at": now.isoformat(), "image": cover})
    data["published"].append({"title": article["title"], "slug": slug, "published_at": now.isoformat()})
    QUEUE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Published {target.name}")

if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)
