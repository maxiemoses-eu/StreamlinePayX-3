import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import App from '../App';

describe('App Component Smoke Tests', () => {
  test('renders the main store heading', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/StreamlinePay Store/i)).toBeInTheDocument();
    });
  });

  test('renders fetched product, user, and cart data', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Welcome back, Maxie/i)).toBeInTheDocument();
    });

    expect(screen.getByText('Test Product A')).toBeInTheDocument();
    expect(screen.getByText('Test Product B')).toBeInTheDocument();

    // Match actual DOM output ($30 not $30.00)
    expect(screen.getByText(/Cart: 3 items, Total \$30/i)).toBeInTheDocument();
  });
});
