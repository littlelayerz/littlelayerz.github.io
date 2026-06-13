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
    return JSON.parse(data);
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
      
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${product.description.replace(/"/g, '&quot;')}">
  
  <!-- Open Graph / WhatsApp / Social Previews -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://littlelayerz.github.io/products/${product.id}/">
  <link rel="icon" type="image/png" href="../../favicon.png">
  <meta property="og:title" content="${product.name} | Little Layerz">
  <meta property="og:description" content="${product.description.replace(/"/g, '&quot;')}">
  <meta property="og:image" content="${ogImage}">
  
  <title>${product.name} | Little Layerz</title>
  
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Outfit:wght@300;400;600;700;800&display=swap" rel="stylesheet">
  
  <script async src="//www.instagram.com/embed.js"></script>
  <link rel="stylesheet" href="../../style.css">
  <script>window.PRODUCT_SLUG = "${product.id}";</script>
</head>
<body>
  <header>
    <div class="header-container">
      <div class="logo">
        <a href="../../" style="text-decoration:none; color:inherit;">
          <h1>Little<span>Layerz</span></h1>
        </a>
        <p class="tagline">Premium Custom Items • Directly to You</p>
      </div>
    </div>
  </header>

  <main>
    <div class="container">
      <div id="catalog-intro" class="catalog-header" style="display:none;"></div>
      <div id="products-grid" class="products-grid">
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Loading product details...</p>
        </div>
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
  <div id="image-modal" class="modal" onclick="this.style.display='none'">
    <span class="modal-close">&times;</span>
    <img class="modal-content" id="modal-img">
  </div>

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
app.post('/api/products', upload.array('images', 5), async (req, res) => {
  try {
    const { id, name, description, price, category, whatsappMessage, instagramLink, youtubeLink, active } = req.body;
    let products = await readProducts();
    
    let productId = id;
    let isNew = false;
    
    if (!productId) {
      // New product
      productId = generateSlug(name);
      
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
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const timestamp = Date.now();
        const filename = `${productId}-${timestamp}-${i + 1}.jpg`;
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
      name,
      description,
      category: category || '',
      price,
      whatsappMessage: whatsappMessage || `Hi! I'm interested in ordering: ${name} (${price})`,
      instagramLink: instagramLink || '',
      youtubeLink: youtubeLink || '',
      active: active === 'true' || active === true
    };

    if (isNew) {
      productData.images = newImagePaths;
      products.unshift(productData);
    } else {
      const index = products.findIndex(p => p.id === productId);
      if (index !== -1) {
        // Keep existing images if no new ones are uploaded
        productData.images = newImagePaths.length > 0 ? newImagePaths : products[index].images;
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

app.listen(PORT, () => {
  console.log(`Admin server running at http://localhost:${PORT}`);
});
