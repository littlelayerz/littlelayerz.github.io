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
app.use('/images', express.static(path.join(__dirname, '..', 'images'))); // Serve images folder
app.use('/preview', express.static(path.join(__dirname, '..'))); // Serve root folder for preview

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
    const { id, name, description, price, whatsappMessage, instagramLink, youtubeLink, active } = req.body;
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
