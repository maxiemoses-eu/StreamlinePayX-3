import React, { useEffect, useState } from 'react';
import ProductCard from './components/ProductCard';

function App() {
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState(null);

  // Use relative paths that Nginx will intercept and proxy to the K8s services
  const PRODUCTS_URL = '/api/products/api/v1/products';
  const USER_URL = '/api/user/api/v1/user/profile';
  const CART_URL = '/api/cart/api/v1/cart/summary';

  useEffect(() => {
    // Note: Fetching from relative paths in a browser environment
    fetch(PRODUCTS_URL).then(res => res.json()).then(setProducts).catch(console.error);
    fetch(USER_URL).then(res => res.json()).then(setUser).catch(console.error);
    fetch(CART_URL).then(res => res.json()).then(setCart).catch(console.error);
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>StreamlinePay Store</h1>
      <p>{user ? `Welcome back, ${user.name}` : 'Loading user profile...'}</p>
      <p>{cart ? `Cart: ${cart.items} items, Total $${cart.total}` : 'Loading cart summary...'}</p>
      
      <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '5px' }}>Products</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}

export default App;