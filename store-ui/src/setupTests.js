// Ensure jest-dom matchers like toBeInTheDocument are available
import '@testing-library/jest-dom';

// Stable fetch mock across tests
beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (url.includes('/products')) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            { id: 1, name: 'Test Product A', price: 10.0, rating: 4.5 },
            { id: 2, name: 'Test Product B', price: 20.0, rating: 3.8 },
          ]),
      });
    }
    if (url.includes('/user')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ name: 'Maxie' }),
      });
    }
    if (url.includes('/cart')) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            items: 3,
            total: 30.0, // Component renders $30 (no trailing .00), match accordingly in tests
          }),
      });
    }
    return Promise.reject(new Error('Unknown endpoint'));
  });
});

afterEach(() => {
  jest.clearAllMocks();
});
