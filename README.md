# HANSEONG BEAUTY GLOBAL — Ultimate Static Website

Premium multi-page static B2B catalogue website.

## Pages

- index.html
- products.html
- brands.html
- catalogue.html
- shipping.html
- about.html
- faq.html
- contact.html

## Edit products

Open: `assets/data/products.js`

Each product has:

```js
{name:'Rejuran Healer', category:'Skin Boosters / PN', brand:'Rejuran', origin:'Korea', tag:'Best seller', image:'assets/images/product-rejuran.svg'}
```

## Replace images

Add real product images into `assets/images/` and update the `image` path in `products.js`.

## Deploy

Upload this folder to Netlify, Vercel, Cloudflare Pages, cPanel public_html, or any static hosting.
No build step needed.

git add .  
git commit -m "Organize products"  
git push

```
git config --global user.name "dinhtracquan9-maker"
git config --global user.email "dinhtracquan.9@gmail.com"
git commit -m "Update homepage and styles"
git push origin main
git status
```

