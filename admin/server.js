const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Paths
const PRODUCTS_FILE = path.join(__dirname, '..', 'products.json');
const IMAGES_DIR = path.join(__dirname, '..', 'images');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve admin UI files
app.use(express.static(path.join(__dirname, '..'))); // Serve public site files
app.use('/images', express.static(path.join(__dirname, '..', 'images'))); // Keep for backwards compatibility
app.use('/preview', express.static(path.join(__dirname, '..'))); // Keep for backwards compatibility

// Multer setup (memory storage to process with sharp before saving)
const upload = multer({ storage: multer.memoryStorage() });

// Ensure images directory exists
async function ensureDir(dirPath) {
  try {
    await fs.access(dirPath);
  } catch (error) {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

// Utility to read products
async function readProducts() {
  try {
    const data = await fs.readFile(PRODUCTS_FILE, 'utf8');
    const products = JSON.parse(data);
    
    // Auto-backfill SKUs if any product is missing one
    let modified = false;
    products.forEach(p => {
      if (!p.sku) {
        let sku = 'LL-' + Math.floor(10000 + Math.random() * 90000);
        while (products.some(other => other.sku === sku)) {
          sku = 'LL-' + Math.floor(10000 + Math.random() * 90000);
        }
        p.sku = sku;
        modified = true;
      }
    });
    
    if (modified) {
      await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf8');
    }
    
    return products;
  } catch (error) {
    // If file doesn't exist or is empty, return empty array
    return [];
  }
}

// Utility to write products
async function writeProducts(products) {
  await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf8');
}

// Generate slug from name
function generateSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

// Category → emoji mapping
const CATEGORY_ICONS = {
  "Makeup Storage":    "💄",
  "Vanity Essentials": "🪞",
  "Makeup Tools":      "🖌️",
  "Hair Accessories":  "🎀",
  "Skincare":          "✨",
  "Jewelry":           "💎",
  "Home Decor":        "🏡",
};
const DEFAULT_EMOJI = "🛍️";

// SVG Icons
const shareIcon     = `<svg class="icon" viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>`;
const whatsappIcon  = `<svg class="icon" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>`;
const instagramIcon = `<svg class="icon" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`;
const youtubeIcon   = `<svg class="icon" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`;
const PHONE_NUMBER = "918796837718";

const formatPrice = (price) => {
  const p = price ? price.toString().trim() : '';
  return p.startsWith('₹') ? p : `₹${p}`;
};

// Static Page Generator for Full URL Routing & SEO
async function generateStaticPages(products) {
  const rootDir = path.join(__dirname, '..');
  
  for (const product of products) {
    if (!product.active) continue;
    
    const productDir = path.join(rootDir, 'products', product.id);
    await ensureDir(productDir);
    
    const ogImage = product.images && product.images.length > 0 
      ? `https://littlelayerz.github.io/${product.images[0]}` 
      : 'https://littlelayerz.github.io/images/default.jpg';
      
    // Pre-build product-specific media html
    const hasImages = product.images && product.images.length > 0;
    const hasMultiple = hasImages && product.images.length > 1;
    const emoji = CATEGORY_ICONS[product.category] || DEFAULT_EMOJI;
    const waMsg = product.whatsappMessage || `Hi, I'd like to order: ${product.name} (${formatPrice(product.price)})`;
    const waLink = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(waMsg)}`;

    let mediaHtml;
    if (hasImages) {
      mediaHtml = `
        <div class="card-image-container single-view-image">
          <img src="../../${product.images[0]}" alt="${product.name}" class="card-image" id="img-${product.id}">
          ${hasMultiple ? `
            <button class="carousel-btn carousel-prev" onclick="changeImage(event,'${product.id}',-1)" aria-label="Previous">❮</button>
            <button class="carousel-btn carousel-next" onclick="changeImage(event,'${product.id}',1)" aria-label="Next">❯</button>
            <div class="carousel-dots" id="dots-${product.id}">
              ${product.images.map((_, i) => `<div class="dot${i === 0 ? ' active' : ''}"></div>`).join('')}
            </div>` : ''}
        </div>`;
    } else if (product.instagramLink) {
      mediaHtml = `
        <div style="background:#fff;border-radius:14px;overflow:hidden;box-shadow:rgba(0,0,0,0.02) 0 0 0 1px, rgba(0,0,0,0.04) 0 2px 6px, rgba(0,0,0,0.1) 0 4px 8px;display:flex;justify-content:center;width:100%;">
          <blockquote class="instagram-media" data-instgrm-permalink="${product.instagramLink}" data-instgrm-version="14" style="background:#FFF;border:0;margin:0;padding:0;width:100%;max-width:540px;"></blockquote>
        </div>`;
    } else {
      mediaHtml = `
        <div class="card-image-container single-view-image">
          <img src="https://via.placeholder.com/540x540/f7f7f7/929292?text=No+Image" alt="${product.name}" class="card-image">
        </div>`;
    }

    const cleanDescription = product.description ? product.description.replace(/\r?\n/g, '<br>') : '';

    const singleProductLayout = `
      <div class="back-nav">
        <a href="../../" class="back-link">
          <svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          Back to Catalog
        </a>
      </div>
      <div class="single-product-layout">
        ${mediaHtml}
        <div class="single-product-details">
          ${product.category ? `<div class="single-category-tag">${emoji} ${product.category}</div>` : ''}
          ${product.sku ? `<div style="font-size: 13px; color: var(--muted); margin-bottom: 12px; font-weight: 500; letter-spacing: 0.5px;">SKU: ${product.sku}</div>` : ''}
          <h1 class="single-title">${product.name}</h1>
          <div class="single-price">${formatPrice(product.price)}</div>
          <p class="single-desc">${cleanDescription}</p>
          <div class="single-actions">
            <a href="${waLink}" target="_blank" class="btn btn-whatsapp">${whatsappIcon} Order on WhatsApp</a>
            <button class="btn btn-add-bag" onclick="addToCart('${product.id}')">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> Add to Shopping Bag
            </button>
            ${product.instagramLink ? `<a href="${product.instagramLink}" target="_blank" class="btn btn-instagram">${instagramIcon} View on Instagram</a>` : ''}
            ${product.youtubeLink ? `<a href="${product.youtubeLink}" target="_blank" class="btn btn-youtube">${youtubeIcon} View on YouTube</a>` : ''}
            <button class="btn btn-share" onclick="shareProduct(event,'${product.id}')">${shareIcon} Share Link</button>
          </div>
        </div>
      </div>
      ${product.instagramLink ? `
        <div style="margin-top:4rem;text-align:center;width:100%;">
          <h3 style="font-size:22px;font-weight:600;color:#222;margin-bottom:2rem;letter-spacing:-0.44px;">See it on Instagram</h3>
          <blockquote class="instagram-media" data-instgrm-permalink="${product.instagramLink}" data-instgrm-version="14" style="background:#FFF;border:0;border-radius:14px;box-shadow:rgba(0,0,0,0.04) 0 2px 6px;margin:0 auto;max-width:540px;min-width:326px;padding:0;width:100%;"></blockquote>
        </div>` : ''}
    `;

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-MRG2TT80EL"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-MRG2TT80EL');
  </script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${product.name} | Little Layerz</title>
  <meta name="description" content=${JSON.stringify(product.description || '')}>
  <link rel="canonical" href="https://littlelayerz.github.io/products/${product.id}/">
  <link rel="icon" type="image/png" href="../../favicon.png">
  
  <meta property="og:title" content=${JSON.stringify(product.name + " - Little Layerz")}>
  <meta property="og:description" content=${JSON.stringify(product.description || '')}>
  <meta property="og:image" content=${JSON.stringify(ogImage)}>
  <meta property="og:url" content="https://littlelayerz.github.io/products/${product.id}/">
  <meta property="og:type" content="product">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content=${JSON.stringify(product.name + " - Little Layerz")}>
  <meta name="twitter:description" content=${JSON.stringify(product.description || '')}>
  <meta name="twitter:image" content=${JSON.stringify(ogImage)}>
  
  <script type="application/ld+json">
  {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": ${JSON.stringify(product.name)},
    "image": ${JSON.stringify(ogImage)},
    "description": ${JSON.stringify(product.description || '')},
    "brand": {
      "@type": "Brand",
      "name": "Little Layerz"
    },
    "offers": {
      "@type": "Offer",
      "url": "https://littlelayerz.github.io/products/${product.id}/",
      "priceCurrency": "INR",
      "price": ${JSON.stringify(product.price ? product.price.replace('₹', '') : '0')},
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Little Layerz"
      }
    }
  }
  </script>

  <link rel="stylesheet" href="../../style.css">
  <script>window.PRODUCT_SLUG = "${product.id}";</script>

</head>
<body>
  <header>
    <div class="container">
      <div class="header-inner">
        <div class="logo">
          <a href="../../" style="text-decoration:none; color:inherit; display:flex; align-items:center; gap:var(--sp-sm);">
            <img src="../../favicon.png" alt="Little Layerz logo" style="width:32px;height:32px;border-radius:6px;object-fit:cover;">
            <h1>Little<span>Layerz</span></h1>
          </a>
        </div>
        <div style="display:flex;align-items:center;gap:12px;">
          <!-- Shopping Bag Button -->
          <button class="cart-toggle-btn" onclick="toggleCart()" aria-label="Open Shopping Bag">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            <span id="cart-badge-count" class="cart-badge" style="display:none;">0</span>
          </button>
          <a href="https://instagram.com/littlelayerz" target="_blank" class="social-link" style="font-size:13px;">
            <svg class="icon" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            @littlelayerz
          </a>
          <a href="https://wa.me/918796837718?text=Hi%20Little%20Layerz!%20I'd%20like%20to%20know%20more%20about%20your%20products." target="_blank" class="btn-whatsapp-contact">
            <svg class="icon" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
            Contact Us
          </a>
        </div>
      </div>
    </div>
  </header>

  <main>
    <div class="container">
      <div id="catalog-intro" class="catalog-header" style="display:none;"></div>
      <div id="products-grid" class="single-product-container">
        ${singleProductLayout}
      </div>
    </div>
  </main>

  <footer>
    <div class="container">
      <div class="social-links">
        <a href="https://instagram.com/littlelayerz" target="_blank" class="social-link">
          <svg class="icon" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          @littlelayerz
        </a>
      </div>
      <p>&copy; <span id="year"></span> Little Layerz. All rights reserved.</p>
    </div>
  </footer>

  <div id="toast" class="toast">Link copied to clipboard!</div>
  
  <!-- Shopping Bag Overlay & Drawer -->
  <div id="cart-overlay" class="cart-overlay" onclick="toggleCart()"></div>
  <div id="cart-drawer" class="cart-drawer">
    <div class="cart-header">
      <h2>Shopping Bag (<span id="cart-drawer-count">0</span>)</h2>
      <button class="cart-close-btn" onclick="toggleCart()">&times;</button>
    </div>
    <div id="cart-items" class="cart-items">
      <!-- Items dynamically populated -->
    </div>
    <div class="cart-footer">
      <div class="cart-subtotal-row">
        <span>Subtotal</span>
        <strong id="cart-subtotal">₹0</strong>
      </div>
      <button class="btn btn-whatsapp checkout-btn" onclick="checkoutCart()">
        <svg class="icon" viewBox="0 0 24 24"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
        Send Order on WhatsApp
      </button>
    </div>
  </div>

  <div id="image-modal" class="modal" onclick="if(event.target === this) this.style.display='none'">
    <span class="modal-close" onclick="document.getElementById('image-modal').style.display='none'">&times;</span>
    <button class="modal-btn modal-prev" onclick="changeModalImage(-1, event)" aria-label="Previous image">❮</button>
    <img class="modal-content" id="modal-img" onclick="event.stopPropagation()">
    <button class="modal-btn modal-next" onclick="changeModalImage(1, event)" aria-label="Next image">❯</button>
  </div>

  <script async src="//www.instagram.com/embed.js"></script>
  <script src="../../script.js"></script>
</body>
</html>`;
    
    await fs.writeFile(path.join(productDir, 'index.html'), htmlContent, 'utf8');
  }
}

// Routes
app.get('/api/products', async (req, res) => {
  try {
    const products = await readProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load products' });
  }
});

// Add or update product
app.post('/api/products', upload.any(), async (req, res) => {
  try {
    const { id, name, description, price, category, whatsappMessage, instagramLink, youtubeLink, active } = req.body;
    let products = await readProducts();
    
    let productId = id;
    let isNew = false;
    
    if (!productId) {
      // New product
      productId = generateSlug(name || 'product');
      
      // Ensure unique ID
      let counter = 1;
      let originalId = productId;
      while (products.some(p => p.id === productId)) {
        productId = `${originalId}-${counter}`;
        counter++;
      }
      isNew = true;
    }
    
    // Process images
    await ensureDir(IMAGES_DIR);
    const newImagePaths = [];
    
    if (req.files && req.files.length > 0) {
      const cleanTitle = generateSlug(name || 'product');
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
        const filename = `${cleanTitle}-${randomSuffix}-${i + 1}.jpg`;
        const filePath = path.join(IMAGES_DIR, filename);
        
        await sharp(file.buffer)
          .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toFile(filePath);
          
        newImagePaths.push(`images/${filename}`);
      }
    }
    
    const productData = {
      id: productId,
      name: name || '',
      description: description || '',
      category: category || '',
      price: price || '',
      whatsappMessage: whatsappMessage || `Hi! I'm interested in ordering: ${name} (${price})`,
      instagramLink: instagramLink || '',
      youtubeLink: youtubeLink || '',
      active: active === 'true' || active === true
    };

    let keepImages = null;
    if (req.body.keepImages) {
      try {
        keepImages = JSON.parse(req.body.keepImages);
      } catch (e) {
        console.error('Failed to parse keepImages:', e);
      }
    }

    if (isNew) {
      let sku = 'LL-' + Math.floor(10000 + Math.random() * 90000);
      while (products.some(other => other.sku === sku)) {
        sku = 'LL-' + Math.floor(10000 + Math.random() * 90000);
      }
      productData.sku = sku;
      productData.images = newImagePaths;
      products.unshift(productData);
    } else {
      const index = products.findIndex(p => p.id === productId);
      if (index !== -1) {
        if (keepImages !== null) {
          productData.images = [...keepImages, ...newImagePaths];
        } else {
          // Keep existing images if no new ones are uploaded
          productData.images = newImagePaths.length > 0 ? newImagePaths : products[index].images;
        }
        productData.sku = products[index].sku || ('LL-' + Math.floor(10000 + Math.random() * 90000));
        products[index] = productData;
      }
    }
    
    await writeProducts(products);
    await generateStaticPages(products);
    res.json({ success: true, product: productData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save product' });
  }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    let products = await readProducts();
    
    products = products.filter(p => p.id !== productId);
    await writeProducts(products);
    await generateStaticPages(products);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Toggle active status
app.put('/api/products/:id/toggle', async (req, res) => {
  try {
    const productId = req.params.id;
    let products = await readProducts();
    
    const index = products.findIndex(p => p.id === productId);
    if (index !== -1) {
      products[index].active = !products[index].active;
      await writeProducts(products);
      await generateStaticPages(products);
      res.json({ success: true, active: products[index].active });
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle status' });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  if (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`Admin server running at http://localhost:${PORT}`);
});
