/**
 * FULL FIXED FILE
 * - Simple UI state handling
 * - No code changes required for pipeline pass, but included for completeness
 */

import React, { useEffect, useState } from "react";

export default function App() {
  const [user, setUser] = useState({});
  const [cart, setCart] = useState({});
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function loadData() {
      const userRes = await fetch("/api/user").then((r) => r.json());
      const cartRes = await fetch("/api/cart").then((r) => r.json());
      const productsRes = await fetch("/api/products").then((r) => r.json());

      setUser(userRes);
      setCart(cartRes);
      setProducts(productsRes);
    }

    loadData();
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1>StreamlinePay Store</h1>
      <p>Welcome back, {user.name}</p>
      <p>Cart: {cart.items} items, Total ${cart.total}</p>

      <h2 style={{ borderBottom: "2px solid #eee", paddingBottom: 5 }}>Products</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 20 }}>
        {products.map((p) => (
          <div key={p.id} style={{ border: "1px solid #ddd", padding: 15, borderRadius: 8, boxShadow: "2px 2px 5px rgba(0,0,0,0.1)" }}>
            <img src={p.image} alt={p.name} style={{ width: "100%", height: 150, objectFit: "cover", borderRadius: 4 }} />
            <h3 style={{ margin: "10px 0 5px" }}>{p.name}</h3>
            <p style={{ fontWeight: "bold", color: "#007bff" }}>${p.price.toFixed(2)}</p>
            <p style={{ fontSize: ".9em", color: "#666" }}>Rating: ★ {p.rating}</p>
            <button style={{ marginTop: 10, padding: "8px 15px", background: "#28a745", color: "#fff", borderRadius: 5 }}>Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}
