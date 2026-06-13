document.getElementById('year').textContent = new Date().getFullYear();

const PHONE_NUMBER = "917831899586";
const INSTAGRAM_USERNAME = "littlelayerz";
const shareIcon = `<svg class="icon" viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>`;
const whatsappIcon = `<svg class="icon" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>`;

// Global state for product images
const productCarousels = {};
let allProducts = [];

async function loadProducts() {
  const grid = document.getElementById('products-grid');
  try {
    const res = await fetch('products.json');
    if (!res.ok) throw new Error('Failed to fetch products');
    allProducts = await res.json();
    
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
    const hasMultipleImages = product.images.length > 1;
    
    const card = document.createElement('div');
    card.className = 'product-card';
    card.id = product.id;
    
    let carouselHtml = `
      <div class="card-image-container">
        <img src="${product.images[0]}" alt="${product.name}" class="card-image" id="img-${product.id}" onclick="openModal(event, this.src)">
        ${hasMultipleImages ? `
          <button class="carousel-btn carousel-prev" onclick="changeImage(event, '${product.id}', -1)" aria-label="Previous image">❮</button>
          <button class="carousel-btn carousel-next" onclick="changeImage(event, '${product.id}', 1)" aria-label="Next image">❯</button>
          <div class="carousel-dots" id="dots-${product.id}">
            ${product.images.map((_, i) => `<div class="dot ${i === 0 ? 'active' : ''}"></div>`).join('')}
          </div>
        ` : ''}
      </div>
    `;

    card.innerHTML = `
      ${carouselHtml}
      <div class="card-header">
        <h3 class="card-title">${product.name}</h3>
        <span class="card-price">${product.price}</span>
      </div>
      <p class="card-desc">${product.description}</p>
      <div class="card-actions">
        <a href="${waLink}" target="_blank" class="btn btn-whatsapp">${whatsappIcon} Order</a>
        <button class="btn btn-share" onclick="shareProduct(event, '${product.id}')" aria-label="Share product">${shareIcon}</button>
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
}

function renderSingleProduct(product, container) {
  // Hide catalog header
  document.getElementById('catalog-intro').style.display = 'none';
  
  container.className = 'single-product-container';
  
  productCarousels[product.id] = {
    images: product.images,
    currentIndex: 0
  };
  
  const waLink = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(product.whatsappMessage)}`;
  const hasMultipleImages = product.images.length > 1;
  
  let carouselHtml = `
    <div class="card-image-container single-view-image">
      <img src="${product.images[0]}" alt="${product.name}" class="card-image" id="img-${product.id}" onclick="openModal(event, this.src)">
      ${hasMultipleImages ? `
        <button class="carousel-btn carousel-prev" onclick="changeImage(event, '${product.id}', -1)" aria-label="Previous image">❮</button>
        <button class="carousel-btn carousel-next" onclick="changeImage(event, '${product.id}', 1)" aria-label="Next image">❯</button>
        <div class="carousel-dots" id="dots-${product.id}">
          ${product.images.map((_, i) => `<div class="dot ${i === 0 ? 'active' : ''}"></div>`).join('')}
        </div>
      ` : ''}
    </div>
  `;

  container.innerHTML = `
    <div class="back-nav">
      <a href="#" class="back-link" onclick="goBackToCatalog(event)">← Back to Catalog</a>
    </div>
    <div class="single-product-layout">
      ${carouselHtml}
      <div class="single-product-details">
        <h2 class="single-title">${product.name}</h2>
        <div class="single-price">${product.price}</div>
        <p class="single-desc">${product.description}</p>
        <div class="card-actions single-actions">
          <a href="${waLink}" target="_blank" class="btn btn-whatsapp">${whatsappIcon} Order on WhatsApp</a>
          <button class="btn btn-share" onclick="shareProduct(event, '${product.id}')" aria-label="Share product">${shareIcon} Share Link</button>
        </div>
      </div>
    </div>
  `;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function navigateToProduct(productId) {
  const newUrl = `${window.location.origin}${window.location.pathname}?p=${productId}`;
  window.history.pushState({ path: newUrl }, '', newUrl);
  const product = allProducts.find(p => p.id === productId);
  if (product) {
    renderSingleProduct(product, document.getElementById('products-grid'));
  }
}

window.goBackToCatalog = function(e) {
  if (e) e.preventDefault();
  const cleanUrl = `${window.location.origin}${window.location.pathname}`;
  window.history.pushState({ path: cleanUrl }, '', cleanUrl);
  loadProducts();
};

// Handle history navigation (back button)
window.addEventListener('popstate', loadProducts);

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
  imgEl.src = state.images[state.currentIndex];
  
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
  const url = `${window.location.origin}${window.location.pathname}?p=${productId}`;
  
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
