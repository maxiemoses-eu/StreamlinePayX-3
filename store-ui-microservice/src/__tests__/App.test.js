import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import App from '../App';
// Import fetch polyfill setup if running outside a browser environment (typical in CI)
// Although 'react-scripts test' often handles this.

// Mock the global 'fetch' function to prevent actual API calls during the test.
// We are mocking the three API calls made in App.js.
global.fetch = jest.fn((url) => {
  if (url.includes('/api/products/')) {
    return Promise.resolve({
      json: () => Promise.resolve([
        { id: 1, name: 'Test Product A', price: 10.00, rating: 4.5 },
        { id: 2, name: 'Test Product B', price: 20.00, rating: 3.8 }
      ]),
    });
  } else if (url.includes('/api/user/')) {
    return Promise.resolve({
      json: () => Promise.resolve({ name: 'Maxie' }),
    });
  } else if (url.includes('/api/cart/')) {
    return Promise.resolve({
      json: () => Promise.resolve({ items: 3, total: 30.00 }),
    });
  }
  return Promise.reject(new Error('Unknown API endpoint'));
});


describe('App Component Smoke Tests', () => {

  // Test 1: Check if the main heading is rendered
  test('renders the main store heading', async () => {
    render(<App />);
    const headingElement = screen.getByText(/StreamlinePay Store/i);
    expect(headingElement).toBeInTheDocument();
  });

  // Test 2: Check if products and user data are rendered after fetch
  test('renders fetched product and user data correctly', async () => {
    render(<App />);

    // Wait for the asynchronous fetch calls to resolve and the UI to update
    await waitFor(() => {
        // Verify the fetched user name appears
        expect(screen.getByText(/Welcome back, Maxie/i)).toBeInTheDocument();
    });

    // Verify the fetched products appear via their name
    expect(screen.getByText('Test Product A')).toBeInTheDocument();
    expect(screen.getByText('Test Product B')).toBeInTheDocument();

    // Verify cart data is displayed
    expect(screen.getByText(/Cart: 3 items, Total \$30\.00/i)).toBeInTheDocument();

  });

  // Cleanup mocks after all tests
  afterAll(() => {
    jest.restoreAllMocks();
  });
});