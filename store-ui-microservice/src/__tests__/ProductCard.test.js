import { render, screen } from '@testing-library/react';
import React from 'react';
import ProductCard from '../components/ProductCard';

describe('ProductCard Component', () => {
  const mockProduct = {
    id: 1,
    name: 'Luxury Widget',
    price: 19.99,
    rating: 4.2,
  };

  test('renders product name correctly', () => {
    render(<ProductCard product={mockProduct} />);
    // Simple text match is reliable for the name
    expect(screen.getByText('Luxury Widget')).toBeInTheDocument();
  });

  test('renders product price in the expected format', () => {
    render(<ProductCard product={mockProduct} />);
    // Check for the exact rendered string: $19.99
    expect(screen.getByText('$19.99')).toBeInTheDocument();
  });

  test('renders product rating in the expected format', () => {
    render(<ProductCard product={mockProduct} />);
    // Check for the exact rendered string: ★ 4.2
    // We use a regular expression to match the star (★) and the rating number.
    expect(screen.getByText(/★ 4\.2/)).toBeInTheDocument();
  });
  
  test('renders the "Add to Cart" button', () => {
    render(<ProductCard product={mockProduct} />);
    // Check for the button text
    expect(screen.getByRole('button', { name: /Add to Cart/i })).toBeInTheDocument();
  });
});