// Register jest-dom matchers globally
import '@testing-library/jest-dom';

// Provide a deterministic fetch for all tests
beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (typeof url !== 'string') {
      return Promise.resolve({ json: () => Promise.resolve({}) });
    }

    if (url.match(/\/api\/products/i)) {
      return Promise.resolve({
        json: () =>
          Promise.resolve([
            { id: 1, name: 'Test Product A', price: 10.0, rating: 4.5 },
            { id: 2, name: 'Test Product B', price: 20.0, rating: 3.8 },
          ]),
      });
    }

    if (url.match(/\/api\/user/i)) {
      return Promise.resolve({
        json: () => Promise.resolve({ name: 'Maxie' }),
      });
    }

    if (url.match(/\/api\/cart/i)) {
      return Promise.resolve({
        json: () => Promise.resolve({ items: 3, total: 30.0 }),
      });
    }

    return Promise.resolve({ json: () => Promise.resolve({}) });
  });
});

afterEach(() => {
  jest.resetAllMocks();
});
