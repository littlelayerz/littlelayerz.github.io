document.getElementById('year').textContent = new Date().getFullYear();

// Global Configuration
const PHONE_NUMBER = "917831899586";
const formatPrice = (price) => {
  const p = price ? price.toString().trim() : '';
  return p.startsWith('₹') ? p : `₹${p}`;
};
const INSTAGRAM_USERNAME = "littlelayerz";
const shareIcon = `<svg class="icon" viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>`;
const whatsappIcon = `<svg class="icon" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>`;
const instagramIcon = `<svg class="icon" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`;
const youtubeIcon = `<svg class="icon" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`;

// Global state for product images
const productCarousels = {};
let allProducts = [];

const getAssetPath = (path) => window.PRODUCT_SLUG ? `../../${path}` : path;

async function loadProducts() {
  const grid = document.getElementById('products-grid');
  try {
    const res = await fetch(getAssetPath('products.json'));
    if (!res.ok) throw new Error('Failed to fetch products');
    allProducts = await res.json();
    
    if (window.PRODUCT_SLUG) {
      const product = allProducts.find(p => p.id === window.PRODUCT_SLUG && p.active);
      if (product) {
        renderSingleProduct(product, grid);
        return;
      }
    }
    
    // Check URL parameters for single product view
    const params = new URLSearchParams(window.location.search);
    const productSlug = params.get('p');
    
    if (productSlug) {
      const product = allProducts.find(p => p.id === productSlug && p.active);
      if (product) {
        renderSingleProduct(product, grid);
        return;
      }
    }
    
    // Default: Filter active products and render catalog
    const activeProducts = allProducts.filter(p => p.active);
    
    if (activeProducts.length === 0) {
      grid.innerHTML = '<div class="loading-state"><p>No products available right now.</p></div>';
      return;
    }
    
    renderCatalog(activeProducts, grid);
  } catch (error) {
    console.error(error);
    grid.innerHTML = '<div class="loading-state"><p>Error loading products. Please try again later.</p></div>';
  }
}

function renderCatalog(products, container) {
  // Show catalog header
  document.getElementById('catalog-intro').style.display = 'block';
  container.className = 'products-grid';
  container.innerHTML = '';
  
  products.forEach(product => {
    productCarousels[product.id] = {
      images: product.images,
      currentIndex: 0
    };
    
    const waLink = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(product.whatsappMessage)}`;
    const hasImages = product.images && product.images.length > 0;
    const hasMultipleImages = hasImages && product.images.length > 1;
    
    const card = document.createElement('div');
    card.className = 'product-card';
    card.id = product.id;
    
    let carouselHtml = '';
    if (hasImages) {
      carouselHtml = `
        <div class="card-image-container">
          <img src="${getAssetPath(product.images[0])}" alt="${product.name}" class="card-image" id="img-${product.id}" onclick="openModal(event, this.src)">
          ${hasMultipleImages ? `
            <button class="carousel-btn carousel-prev" onclick="changeImage(event, '${product.id}', -1)" aria-label="Previous image">❮</button>
            <button class="carousel-btn carousel-next" onclick="changeImage(event, '${product.id}', 1)" aria-label="Next image">❯</button>
            <div class="carousel-dots" id="dots-${product.id}">
              ${product.images.map((_, i) => `<div class="dot ${i === 0 ? 'active' : ''}"></div>`).join('')}
            </div>
          ` : ''}
        </div>
      `;
    } else if (product.instagramLink) {
      carouselHtml = `
        <div class="card-image-container" style="display: flex; align-items: center; justify-content: center; background: #fff; overflow-y: auto;">
          <blockquote class="instagram-media" data-instgrm-permalink="${product.instagramLink}" data-instgrm-version="14" style="background:#FFF; border:0; margin: 0; padding:0; width:100%;"></blockquote>
        </div>
      `;
    } else {
      carouselHtml = `
        <div class="card-image-container">
          <img src="https://via.placeholder.com/400x400?text=No+Image" alt="${product.name}" class="card-image">
        </div>
      `;
    }

    card.innerHTML = `
      ${carouselHtml}
      <div class="card-header">
        <h3 class="card-title">${product.name}</h3>
        <span class="card-price">${formatPrice(product.price)}</span>
      </div>
      <p class="card-desc">${product.description}</p>
      <div class="card-actions">
        <a href="https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(product.whatsappMessage || `Hi, I would like to order: ${product.name} (${formatPrice(product.price)})`)}" target="_blank" class="btn btn-whatsapp" onclick="event.stopPropagation()">WhatsApp</a>
        ${product.instagramLink ? `<a href="${product.instagramLink}" target="_blank" class="btn btn-social btn-instagram" onclick="event.stopPropagation()" aria-label="Instagram">${instagramIcon}</a>` : ''}
        ${product.youtubeLink ? `<a href="${product.youtubeLink}" target="_blank" class="btn btn-social btn-youtube" onclick="event.stopPropagation()" aria-label="YouTube">${youtubeIcon}</a>` : ''}
        <button class="btn btn-share" onclick="shareProduct(event, '${product.id}')" aria-label="Share">${shareIcon}</button>
      </div>
    `;
    
    // Clicking card (except buttons) opens product details
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.btn') && !e.target.closest('.carousel-btn')) {
        navigateToProduct(product.id);
      }
    });
    
    container.appendChild(card);
  });
  
  // Re-process instagram embeds for the catalog
  setTimeout(() => {
    if (window.instgrm && window.instgrm.Embeds) {
      window.instgrm.Embeds.process();
    }
  }, 100);
}

function renderSingleProduct(product, container) {
  // Hide catalog header
  document.getElementById('catalog-intro').style.display = 'none';
  
  container.className = 'single-product-container';
  
  productCarousels[product.id] = {
    images: product.images,
    currentIndex: 0
  };
  
  const waLink = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(product.whatsappMessage || `Hi, I would like to order: ${product.name} (${formatPrice(product.price)})`)}`;
  const hasImages = product.images && product.images.length > 0;
  const hasMultipleImages = hasImages && product.images.length > 1;
  
  let carouselHtml = '';
  if (hasImages) {
    carouselHtml = `
      <div class="card-image-container single-view-image">
        <img src="${getAssetPath(product.images[0])}" alt="${product.name}" class="card-image" id="img-${product.id}" onclick="openModal(event, this.src)">
        ${hasMultipleImages ? `
          <button class="carousel-btn carousel-prev" onclick="changeImage(event, '${product.id}', -1)" aria-label="Previous image">❮</button>
          <button class="carousel-btn carousel-next" onclick="changeImage(event, '${product.id}', 1)" aria-label="Next image">❯</button>
          <div class="carousel-dots" id="dots-${product.id}">
            ${product.images.map((_, i) => `<div class="dot ${i === 0 ? 'active' : ''}"></div>`).join('')}
          </div>
        ` : ''}
      </div>
    `;
  } else if (product.instagramLink) {
    carouselHtml = `
      <div class="card-image-container single-view-image" style="display: flex; align-items: center; justify-content: center; background: #fff; overflow-y: auto;">
        <blockquote class="instagram-media" data-instgrm-permalink="${product.instagramLink}" data-instgrm-version="14" style="background:#FFF; border:0; margin: 0; padding:0; width:100%;"></blockquote>
      </div>
    `;
  } else {
    carouselHtml = `
      <div class="card-image-container single-view-image">
        <img src="https://via.placeholder.com/400x400?text=No+Image" alt="${product.name}" class="card-image">
      </div>
    `;
  }

  container.innerHTML = `
    <div class="back-nav">
      <a href="${window.PRODUCT_SLUG ? '../../' : './'}" class="back-link">
        <svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        Back to Catalog
      </a>
    </div>
    <div class="single-product-layout">
      ${carouselHtml}
      <div class="single-product-details">
        <h2 class="single-title">${product.name}</h2>
        <div class="single-price">${formatPrice(product.price)}</div>
        <p class="single-desc">${product.description}</p>
        <div class="card-actions single-actions">
          <a href="${waLink}" target="_blank" class="btn btn-whatsapp">${whatsappIcon} Order on WhatsApp</a>
          <div style="display: flex; flex-wrap: wrap; gap: 12px; width: 100%;">
            ${product.instagramLink ? `<a href="${product.instagramLink}" target="_blank" class="btn btn-instagram" style="flex:1" aria-label="Instagram">${instagramIcon} View on Instagram</a>` : ''}
            ${product.youtubeLink ? `<a href="${product.youtubeLink}" target="_blank" class="btn btn-youtube" style="flex:1" aria-label="YouTube">${youtubeIcon} View on YouTube</a>` : ''}
          </div>
          <button class="btn btn-share" onclick="shareProduct(event, '${product.id}')">${shareIcon} Share Link</button>
        </div>
      </div>
    </div>
    ${product.instagramLink && hasImages ? `
      <div style="margin-top: 4rem; text-align: center;">
        <h3 style="font-family: var(--font-heading); margin-bottom: 2rem; font-size: 2rem;">See it on Instagram</h3>
        <blockquote class="instagram-media" data-instgrm-permalink="${product.instagramLink}" data-instgrm-version="14" style="background:#FFF; border:0; border-radius:12px; box-shadow:var(--glass-shadow); margin: 0 auto; max-width:540px; min-width:326px; padding:0; width:100%;">
        </blockquote>
      </div>
    ` : ''}
  `;

  // Re-process instagram embeds if the script is loaded
  setTimeout(() => {
    if (window.instgrm && window.instgrm.Embeds) {
      window.instgrm.Embeds.process();
    }
  }, 100);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function navigateToProduct(productId) {
  if (window.PRODUCT_SLUG) {
    window.location.href = `../${productId}/`;
  } else {
    window.location.href = `products/${productId}/`;
  }
}

// Global function to change images in carousel
window.changeImage = function(event, productId, direction) {
  if (event) event.stopPropagation();
  const state = productCarousels[productId];
  state.currentIndex += direction;
  
  if (state.currentIndex >= state.images.length) {
    state.currentIndex = 0;
  } else if (state.currentIndex < 0) {
    state.currentIndex = state.images.length - 1;
  }
  
  const imgEl = document.getElementById(`img-${productId}`);
  imgEl.src = getAssetPath(state.images[state.currentIndex]);
  
  // Update dots
  const dotsContainer = document.getElementById(`dots-${productId}`);
  if (dotsContainer) {
    const dots = dotsContainer.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
      dot.className = index === state.currentIndex ? 'dot active' : 'dot';
    });
  }
};

// Global function to copy share link
window.shareProduct = function(event, productId) {
  if (event) event.stopPropagation();
  
  const relativePath = window.PRODUCT_SLUG ? `../${productId}/` : `products/${productId}/`;
  const url = new URL(relativePath, window.location.href).href;
  
  navigator.clipboard.writeText(url).then(() => {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }).catch(err => {
    console.error('Failed to copy link: ', err);
    prompt('Copy this link:', url);
  });
};

// Global function to open image modal
window.openModal = function(event, src) {
  if (event) event.stopPropagation(); // prevent clicking from navigating to single product page
  const modal = document.getElementById('image-modal');
  const modalImg = document.getElementById('modal-img');
  if (modal && modalImg) {
    modalImg.src = src;
    modal.style.display = 'block';
  }
};

// Start
document.addEventListener('DOMContentLoaded', loadProducts);
