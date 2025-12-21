import React from 'react';

// Functional component to display product details
function ProductCard({ product }) {
  // Use a minimal style for visual differentiation
  const cardStyle = { 
    border: '1px solid #ddd', 
    padding: '15px', 
    borderRadius: '8px',
    boxShadow: '2px 2px 5px rgba(0,0,0,0.1)'
  };
  
  return (
    <div style={cardStyle}>
      {/* Placeholder image */}
      <img src="https://via.placeholder.com/250" alt={product.name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }} />
      
      {/* Product Information */}
      <h3 style={{ margin: '10px 0 5px 0' }}>{product.name}</h3>
      <p style={{ fontWeight: 'bold', color: '#007bff' }}>${product.price ? product.price.toFixed(2) : 'N/A'}</p>
      <p style={{ fontSize: '0.9em', color: '#666' }}>Rating: ★ {product.rating || 'No rating'}</p>
      
      <button style={{ 
        marginTop: '10px', 
        padding: '8px 15px', 
        backgroundColor: '#28a745', 
        color: 'white', 
        border: 'none', 
        borderRadius: '5px',
        cursor: 'pointer'
      }}>
        Add to Cart
      </button>
    </div>
  );
}

export default ProductCard;