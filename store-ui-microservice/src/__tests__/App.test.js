import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';

describe('App Component Smoke Tests', () => {
  test('renders fetched product, user, and cart data', async () => {
    render(<App />);

    // Wait for async state updates to avoid act warnings
    await waitFor(() => {
      expect(screen.getByText('Test Product A')).toBeInTheDocument();
      expect(screen.getByText('Test Product B')).toBeInTheDocument();
      // Match the actual UI output: "Cart: 3 items, Total $30" (no .00)
      expect(screen.getByText(/Cart: 3 items, Total \$30/i)).toBeInTheDocument();
      expect(screen.getByText(/Welcome back, Maxie/i)).toBeInTheDocument();
    });
  });
});
