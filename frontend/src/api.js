const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error('Could not reach the shop. Check that the backend is running and try again.');
  }

  let body = null;
  if (response.status !== 204) {
    try {
      body = await response.json();
    } catch {
      if (response.ok) {
        throw new Error('The shop returned an unexpected response. Please try again.');
      }
    }
  }
  if (!response.ok) {
    const fieldErrors = body?.errors ? Object.values(body.errors).join(' ') : '';
    throw new Error(fieldErrors || body?.message || `Request failed (${response.status}).`);
  }
  return body;
}

export const shopApi = {
  getProducts: () => request('/products'),
  createProduct: (product) =>
    request('/products', { method: 'POST', body: JSON.stringify(product) }),
  getCart: () => request('/cart'),
  addToCart: (productId, quantity = 1) =>
    request('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    }),
  updateQuantity: (productId, quantity) =>
    request(`/cart/items/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    }),
  removeFromCart: (productId) =>
    request(`/cart/items/${productId}`, { method: 'DELETE' }),
  clearCart: () => request('/cart', { method: 'DELETE' }),
};
