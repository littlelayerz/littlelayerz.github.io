# Little Layerz - Product Catalog

A lightweight, static-friendly product catalog for Little Layerz. Built specifically to be hosted for free on GitHub Pages while supporting single-page product sharing and an easy-to-use local admin interface.

## 🚀 How it Works

The project is split into two parts:
1. **The Public Website**: A fully static frontend (`index.html`, `script.js`, `style.css`) that reads data from `products.json`. Because it's static, it runs flawlessly on GitHub Pages.
2. **The Local Admin Tool**: A Node.js backend located in the `/admin` folder. You run this *only on your own Mac* to add, edit, or delete products and upload images. It automatically modifies `products.json` and resizes images into the `/images` folder. 

Once you make changes locally via the admin tool, you simply commit and push your changes to GitHub, and the live website updates instantly!

---

## 🛠️ Step-by-Step Usage Guide

### 1. Managing Your Products (Admin Panel)

You need to run the admin server locally to update your catalog.

1. Open a terminal on your Mac.
2. Navigate to the admin directory:
   ```bash
   cd path/to/littlelayerz.github.io/admin
   ```
3. Start the admin server:
   ```bash
   npm start
   ```
4. Open your browser and go to: **http://localhost:3000/admin.html**
5. Use the dashboard to Add, Edit, or Delete your items. You can upload multiple images per product, and they will be automatically compressed and optimized!

### 2. Pushing Updates to the Live Website

After you have added or updated products via the admin tool, those changes are saved locally to `products.json` and the `/images/` folder. To push them live:

1. Open your terminal in the root folder (`littlelayerz.github.io`).
2. Run the following git commands:
   ```bash
   git add .
   git commit -m "Update products catalog"
   git push origin main
   ```
3. Wait about 30 seconds for GitHub Pages to rebuild, and your live website will reflect the changes!

---

## 🔗 Feature Highlights

- **WhatsApp Integration**: Customers simply tap "Order on WhatsApp" and it instantly opens a chat with you, pre-filled with the exact product name and price they want.
- **Direct Product Sharing**: Every product has a unique link (e.g. `https://littlelayerz.github.io/?p=product-slug`). You can send these directly to customers to show off a specific print!
- **Mobile Friendly Image Zoom**: Tap any product image on mobile to view it in full screen and pinch-to-zoom for details.

Enjoy managing Little Layerz!
