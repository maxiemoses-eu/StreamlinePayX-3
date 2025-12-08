import { render, screen } from '@testing-library/react';
import React from 'react';
import ProductCard from '../components/ProductCard';

const mockProduct = { id: 1, name: 'Luxury Widget', price: 19.99, rating: 4.2 };

describe('ProductCard Component', () => {
  test('renders product name correctly', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Luxury Widget')).toBeInTheDocument();
  });

  test('renders product price in the expected format', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText(/\$19\.99/)).toBeInTheDocument();
  });

  test('renders product rating in the expected format', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText(/★\s*4\.2/)).toBeInTheDocument();
  });

  test('renders the "Add to Cart" button', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByRole('button', { name: /Add to Cart/i })).toBeInTheDocument();
  });
});
