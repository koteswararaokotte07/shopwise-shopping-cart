import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../App.jsx';

const product = {
  id: 1,
  name: 'Hand-thrown Mug',
  description: 'A useful everyday favorite.',
  price: '25.00',
  imageUrl: null,
};

function jsonResponse(body) {
  return { ok: true, status: 200, json: async () => body };
}

function createShopApiMock() {
  let items = [];
  let products = [product];
  const cartResponse = () => ({
    items: items.map((item) => ({
      ...item,
      itemTotal: (Number(item.unitPrice) * item.quantity).toFixed(2),
    })),
    total: items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0).toFixed(2),
  });

  return vi.fn(async (url, options = {}) => {
    const path = new URL(url).pathname.replace('/api', '');
    const method = options.method || 'GET';
    if (path === '/products' && method === 'GET') return jsonResponse(products);
    if (path === '/products' && method === 'POST') {
      const request = JSON.parse(options.body);
      const created = { ...request, id: products.length + 1 };
      products = [...products, created];
      return jsonResponse(created);
    }
    if (path === '/cart' && method === 'GET') return jsonResponse(cartResponse());
    if (path === '/cart/items' && method === 'POST') {
      const request = JSON.parse(options.body);
      const existing = items.find((item) => item.productId === request.productId);
      if (existing) existing.quantity += request.quantity;
      else items.push({
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity: request.quantity,
      });
      return jsonResponse(cartResponse());
    }
    if (path === '/cart' && method === 'DELETE') {
      items = [];
      return jsonResponse(cartResponse());
    }
    const itemPath = path.match(/^\/cart\/items\/(\d+)$/);
    if (itemPath && method === 'PATCH') {
      const item = items.find((entry) => entry.productId === Number(itemPath[1]));
      item.quantity = JSON.parse(options.body).quantity;
      return jsonResponse(cartResponse());
    }
    if (itemPath && method === 'DELETE') {
      items = items.filter((entry) => entry.productId !== Number(itemPath[1]));
      return jsonResponse(cartResponse());
    }
    throw new Error(`Unexpected API request: ${method} ${path}`);
  });
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('shopping experience', () => {
  it('loads products, adds and changes quantities, then removes the cart item', async () => {
    vi.stubGlobal('fetch', createShopApiMock());
    render(<App />);

    expect(await screen.findAllByRole('heading', { name: 'Hand-thrown Mug' })).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Add to bag' }));
    expect(await screen.findByLabelText('Cart subtotal')).toHaveTextContent('25.00');
    expect(screen.getByRole('link', { name: /Your bag/ })).toHaveTextContent('1');

    fireEvent.click(screen.getByRole('button', { name: 'Increase Hand-thrown Mug quantity' }));
    await waitFor(() => expect(screen.getByLabelText('Cart subtotal')).toHaveTextContent('50.00'));
    expect(screen.getByRole('link', { name: /Your bag/ })).toHaveTextContent('2');

    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
    expect(await screen.findByText('Your bag is taking a break')).toBeInTheDocument();
  });

  it('clears all cart items', async () => {
    vi.stubGlobal('fetch', createShopApiMock());
    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: 'Add to bag' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Clear bag' }));
    expect(await screen.findByText('Your bag is taking a break')).toBeInTheDocument();
  });

  it('filters the server-loaded products by name', async () => {
    vi.stubGlobal('fetch', createShopApiMock());
    render(<App />);

    await screen.findAllByRole('heading', { name: 'Hand-thrown Mug' });
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search products by name' }), {
      target: { value: 'backpack' },
    });
    await waitFor(() => expect(screen.queryAllByRole('heading', { name: 'Hand-thrown Mug' })).toHaveLength(0));
    expect(screen.getByText('No products match that search.')).toBeInTheDocument();
  });

  it('creates a product through the product API', async () => {
    vi.stubGlobal('fetch', createShopApiMock());
    render(<App />);

    await screen.findAllByRole('heading', { name: 'Hand-thrown Mug' });
    fireEvent.click(screen.getByText('Add a product'));
    fireEvent.change(screen.getByRole('textbox', { name: 'Product name' }), {
      target: { value: 'Linen Journal' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: 'Description' }), {
      target: { value: 'A notebook for everyday notes.' },
    });
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Price (₹)' }), {
      target: { value: '18.50' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save product' }));

    expect(await screen.findByRole('heading', { name: 'Linen Journal' })).toBeInTheDocument();
  });
});
