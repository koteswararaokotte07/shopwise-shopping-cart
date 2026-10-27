import { formatRupees } from '../utils/currency.js';

export default function ProductCard({ product, onAdd, adding }) {
  return (
    <article className="product-card">
      <div className="product-image">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} loading="lazy" />
        ) : (
          <span aria-hidden="true">✳</span>
        )}
      </div>
      <div className="product-card-copy">
        <div>
          <h3>{product.name}</h3>
          <p>{product.description}</p>
        </div>
        <div className="product-card-footer">
          <strong>{formatRupees(product.price)}</strong>
          <button type="button" onClick={() => onAdd(product)} disabled={adding}>
            {adding ? 'Adding…' : 'Add to bag'}
          </button>
        </div>
      </div>
    </article>
  );
}
