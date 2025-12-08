import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import App from '../App';
import '@testing-library/jest-dom';   // ✅ this line fixes the matcher error

describe('App Component Smoke Tests', () => {
  beforeEach(() => {
    global.fetch = jest.fn((url) => {
      if (/\/api\/products/.test(url)) {
        return Promise.resolve({
          json: () => Promise.resolve([
            { id: 1, name: 'Test Product A', price: 10.00, rating: 4.5 },
            { id: 2, name: 'Test Product B', price: 20.00, rating: 3.8 }
          ]),
        });
      } else if (/\/api\/user/.test(url)) {
        return Promise.resolve({
          json: () => Promise.resolve({ name: 'Maxie' }),
        });
      } else if (/\/api\/cart/.test(url)) {
        return Promise.resolve({
          json: () => Promise.resolve({ items: 3, total: 30.00 }),
        });
      }
      return Promise.reject(new Error(`Unknown API endpoint: ${url}`));
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('renders the main store heading', () => {
    render(<App />);
    expect(screen.getByText(/StreamlinePay Store/i)).toBeInTheDocument();
  });

  test('renders fetched product, user, and cart data', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/Welcome back, Maxie/i)).toBeInTheDocument();
    });
    expect(screen.getByText('Test Product A')).toBeInTheDocument();
    expect(screen.getByText('Test Product B')).toBeInTheDocument();
    expect(screen.getByText(/Cart: 3 items, Total \$30\.00/i)).toBeInTheDocument();
  });
});
