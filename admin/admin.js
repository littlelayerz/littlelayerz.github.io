const API_URL = 'http://localhost:3000/api/products';
let allProducts = [];

// DOM Elements
const form = document.getElementById('product-form');
const formTitle = document.getElementById('form-title');
const productIdInput = document.getElementById('product-id');
const nameInput = document.getElementById('name');
const priceInput = document.getElementById('price');
const descInput = document.getElementById('description');
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
  imagePreview.innerHTML = '';
  if (this.files) {
    Array.from(this.files).forEach(file => {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      imagePreview.appendChild(img);
    });
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
  instagramInput.value = '';
  youtubeInput.value = '';
  formTitle.textContent = 'Add New Product';
  imagePreview.innerHTML = '';
};

// Load products
async function loadProducts() {
  try {
    const res = await fetch(API_URL);
    allProducts = await res.json();
    renderProductList();
  } catch (error) {
    console.error('Failed to load products', error);
  }
}

// Render product list
function renderProductList() {
  productList.innerHTML = '';
  
  if (allProducts.length === 0) {
    productList.innerHTML = '<p style="color: #6b7280; text-align: center; padding: 2rem;">No products found. Add one above!</p>';
    return;
  }
  
  allProducts.forEach(product => {
    const item = document.createElement('div');
    item.className = 'product-item';
    
    // Construct image URL (from parent directory for admin view)
    const imgSrc = product.images && product.images.length > 0 
      ? `../${product.images[0]}` 
      : 'https://via.placeholder.com/60';
      
    item.innerHTML = `
      <img src="${imgSrc}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/60'">
      <div class="product-details">
        <h3>${product.name}</h3>
        <p>${product.price && product.price.toString().startsWith('₹') ? product.price : '₹' + product.price}</p>
        <div style="margin-top: 0.5rem;">
          <span class="badge ${product.active ? '' : 'inactive'}">${product.active ? 'Active' : 'Inactive'}</span>
        </div>
      </div>
      <div class="product-actions">
        <a href="../products/${product.id}/" target="_blank" class="btn btn-sm" style="background: #10b981; text-decoration: none; text-align: center;">View</a>
        <button class="btn btn-sm" onclick="editProduct('${product.id}')">Edit</button>
        <button class="btn btn-sm" style="background: #6b7280;" onclick="toggleActive('${product.id}')">Toggle</button>
        <button class="btn btn-sm btn-danger" onclick="deleteProduct('${product.id}')">Delete</button>
      </div>
    `;
    
    productList.appendChild(item);
  });
}

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
  formData.append('whatsappMessage', whatsappInput.value);
  formData.append('instagramLink', instagramInput.value);
  formData.append('youtubeLink', youtubeInput.value);
  formData.append('active', activeInput.checked);
  
  if (imagesInput.files) {
    Array.from(imagesInput.files).forEach(file => {
      formData.append('images', file);
    });
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
  priceInput.value = product.price;
  descInput.value = product.description;
  whatsappInput.value = product.whatsappMessage || '';
  instagramInput.value = product.instagramLink || '';
  youtubeInput.value = product.youtubeLink || '';
  activeInput.checked = product.active;
  
  // Clear images input since we can't pre-fill file inputs
  imagesInput.value = '';
  
  // Show existing images in preview
  imagePreview.innerHTML = '';
  if (product.images) {
    product.images.forEach(img => {
      const el = document.createElement('img');
      el.src = `../${img}`;
      imagePreview.appendChild(el);
    });
  }
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
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
