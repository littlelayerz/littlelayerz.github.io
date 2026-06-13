// =====================
// CONFIG
// =====================
const PHONE_NUMBER = "917831899586";
const INSTAGRAM_USERNAME = "littlelayerz";
const RECENTLY_VIEWED_KEY = "ll_recently_viewed";
const RECENTLY_VIEWED_MAX = 4;

const formatPrice = (price) => {
  const p = price ? price.toString().trim() : '';
  return p.startsWith('₹') ? p : `₹${p}`;
};

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

// =====================
// STATE
// =====================
const productCarousels = {};
let allProducts = [];
let activeCategory = 'All';

const getAssetPath = (path) => window.PRODUCT_SLUG ? `../../${path}` : path;

// =====================
// RECENTLY VIEWED
// =====================
function getRecentlyViewed() {
  try {
    return JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY)) || [];
  } catch { return []; }
}

function addRecentlyViewed(productId) {
  let viewed = getRecentlyViewed().filter(id => id !== productId);
  viewed.unshift(productId);
  if (viewed.length > RECENTLY_VIEWED_MAX) viewed = viewed.slice(0, RECENTLY_VIEWED_MAX);
  localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(viewed));
}

// =====================
// THUMBNAIL HELPER
// =====================
function getCardThumbnail(product) {
  if (product.images && product.images.length > 0) {
    return `<img src="${getAssetPath(product.images[0])}" alt="${product.name}" class="card-image" id="img-${product.id}" loading="lazy" onclick="openModal(event, this.src)">`;
  } else if (product.instagramLink) {
    return `
      <div style="width:100%;height:100%;overflow:hidden;pointer-events:none;margin-top:-56px;">
        <blockquote class="instagram-media" data-instgrm-permalink="${product.instagramLink}" data-instgrm-version="14" style="background:#FFF;border:0;margin:0;padding:0;width:100%;"></blockquote>
      </div>`;
  } else {
    return `<img src="https://via.placeholder.com/400x400/f7f7f7/929292?text=No+Image" alt="${product.name}" class="card-image">`;
  }
}

// =====================
// CATEGORY STRIP
// =====================
function buildCategoryStrip(products) {
  const stripEl = document.getElementById('category-strip');
  if (!stripEl) return;

  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

  stripEl.innerHTML = categories.map(cat => {
    const emoji = cat === 'All' ? '🛒' : (CATEGORY_ICONS[cat] || DEFAULT_EMOJI);
    const isActive = cat === activeCategory;
    return `<button class="category-pill${isActive ? ' active' : ''}" data-category="${cat}" onclick="selectCategory('${cat}')">
      <span class="pill-emoji">${emoji}</span> ${cat}
    </button>`;
  }).join('');

  stripEl.style.display = 'flex';
}

window.selectCategory = function(category) {
  activeCategory = category;
  // Update pill states
  document.querySelectorAll('.category-pill').forEach(pill => {
    pill.classList.toggle('active', pill.dataset.category === category);
  });

  const filtered = category === 'All'
    ? allProducts.filter(p => p.active)
    : allProducts.filter(p => p.active && p.category === category);

  const heading = document.getElementById('catalog-heading');
  if (heading) heading.textContent = category === 'All' ? 'All Products' : category;

  const grid = document.getElementById('products-grid');
  renderCatalog(filtered, grid);
};

// =====================
// MAIN LOADER
// =====================
async function loadProducts() {
  const grid = document.getElementById('products-grid');
  try {
    const res = await fetch(getAssetPath('products.json'));
    if (!res.ok) throw new Error('Failed to fetch products');
    allProducts = await res.json();

    // Single product page via PRODUCT_SLUG
    if (window.PRODUCT_SLUG) {
      const product = allProducts.find(p => p.id === window.PRODUCT_SLUG && p.active);
      if (product) {
        addRecentlyViewed(product.id);
        renderSingleProduct(product, grid);
        return;
      }
    }

    // Legacy query param support
    const params = new URLSearchParams(window.location.search);
    const productSlug = params.get('p');
    if (productSlug) {
      const product = allProducts.find(p => p.id === productSlug && p.active);
      if (product) {
        addRecentlyViewed(product.id);
        renderSingleProduct(product, grid);
        return;
      }
    }

    // Catalog view
    const activeProducts = allProducts.filter(p => p.active);
    if (activeProducts.length === 0) {
      grid.innerHTML = '<div class="loading-state"><p>No products available right now.</p></div>';
      return;
    }

    // Build category strip
    buildCategoryStrip(activeProducts);

    // Show recently viewed
    renderRecentlyViewed(activeProducts);

    // Show catalog header
    document.getElementById('catalog-intro').style.display = 'block';

    renderCatalog(activeProducts, grid);
  } catch (error) {
    console.error(error);
    grid.innerHTML = '<div class="loading-state"><p>Error loading products. Please try again later.</p></div>';
  }
}

// =====================
// RECENTLY VIEWED RENDER
// =====================
function renderRecentlyViewed(allActive) {
  const section = document.getElementById('recently-viewed-section');
  const grid = document.getElementById('recently-viewed-grid');
  if (!section || !grid) return;

  const viewed = getRecentlyViewed();
  if (viewed.length === 0) return;

  const products = viewed.map(id => allActive.find(p => p.id === id)).filter(Boolean);
  if (products.length === 0) return;

  grid.innerHTML = products.map(product => {
    const thumb = getCardThumbnail(product);
    return `
      <div class="product-card" onclick="navigateToProduct('${product.id}')" style="cursor:pointer;">
        <div class="card-image-container" style="aspect-ratio:1/1;">
          ${thumb}
        </div>
        <div class="card-meta">
          <div class="card-meta-row">
            <span class="card-title">${product.name}</span>
            <span class="card-price">${formatPrice(product.price)}</span>
          </div>
        </div>
      </div>`;
  }).join('');

  section.style.display = 'block';

  setTimeout(() => {
    if (window.instgrm && window.instgrm.Embeds) window.instgrm.Embeds.process();
  }, 150);
}

// =====================
// CATALOG RENDER
// =====================
function renderCatalog(products, container) {
  container.className = 'products-grid';

  if (products.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <strong>No products in this category</strong>
        Try selecting a different category above.
      </div>`;
    return;
  }

  container.innerHTML = products.map(product => {
    productCarousels[product.id] = { images: product.images || [], currentIndex: 0 };

    const hasImages = product.images && product.images.length > 0;
    const hasMultiple = hasImages && product.images.length > 1;
    const emoji = CATEGORY_ICONS[product.category] || DEFAULT_EMOJI;
    const waMsg = product.whatsappMessage || `Hi, I'd like to order: ${product.name} (${formatPrice(product.price)})`;

    let photoHtml;
    if (hasImages) {
      photoHtml = `
        <div class="card-image-container">
          ${product.category ? `<div class="card-category-badge">${emoji} ${product.category}</div>` : ''}
          <img src="${getAssetPath(product.images[0])}" alt="${product.name}" class="card-image" id="img-${product.id}" loading="lazy" onclick="openModal(event, this.src)">
          ${hasMultiple ? `
            <button class="carousel-btn carousel-prev" onclick="changeImage(event,'${product.id}',-1)" aria-label="Previous">❮</button>
            <button class="carousel-btn carousel-next" onclick="changeImage(event,'${product.id}',1)" aria-label="Next">❯</button>
            <div class="carousel-dots" id="dots-${product.id}">
              ${product.images.map((_, i) => `<div class="dot${i === 0 ? ' active' : ''}"></div>`).join('')}
            </div>` : ''}
        </div>`;
    } else if (product.instagramLink) {
      photoHtml = `
        <div class="card-image-container" style="background:#fafafa;overflow:hidden;">
          ${product.category ? `<div class="card-category-badge">${emoji} ${product.category}</div>` : ''}
          <div style="width:100%;margin-top:-56px;">
            <blockquote class="instagram-media" data-instgrm-permalink="${product.instagramLink}" data-instgrm-version="14" style="background:#FFF;border:0;margin:0 auto;padding:0;width:100%;max-width:100%;"></blockquote>
          </div>
        </div>`;
    } else {
      photoHtml = `
        <div class="card-image-container">
          ${product.category ? `<div class="card-category-badge">${emoji} ${product.category}</div>` : ''}
          <img src="https://via.placeholder.com/400x400/f7f7f7/929292?text=No+Image" alt="${product.name}" class="card-image">
        </div>`;
    }

    return `
      <div class="product-card" id="card-${product.id}" data-id="${product.id}">
        ${photoHtml}
        <div class="card-meta">
          <div class="card-meta-row">
            <span class="card-title">${product.name}</span>
            <span class="card-price">${formatPrice(product.price)}</span>
          </div>
          <p class="card-desc">${product.description}</p>
          <div class="card-actions" style="display:flex;flex-direction:row;gap:8px;margin-top:12px;">
            <a href="https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(waMsg)}" target="_blank" class="btn btn-whatsapp" style="flex:1;min-width:0;" onclick="event.stopPropagation()">
              ${whatsappIcon} Order on WhatsApp
            </a>
            <button class="btn btn-share" style="flex-shrink:0;" onclick="shareProduct(event,'${product.id}')" aria-label="Share">${shareIcon}</button>
          </div>
        </div>
      </div>`;
  }).join('');

  // Attach click-to-navigate (only on non-button areas)
  container.querySelectorAll('.product-card[data-id]').forEach(card => {
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.btn') && !e.target.closest('.carousel-btn')) {
        navigateToProduct(card.dataset.id);
      }
    });
  });

  setTimeout(() => {
    if (window.instgrm && window.instgrm.Embeds) window.instgrm.Embeds.process();
  }, 150);
}

// =====================
// SINGLE PRODUCT RENDER
// =====================
function renderSingleProduct(product, container) {
  document.getElementById('catalog-intro').style.display = 'none';

  container.className = 'single-product-container';
  productCarousels[product.id] = { images: product.images || [], currentIndex: 0 };

  const waLink = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(product.whatsappMessage || `Hi, I'd like to order: ${product.name} (${formatPrice(product.price)})`)}`;
  const hasImages = product.images && product.images.length > 0;
  const hasMultiple = hasImages && product.images.length > 1;
  const emoji = CATEGORY_ICONS[product.category] || DEFAULT_EMOJI;

  let mediaHtml;
  if (hasImages) {
    mediaHtml = `
      <div class="card-image-container single-view-image">
        <img src="${getAssetPath(product.images[0])}" alt="${product.name}" class="card-image" id="img-${product.id}" onclick="openModal(event, this.src)">
        ${hasMultiple ? `
          <button class="carousel-btn carousel-prev" onclick="changeImage(event,'${product.id}',-1)" aria-label="Previous">❮</button>
          <button class="carousel-btn carousel-next" onclick="changeImage(event,'${product.id}',1)" aria-label="Next">❯</button>
          <div class="carousel-dots" id="dots-${product.id}">
            ${product.images.map((_, i) => `<div class="dot${i === 0 ? ' active' : ''}"></div>`).join('')}
          </div>` : ''}
      </div>`;
  } else if (product.instagramLink) {
    mediaHtml = `
      <div style="background:#fff;border-radius:14px;overflow:hidden;box-shadow:rgba(0,0,0,0.02) 0 0 0 1px, rgba(0,0,0,0.04) 0 2px 6px, rgba(0,0,0,0.1) 0 4px 8px;display:flex;justify-content:center;">
        <blockquote class="instagram-media" data-instgrm-permalink="${product.instagramLink}" data-instgrm-version="14" style="background:#FFF;border:0;margin:0;padding:0;width:100%;max-width:540px;"></blockquote>
      </div>`;
  } else {
    mediaHtml = `
      <div class="card-image-container single-view-image">
        <img src="https://via.placeholder.com/540x540/f7f7f7/929292?text=No+Image" alt="${product.name}" class="card-image">
      </div>`;
  }

  container.innerHTML = `
    <div class="back-nav">
      <a href="${window.PRODUCT_SLUG ? '../../' : './'}" class="back-link">
        <svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        Back to Catalog
      </a>
    </div>
    <div class="single-product-layout">
      ${mediaHtml}
      <div class="single-product-details">
        ${product.category ? `<div class="single-category-tag">${emoji} ${product.category}</div>` : ''}
        <h1 class="single-title">${product.name}</h1>
        <div class="single-price">${formatPrice(product.price)}</div>
        <p class="single-desc">${product.description}</p>
        <div class="single-actions">
          <a href="${waLink}" target="_blank" class="btn btn-whatsapp">${whatsappIcon} Order on WhatsApp</a>
          ${product.instagramLink ? `<a href="${product.instagramLink}" target="_blank" class="btn btn-instagram">${instagramIcon} View on Instagram</a>` : ''}
          ${product.youtubeLink ? `<a href="${product.youtubeLink}" target="_blank" class="btn btn-youtube">${youtubeIcon} View on YouTube</a>` : ''}
          <button class="btn btn-share" onclick="shareProduct(event,'${product.id}')">${shareIcon} Share Link</button>
        </div>
      </div>
    </div>
    ${product.instagramLink ? `
      <div style="margin-top:4rem;text-align:center;">
        <h3 style="font-size:22px;font-weight:600;color:#222;margin-bottom:2rem;letter-spacing:-0.44px;">See it on Instagram</h3>
        <blockquote class="instagram-media" data-instgrm-permalink="${product.instagramLink}" data-instgrm-version="14" style="background:#FFF;border:0;border-radius:14px;box-shadow:rgba(0,0,0,0.04) 0 2px 6px;margin:0 auto;max-width:540px;min-width:326px;padding:0;width:100%;"></blockquote>
      </div>` : ''}
  `;

  setTimeout(() => {
    if (window.instgrm && window.instgrm.Embeds) window.instgrm.Embeds.process();
  }, 150);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =====================
// NAVIGATION
// =====================
function navigateToProduct(productId) {
  if (window.PRODUCT_SLUG) {
    window.location.href = `../${productId}/`;
  } else {
    window.location.href = `products/${productId}/`;
  }
}

// =====================
// CAROUSEL
// =====================
window.changeImage = function(event, productId, direction) {
  if (event) event.stopPropagation();
  const state = productCarousels[productId];
  state.currentIndex = (state.currentIndex + direction + state.images.length) % state.images.length;

  const imgEl = document.getElementById(`img-${productId}`);
  if (imgEl) imgEl.src = getAssetPath(state.images[state.currentIndex]);

  const dotsContainer = document.getElementById(`dots-${productId}`);
  if (dotsContainer) {
    dotsContainer.querySelectorAll('.dot').forEach((dot, index) => {
      dot.className = index === state.currentIndex ? 'dot active' : 'dot';
    });
  }
};

// =====================
// SHARE
// =====================
window.shareProduct = function(event, productId) {
  if (event) event.stopPropagation();
  const relativePath = window.PRODUCT_SLUG ? `../${productId}/` : `products/${productId}/`;
  const url = new URL(relativePath, window.location.href).href;
  navigator.clipboard.writeText(url).then(() => {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }).catch(() => prompt('Copy this link:', url));
};

// =====================
// MODAL
// =====================
window.openModal = function(event, src) {
  if (event) event.stopPropagation();
  const modal = document.getElementById('image-modal');
  const modalImg = document.getElementById('modal-img');
  if (modal && modalImg) {
    modalImg.src = src;
    modal.style.display = 'block';
  }
};

// =====================
// INIT
// =====================
document.getElementById('year').textContent = new Date().getFullYear();
document.addEventListener('DOMContentLoaded', loadProducts);
