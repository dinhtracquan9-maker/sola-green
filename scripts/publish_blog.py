import argparse, html, json, os, re, sys, unicodedata, urllib.error, urllib.request
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
QUEUE, BLOG = ROOT / "data" / "blog_queue.json", ROOT / "blog"
INDEX = BLOG / "index.html"
SEO_LIBRARY = ROOT / "assets" / "images" / "seo-library"
START, END = "<!-- AUTO_POSTS_START -->", "<!-- AUTO_POSTS_END -->"

DEFAULT_BLOG_API_URL = "https://api.openai.com/v1/chat/completions"
DEFAULT_BLOG_MODEL = "gpt-4o-mini"

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

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".jfif"}

REAL_IMAGE_HINTS = (
    "seo-library",
    "about/operations",
    "warehouse",
    "stock",
    "inventory",
    "order",
    "packing",
    "shipment",
    "shipping",
    "delivery",
    "tracking",
    "proof",
    "community",
    "conference",
    "workshop",
    "clinic",
    "customer",
)

PRODUCT_DESIGN_HINTS = (
    "/products/",
    "/bestseller/",
    "/partners/",
    "productcatalogue",
    "products-1",
)

GENERIC_IMAGE_WORDS = {
    "aesthetic",
    "article",
    "beauty",
    "buyer",
    "buyers",
    "buying",
    "clinic",
    "clinics",
    "distributor",
    "distributors",
    "for",
    "global",
    "guide",
    "hanseong",
    "image",
    "international",
    "medical",
    "photo",
    "practical",
    "product",
    "products",
    "professional",
    "real",
    "reseller",
    "resellers",
    "seo",
    "source",
    "sourcing",
    "supplier",
    "supply",
    "wholesale",
}

CATEGORY_REAL_PRIORITIES = {
    "Botulinum Toxin": ("product-selection", "inventory", "stock-room", "warehouse", "order-preparation"),
    "Dermal Fillers": ("product-selection", "inventory", "stock-room", "warehouse", "order-detail"),
    "Skin Boosters": ("product-selection", "inventory", "stock-room", "bulk-inventory", "order-detail"),
    "Skin Boosters / PN": ("product-selection", "inventory", "stock-room", "bulk-inventory", "order-detail"),
    "Exosome & Meso": ("product-selection", "inventory", "stock-room", "bulk-inventory", "order-detail"),
    "Biostimulators": ("product-selection", "inventory", "stock-room", "warehouse", "order-detail"),
    "Body Fillers": ("product-selection", "inventory", "warehouse", "order-preparation"),
    "Lipolysis": ("product-selection", "inventory", "stock-room", "order-preparation"),
    "Weight Management": ("product-selection", "inventory", "stock-room", "order-preparation"),
    "IV & Wellness": ("product-selection", "inventory", "order-detail", "packing-team"),
    "Injection Supplies": ("packing-team", "order-detail", "warehouse", "stock-room"),
    "Numbing & Supplies": ("packing-team", "order-detail", "warehouse", "stock-room"),
}

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

def env_required(name):
    value = os.getenv(name, "").strip()
    if not value:
        raise RuntimeError(f"Missing GitHub secret: {name}")
    return value

def env_optional(name, default):
    return os.getenv(name, "").strip() or default

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
    payload = json.dumps({"model": env_optional("BLOG_MODEL", DEFAULT_BLOG_MODEL), "temperature": 0.5, "max_tokens": 4000, "messages": [{"role": "system", "content": "You are a careful B2B editor. Return valid JSON only."}, {"role": "user", "content": prompt}]}).encode()
    request = urllib.request.Request(env_optional("BLOG_API_URL", DEFAULT_BLOG_API_URL), data=payload, headers={"Authorization": f"Bearer {env_required('BLOG_API_KEY')}", "Content-Type": "application/json"}, method="POST")
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

def clean_product_name(topic):
    name = topic["keyword"]
    for phrase in (
        " wholesale supplier",
        " wholesale",
        " supplier",
        " sourcing",
        " distributor",
        " for clinics",
        " buy ",
    ):
        name = name.replace(phrase, " ")
    return re.sub(r"\s+", " ", name).strip().title()

def fallback_article(topic):
    product = clean_product_name(topic)
    category = topic.get("category", "Professional Aesthetic Supply")
    title = topic.get("title") or f"{product}: Wholesale Sourcing Guide for Clinics and Resellers"
    meta = f"Practical wholesale sourcing checklist for {product}: stock, documentation, packing, shipping and buyer communication."
    excerpt = (
        f"A practical buyer-focused guide for clinics, spas and distributors evaluating {product}. "
        "Use it to prepare clearer requests, review documentation needs and coordinate shipment support."
    )
    html_body = f"""
<h2>Why professional buyers research {html.escape(product)} before ordering</h2>
<p>When a clinic, reseller or distribution partner prepares a wholesale order, the product name is only the first part of the decision. Buyers also need to understand available presentation, current stock condition, handling expectations, shipment timing and the information required for a clear quotation. A structured sourcing process helps reduce delays and makes communication easier for both sides.</p>
<p>{html.escape(product)} sits within the {html.escape(category)} category, where professional buyers often compare several options before confirming quantities. The safest approach is to prepare a written product list, desired units, destination country and any special packing notes before requesting a quote. This gives the supplier enough context to check availability and provide a practical next step.</p>
<h2>Start with product identification and exact requirements</h2>
<p>Before requesting wholesale pricing, buyers should confirm the exact product name, version, size or unit count, and the quantity needed. Small differences in packaging or concentration can create confusion if they are not written clearly. If a clinic is ordering for multiple branches, it is useful to separate quantities by location so packing and documentation can be planned more accurately.</p>
<p>Photographs can also support the request. Real stock photos, previous carton photos or a reference image from a product catalogue help both sides confirm that they are discussing the same item. For repeat buyers, keeping a simple internal list of approved products can make future ordering faster and more consistent.</p>
<h2>Documentation and authenticity checks</h2>
<p>Professional buyers should always ask what documentation can be shared for the destination market. This may include invoice details, product labels, batch or expiry information, packing summaries or other documents required for internal review. Requirements vary by market, so the buyer should also check local import rules and professional-use restrictions before confirming an order.</p>
<p>Authenticity review should be treated as a normal part of procurement. Buyers can ask for visible product photos before shipment, request carton photos after packing and keep all communication records in one place. These steps do not replace local compliance review, but they help create a cleaner purchasing trail.</p>
<h2>Stock, packing and order preparation</h2>
<p>For wholesale orders, packing quality is just as important as the product list. Clinics and distributors often need items grouped by category, branch, client order or treatment room. Clear packing instructions help the warehouse prepare cartons that are easier to receive and check after delivery.</p>
<p>If the order includes mixed products, ask whether the items can be separated by product line and labelled clearly. For larger shipments, request carton counts, approximate dimensions and weight when available. These details help the buyer estimate receiving space and coordinate local delivery.</p>
<h2>Shipping communication and destination planning</h2>
<p>Shipping expectations should be confirmed before payment whenever possible. Buyers should share the destination country, city, preferred timeline and any known customs considerations. A reliable supplier will usually explain that transit time can vary by route, courier, customs review and local delivery conditions.</p>
<p>For international sourcing, buyers should avoid vague requests such as “send price” without destination details. A stronger request includes the product list, quantities, country, target delivery timing and whether the order is urgent. This allows the supplier to give more realistic guidance instead of a generic answer.</p>
<h2>Wholesale request checklist</h2>
<ul>
<li><strong>Product name:</strong> write the exact product, size, version or unit count.</li>
<li><strong>Quantity:</strong> separate quantities by product and branch if needed.</li>
<li><strong>Destination:</strong> include country, city and preferred delivery timing.</li>
<li><strong>Packing:</strong> request carton grouping, labels or branch separation when important.</li>
<li><strong>Documents:</strong> ask what invoice, label, batch or expiry information can be shared.</li>
<li><strong>Communication:</strong> keep quotation, payment confirmation and shipment updates in one thread.</li>
</ul>
<h2>How HANSEONG BEAUTY GLOBAL supports wholesale buyers</h2>
<p>HANSEONG BEAUTY GLOBAL focuses on professional B2B aesthetic supply for clinics, spas, resellers and distributors. The most efficient way to start is to send a clear product list through WhatsApp, including quantity and destination country. The team can then help check current availability, quotation direction and shipment support.</p>
<p>This article is for general procurement education and does not provide medical advice, treatment guidance or regulatory approval claims. Professional buyers should always review local rules, clinic protocols and import requirements before ordering any aesthetic or medical beauty product.</p>
"""
    return {
        "title": title,
        "meta_description": meta[:155],
        "excerpt": excerpt,
        "read_time": "6 min read",
        "html_body": html_body,
    }

def generate_article(topic, attempts=2):
    errors = []
    for attempt in range(1, attempts + 1):
        try:
            article = generate(topic)
            validate(article)
            return article, False
        except Exception as exc:
            errors.append(f"attempt {attempt}: {exc}")
            print(f"WARN: generation {errors[-1]}", file=sys.stderr)
    article = fallback_article(topic)
    validate(article)
    print("WARN: using fallback article after generation errors: " + " | ".join(errors), file=sys.stderr)
    return article, True

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

def article_image_src(path):
    return "../" + path.relative_to(ROOT).as_posix()

def normalize_search_text(value):
    value = unicodedata.normalize("NFKD", str(value or ""))
    value = "".join(char for char in value if not unicodedata.combining(char))
    value = value.lower()
    value = re.sub(r"[^a-z0-9]+", " ", value)
    return re.sub(r"\s+", " ", value).strip()

def important_tokens(value):
    return {
        token for token in normalize_search_text(value).split()
        if len(token) >= 3 and token not in GENERIC_IMAGE_WORDS
    }

def discover_images():
    image_root = ROOT / "assets" / "images"
    if not image_root.exists():
        return []
    return [
        path for path in image_root.rglob("*")
        if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS
    ]

def phrase_bonus(topic, filename):
    score = 0
    for source in (topic.get("keyword", ""), topic.get("title", "")):
        tokens = [
            token for token in normalize_search_text(source).split()
            if token not in GENERIC_IMAGE_WORDS
        ]
        for size in range(min(5, len(tokens)), 0, -1):
            for index in range(0, len(tokens) - size + 1):
                phrase = " ".join(tokens[index:index + size])
                if len(phrase) >= 3 and phrase in filename:
                    score = max(score, 90 + size * 28)
            if score:
                break
    return score

def named_image_score(topic, path):
    path_text = path.relative_to(ROOT).as_posix().lower()
    filename = normalize_search_text(path.stem)
    topic_tokens = important_tokens(
        f"{topic.get('keyword', '')} {topic.get('title', '')} {topic.get('category', '')}"
    )
    filename_tokens = important_tokens(path.stem)
    score = 0

    if "/seo-library/" in f"/{path_text}":
        score += 240
    elif any(hint in path_text for hint in PRODUCT_DESIGN_HINTS):
        score -= 70
    else:
        score += 55

    overlap = topic_tokens & filename_tokens
    score += len(overlap) * 42
    score += phrase_bonus(topic, filename)

    category_tokens = important_tokens(topic.get("category", ""))
    if category_tokens and category_tokens & filename_tokens:
        score += 35

    return score

def select_named_real_cover(topic):
    ranked = sorted(
        ((named_image_score(topic, path), path) for path in discover_images()),
        key=lambda item: (-item[0], item[1].as_posix().lower())
    )
    if not ranked or ranked[0][0] < 140:
        return None
    return article_image_src(ranked[0][1])

def image_score(topic, path):
    path_text = path.relative_to(ROOT).as_posix().lower()
    filename = path.stem.lower()
    topic_text = f"{topic.get('keyword', '')} {topic.get('title', '')} {topic.get('category', '')}".lower()
    score = 0

    if any(hint in path_text for hint in REAL_IMAGE_HINTS):
        score += 90
    if "about/operations" in path_text:
        score += 35
    if any(hint in path_text for hint in PRODUCT_DESIGN_HINTS):
        score -= 45

    for hint in CATEGORY_REAL_PRIORITIES.get(topic.get("category", ""), ()):
        if hint in path_text:
            score += 28

    topic_words = {
        word for word in re.findall(r"[a-z0-9]+", topic_text)
        if len(word) >= 4 and word not in {"wholesale", "supplier", "sourcing", "clinics", "buyers"}
    }
    for word in topic_words:
        if word in filename:
            score += 18

    if any(word in topic_text for word in ("shipping", "shipment", "delivery", "tracking", "customs", "export")):
        if any(word in path_text for word in ("shipping", "shipment", "delivery", "tracking", "order", "packing")):
            score += 40
    if any(word in topic_text for word in ("documentation", "certificate", "authentic", "qr", "approval")):
        if any(word in path_text for word in ("order-detail", "product-selection", "proof", "inventory")):
            score += 35
    if any(word in topic_text for word in ("partner", "supplier", "request", "quote", "procurement")):
        if any(word in path_text for word in ("packing-team", "order-preparation", "warehouse", "inventory")):
            score += 25

    return score

def select_real_cover(topic):
    ranked = sorted(
        ((image_score(topic, path), path) for path in discover_images()),
        key=lambda item: (-item[0], item[1].as_posix().lower())
    )
    ranked = [(score, path) for score, path in ranked if score >= 85]
    if not ranked:
        return None

    top_score = ranked[0][0]
    shortlist = [path for score, path in ranked if score >= top_score - 18][:8]
    seed = sum(ord(char) for char in f"{topic.get('keyword', '')}|{topic.get('title', '')}")
    return article_image_src(shortlist[seed % len(shortlist)])

def select_cover(topic):
    named_cover = select_named_real_cover(topic)
    if named_cover and image_exists(named_cover):
        return named_cover

    text = f"{topic.get('keyword', '')} {topic.get('title', '')}".lower()
    for needles, image in REAL_IMAGE_RULES:
        if all(needle in text for needle in needles) and image_exists(image):
            return image

    image = topic.get("image") or "../assets/images/products-1.png"
    if image_exists(image):
        return image

    real_cover = select_real_cover(topic)
    if real_cover and image_exists(real_cover):
        return real_cover

    return "../assets/images/products-1.png"

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
    env_required("BLOG_API_KEY")
    env_optional("BLOG_API_URL", DEFAULT_BLOG_API_URL)
    env_optional("BLOG_MODEL", DEFAULT_BLOG_MODEL)
    if START not in INDEX.read_text(encoding="utf-8"):
        raise RuntimeError("Automation markers missing from blog/index.html")
    if args.check:
        print("Configuration valid.")
        return
    topic = next((x for x in data["topics"] if x.get("status") == "pending"), None)
    if not topic:
        print("No pending topics.")
        return
    article, used_fallback = generate_article(topic)
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
    mode = "fallback content" if used_fallback else "OpenAI content"
    print(f"Published {target.name} ({mode})")

if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)
