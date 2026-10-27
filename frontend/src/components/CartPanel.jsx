import { formatRupees } from '../utils/currency.js';

export default function CartPanel({
  cart,
  onQuantityChange,
  onRemove,
  onClear,
  busyProductId,
  busy,
}) {
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <section className="cart-panel" aria-labelledby="cart-heading">
      <div className="cart-heading-row">
        <div>
          <p className="eyebrow">YOUR SELECTION</p>
          <h2 id="cart-heading">Your bag <span className="cart-count">{itemCount}</span></h2>
        </div>
        {cart.items.length > 0 && (
          <button className="text-button" type="button" onClick={onClear} disabled={busy}>
            Clear bag
          </button>
        )}
      </div>

      {cart.items.length === 0 ? (
        <div className="empty-cart">
          <span aria-hidden="true">⌑</span>
          <h3>Your bag is taking a break</h3>
          <p>Add something you love and it’ll show up here.</p>
        </div>
      ) : (
        <>
          <ul className="cart-items">
            {cart.items.map((item) => {
              const isBusy = busyProductId === item.productId;
              return (
                <li className="cart-item" key={item.productId}>
                  <div className="cart-item-info">
                    <h3>{item.name}</h3>
                    <p>{formatRupees(item.unitPrice)} each</p>
                    <div className="quantity-control" role="group" aria-label={`Quantity for ${item.name}`}>
                      <button
                        type="button"
                        aria-label={`Decrease ${item.name} quantity`}
                        onClick={() => onQuantityChange(item, item.quantity - 1)}
                        disabled={isBusy || item.quantity <= 1}
                      >−</button>
                      <span aria-live="polite">{item.quantity}</span>
                      <button
                        type="button"
                        aria-label={`Increase ${item.name} quantity`}
                        onClick={() => onQuantityChange(item, item.quantity + 1)}
                        disabled={isBusy}
                      >+</button>
                    </div>
                  </div>
                  <div className="cart-item-total">
                    <strong aria-label={`${item.name} total`}>{formatRupees(item.itemTotal)}</strong>
                    <button
                      className="remove-button"
                      type="button"
                      onClick={() => onRemove(item)}
                      disabled={isBusy}
                    >Remove</button>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="cart-total">
            <span>Subtotal</span>
            <strong aria-label="Cart subtotal">{formatRupees(cart.total)}</strong>
          </div>
          <p className="cart-note">Taxes and delivery are calculated at checkout.</p>
        </>
      )}
    </section>
  );
}
