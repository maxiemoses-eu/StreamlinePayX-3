const express = require('express');
const app = express();
const port = 3001;

const products = [
  { id: 1, name: 'Women Kurta, Pyjama & Dupatta Set Pure Cotton', price: 27, rating: 4.3, image: 'kurta.jpg' },
  { id: 2, name: 'K3300L W Flip Flops (Navy 4)', price: 15, rating: 4.1, image: 'flipflops.jpg' },
  { id: 3, name: 'Morphy Richards Oven Toaster Grill (OTG)', price: 240, rating: 4.8, image: 'otg.jpg' },
  { id: 4, name: 'realme 9i (Prism Black, 128 GB) (6 GB RAM)', price: 423, rating: 3.9, image: 'phone.jpg' },
];

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

// ✅ HEALTH CHECK (THIS FIXES EVERYTHING)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/api/v1/products', (req, res) => {
  console.log('Product request received.');
  res.json(products);
});

app.listen(port, () => {
  console.log(`Products service listening on port ${port}`);
});
