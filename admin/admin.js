const API_URL = 'http://localhost:3000/api/products';
let allProducts = [];
let currentImagesToKeep = [];

function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// DOM Elements
const form = document.getElementById('product-form');
const formTitle = document.getElementById('form-title');
const productIdInput = document.getElementById('product-id');
const nameInput = document.getElementById('name');
const priceInput = document.getElementById('price');
const descInput = document.getElementById('description');
const categoryInput = document.getElementById('category');
const whatsappInput = document.getElementById('whatsapp');
const instagramInput = document.getElementById('instagramLink');
const youtubeInput = document.getElementById('youtubeLink');
const imagesInput = document.getElementById('images');
const activeInput = document.getElementById('active');
const productList = document.getElementById('product-list');
const formMessage = document.getElementById('form-message');
const imagePreview = document.getElementById('image-preview');

// Auto-generate WhatsApp message when typing
window.generateWhatsAppMsg = function() {
  // Only auto-generate if we are creating a new product or if user hasn't heavily modified it
  // For simplicity, we just generate it based on inputs
  if (nameInput.value || priceInput.value) {
    const pName = nameInput.value || '[Product Name]';
    const pPrice = priceInput.value || '[Price]';
    whatsappInput.value = `Hi! I'm interested in ordering: ${pName} (${pPrice})`;
  } else {
    whatsappInput.value = '';
  }
};

// Auto-format price while typing
priceInput.addEventListener('input', (e) => {
  let val = e.target.value.replace(/₹/g, '').trimStart();
  if (val.length > 0) {
    e.target.value = '₹' + val;
  } else {
    e.target.value = '';
  }
  window.generateWhatsAppMsg();
});

// Preview selected images
imagesInput.addEventListener('change', function() {
  const newContainer = document.getElementById('new-images-container');
  imagePreview.innerHTML = '';
  if (this.files && this.files.length > 0) {
    newContainer.style.display = 'block';
    Array.from(this.files).forEach(file => {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      imagePreview.appendChild(img);
    });
  } else {
    newContainer.style.display = 'none';
  }
});

// Show message
function showMessage(text, isError = false) {
  formMessage.textContent = text;
  formMessage.className = isError ? 'msg-error' : 'msg-success';
  formMessage.style.display = 'block';
  setTimeout(() => {
    formMessage.style.display = 'none';
  }, 3000);
}

// Reset form
window.resetForm = function() {
  form.reset();
  productIdInput.value = '';
  categoryInput.value = '';
  instagramInput.value = '';
  youtubeInput.value = '';
  formTitle.textContent = 'Add New Product';
  imagePreview.innerHTML = '';
  currentImagesToKeep = [];
  document.getElementById('existing-images-container').style.display = 'none';
  document.getElementById('existing-images-preview').innerHTML = '';
  document.getElementById('new-images-container').style.display = 'none';
  
  const displaySKU = document.getElementById('form-sku-display');
  if (displaySKU) {
    displaySKU.style.display = 'none';
    displaySKU.textContent = '';
  }
};

// Load products
async function loadProducts() {
  try {
    const res = await fetch(API_URL);
    allProducts = await res.json();
    filterProducts(); // Handles rendering with active search/filter settings
    populateCategoryDatalist();
  } catch (error) {
    console.error('Failed to load products', error);
  }
}

function populateCategoryDatalist() {
  const datalist = document.getElementById('category-suggestions');
  if (!datalist) return;
  const categories = [...new Set(allProducts.map(p => p.category).filter(Boolean))];
  datalist.innerHTML = categories.map(c => `<option value="${c}">`).join('');
}

// Render product list
window.renderProductList = function(products = allProducts) {
  productList.innerHTML = '';
  
  if (products.length === 0) {
    productList.innerHTML = '<p style="color: #6b7280; text-align: center; padding: 2rem;">No products found.</p>';
    return;
  }
  
  products.forEach(product => {
    const item = document.createElement('div');
    item.className = 'product-item';
    
    // Construct image URL (from parent directory for admin view)
    const imgSrc = product.images && product.images.length > 0 
      ? `../${product.images[0]}` 
      : 'https://via.placeholder.com/60';
      
    item.innerHTML = `
      <img src="${imgSrc}" alt="${escapeHTML(product.name)}" onerror="this.src='https://via.placeholder.com/60'">
      <div class="product-details">
        <h3>${escapeHTML(product.name)}</h3>
        <p style="font-weight: 600;">${product.price && product.price.toString().startsWith('₹') ? escapeHTML(product.price.toString()) : '₹' + escapeHTML((product.price || '').toString())}</p>
        <div style="margin-top:0.4rem;display:flex;gap:0.4rem;flex-wrap:wrap;align-items:center;">
          <span class="badge ${product.active ? '' : 'inactive'}">${product.active ? 'Active' : 'Inactive'}</span>
          ${product.sku ? `<span class="badge" style="background:#e0e7ff;color:#4338ca;border:1px solid #c7d2fe;">SKU: ${escapeHTML(product.sku)}</span>` : ''}
          ${product.category ? `<span class="badge" style="background:#f3f4f6;color:#374151;border:1px solid #e5e7eb;">${escapeHTML(product.category)}</span>` : ''}
        </div>
      </div>
      <div class="product-actions">
        <a href="../products/${escapeHTML(product.id)}/" target="_blank" class="btn btn-sm" style="background: #10b981; text-decoration: none; text-align: center;">View</a>
        <button class="btn btn-sm" onclick="editProduct('${escapeHTML(product.id)}')">Edit</button>
        <button class="btn btn-sm" style="background: #6b7280;" onclick="toggleActive('${escapeHTML(product.id)}')">Toggle</button>
        <button class="btn btn-sm btn-danger" onclick="deleteProduct('${escapeHTML(product.id)}')">Delete</button>
      </div>
    `;
    
    productList.appendChild(item);
  });
};

// Search & Filter products
window.filterProducts = function() {
  const searchQuery = document.getElementById('search-input').value.toLowerCase().trim();
  const statusFilter = document.getElementById('status-filter').value;
  const sortFilter = document.getElementById('sort-filter').value;
  
  let products = [...allProducts];
  
  // 1. Text Search (name, category, description, SKU, ID)
  if (searchQuery) {
    products = products.filter(p => {
      const name = (p.name || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      const sku = (p.sku || '').toLowerCase();
      const id = (p.id || '').toLowerCase();
      
      return name.includes(searchQuery) || 
             cat.includes(searchQuery) || 
             desc.includes(searchQuery) || 
             sku.includes(searchQuery) ||
             id.includes(searchQuery);
    });
  }
  
  // 2. Status Filter
  if (statusFilter !== 'all') {
    const wantActive = statusFilter === 'active';
    products = products.filter(p => p.active === wantActive);
  }
  
  // 3. Price Sorting
  if (sortFilter !== 'none') {
    products.sort((a, b) => {
      const priceA = parseFloat((a.price || '').toString().replace(/[^0-9.]/g, '')) || 0;
      const priceB = parseFloat((b.price || '').toString().replace(/[^0-9.]/g, '')) || 0;
      
      if (sortFilter === 'low-high') {
        return priceA - priceB;
      } else {
        return priceB - priceA;
      }
    });
  }
  
  renderProductList(products);
};

// Submit form
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  let priceVal = priceInput.value.trim();
  if (priceVal && !priceVal.startsWith('₹')) {
    priceVal = '₹' + priceVal;
  }
  
  const formData = new FormData();
  formData.append('id', productIdInput.value);
  formData.append('name', nameInput.value);
  formData.append('price', priceVal);
  formData.append('description', descInput.value);
  formData.append('category', categoryInput.value.trim());
  formData.append('whatsappMessage', whatsappInput.value);
  formData.append('instagramLink', instagramInput.value);
  formData.append('youtubeLink', youtubeInput.value);
  formData.append('active', activeInput.checked);
  
  if (imagesInput.files) {
    Array.from(imagesInput.files).forEach(file => {
      formData.append('images', file);
    });
  }
  
  if (productIdInput.value) {
    formData.append('keepImages', JSON.stringify(currentImagesToKeep));
  }
  
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: formData
    });
    
    const result = await res.json();
    
    if (res.ok) {
      showMessage('Product saved successfully!');
      resetForm();
      loadProducts();
    } else {
      showMessage(result.error || 'Failed to save product', true);
    }
  } catch (error) {
    console.error(error);
    showMessage('An error occurred while saving', true);
  }
});

// Edit product
window.editProduct = function(id) {
  const product = allProducts.find(p => p.id === id);
  if (!product) return;
  
  formTitle.textContent = 'Edit Product';
  productIdInput.value = product.id;
  nameInput.value = product.name;
  
  const displaySKU = document.getElementById('form-sku-display');
  if (displaySKU && product.sku) {
    displaySKU.textContent = `SKU: ${product.sku}`;
    displaySKU.style.display = 'block';
  } else if (displaySKU) {
    displaySKU.style.display = 'none';
  }
  priceInput.value = product.price;
  descInput.value = product.description;
  categoryInput.value = product.category || '';
  whatsappInput.value = product.whatsappMessage || '';
  instagramInput.value = product.instagramLink || '';
  youtubeInput.value = product.youtubeLink || '';
  activeInput.checked = product.active;
  
  // Clear images input since we can't pre-fill file inputs
  imagesInput.value = '';
  
  // Show existing images in preview
  currentImagesToKeep = product.images ? [...product.images] : [];
  renderExistingImages();
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Render existing images with remove button
window.renderExistingImages = function() {
  const container = document.getElementById('existing-images-container');
  const preview = document.getElementById('existing-images-preview');
  if (!preview || !container) return;
  
  preview.innerHTML = '';
  
  if (currentImagesToKeep.length > 0) {
    container.style.display = 'block';
    currentImagesToKeep.forEach((img, idx) => {
      const item = document.createElement('div');
      item.className = 'image-preview-item';
      
      const imageEl = document.createElement('img');
      imageEl.src = `../${img}`;
      imageEl.alt = 'Product image';
      
      const removeBtn = document.createElement('span');
      removeBtn.className = 'remove-btn';
      removeBtn.innerHTML = '&times;';
      removeBtn.onclick = () => {
        currentImagesToKeep.splice(idx, 1);
        renderExistingImages();
      };
      
      item.appendChild(imageEl);
      item.appendChild(removeBtn);
      preview.appendChild(item);
    });
  } else {
    container.style.display = 'none';
  }
};

// Delete product
window.deleteProduct = async function(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;
  
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showMessage('Product deleted');
      loadProducts();
    } else {
      showMessage('Failed to delete', true);
    }
  } catch (error) {
    showMessage('Error deleting product', true);
  }
};

// Toggle active
window.toggleActive = async function(id) {
  try {
    const res = await fetch(`${API_URL}/${id}/toggle`, { method: 'PUT' });
    if (res.ok) {
      loadProducts();
    }
  } catch (error) {
    showMessage('Error toggling status', true);
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', loadProducts);
