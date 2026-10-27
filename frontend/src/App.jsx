import { useCallback, useEffect, useMemo, useState } from 'react';
import CartPanel from './components/CartPanel.jsx';
import ProductCard from './components/ProductCard.jsx';
import ProductForm from './components/ProductForm.jsx';
import { shopApi } from './api.js';

const emptyCart = { items: [], total: '0.00' };

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(emptyCart);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [cartError, setCartError] = useState('');
  const [productBusy, setProductBusy] = useState(false);
  const [busyProductId, setBusyProductId] = useState(null);
  const [addingProductId, setAddingProductId] = useState(null);
  const [cartBusy, setCartBusy] = useState(false);

  const loadShop = useCallback(async () => {
    setLoading(true);
    setProductsError('');
    setCartError('');
    const [productResult, cartResult] = await Promise.allSettled([
      shopApi.getProducts(),
      shopApi.getCart(),
    ]);
    if (productResult.status === 'fulfilled') {
      setProducts(productResult.value);
    } else {
      setProductsError(productResult.reason.message);
    }
    if (cartResult.status === 'fulfilled') {
      setCart(cartResult.value);
    } else {
      setCartError(cartResult.reason.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadShop();
  }, [loadShop]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return products;
    return products.filter((product) => product.name.toLocaleLowerCase().includes(query));
  }, [products, search]);

  async function addProduct(productData) {
    setProductBusy(true);
    try {
      const created = await shopApi.createProduct(productData);
      setProducts((current) => [...current, created]);
    } finally {
      setProductBusy(false);
    }
  }

  async function addToCart(product) {
    setAddingProductId(product.id);
    setCartError('');
    try {
      setCart(await shopApi.addToCart(product.id));
    } catch (error) {
      setCartError(error.message);
    } finally {
      setAddingProductId(null);
    }
  }

  async function changeQuantity(item, quantity) {
    if (quantity < 1) return;
    setBusyProductId(item.productId);
    setCartError('');
    try {
      setCart(await shopApi.updateQuantity(item.productId, quantity));
    } catch (error) {
      setCartError(error.message);
    } finally {
      setBusyProductId(null);
    }
  }

  async function removeItem(item) {
    setBusyProductId(item.productId);
    setCartError('');
    try {
      setCart(await shopApi.removeFromCart(item.productId));
    } catch (error) {
      setCartError(error.message);
    } finally {
      setBusyProductId(null);
    }
  }

  async function clearCart() {
    setCartBusy(true);
    setCartError('');
    try {
      setCart(await shopApi.clearCart());
    } catch (error) {
      setCartError(error.message);
    } finally {
      setCartBusy(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#" aria-label="Shopwise home">
          <span className="brand-mark" aria-hidden="true">s.</span>
          <span>shopwise</span>
        </a>
        <a className="header-cart-link" href="#your-bag">
          Your bag <span>{cart.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
        </a>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <p className="eyebrow">THOUGHTFULLY PICKED, MADE FOR EVERY DAY</p>
            <h1>Find your<br /><em>everyday</em> favorites.</h1>
            <p className="hero-description">
              Good things for the little moments. Take a look around and find something you’ll love.
            </p>
            <a className="hero-link" href="#shop">Explore the collection <span aria-hidden="true">↓</span></a>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="art-sun" />
            <div className="art-vase"><span /></div>
            <div className="art-leaf leaf-one" />
            <div className="art-leaf leaf-two" />
            <div className="art-base" />
            <span className="art-caption">THE SLOW<br />LIVING EDIT</span>
          </div>
        </section>

        <section className="shop-layout" id="shop">
          <div className="catalog">
            <div className="section-heading">
              <div>
                <p className="eyebrow">THE GOOD STUFF</p>
                <h2>Shop the collection</h2>
              </div>
              <label className="search-field">
                <span className="visually-hidden">Search products by name</span>
                <span aria-hidden="true">⌕</span>
                <input
                  type="search"
                  placeholder="Find something…"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
            </div>

            <ProductForm onCreate={addProduct} busy={productBusy || loading} />

            {loading ? (
              <div className="status-message" role="status">Finding the good stuff…</div>
            ) : productsError ? (
              <div className="status-message error-message" role="alert">
                <p>{productsError}</p>
                <button type="button" onClick={loadShop}>Try again</button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="status-message">
                {products.length === 0 ? 'There are no products yet. Add one to get started.' : 'No products match that search.'}
              </div>
            ) : (
              <div className="product-grid">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAdd={addToCart}
                    adding={addingProductId === product.id}
                  />
                ))}
              </div>
            )}
          </div>

          <div id="your-bag" className="cart-column">
            {cartError && (
              <div className="inline-error" role="alert">
                <p>{cartError}</p>
                <button type="button" onClick={loadShop}>Retry</button>
              </div>
            )}
            <CartPanel
              cart={cart}
              onQuantityChange={changeQuantity}
              onRemove={removeItem}
              onClear={clearCart}
              busyProductId={busyProductId}
              busy={cartBusy}
            />
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <a className="brand" href="#" aria-label="Shopwise home">
          <span className="brand-mark" aria-hidden="true">s.</span>
          <span>shopwise</span>
        </a>
        <p>Everyday things, chosen with care.</p>
        <span>Made for the little moments.</span>
      </footer>
    </div>
  );
}
