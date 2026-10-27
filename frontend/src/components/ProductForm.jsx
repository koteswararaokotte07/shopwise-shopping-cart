import { useState } from 'react';

const initialForm = { name: '', description: '', price: '', imageUrl: '' };

export default function ProductForm({ onCreate, busy }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setError('');
    try {
      await onCreate({ ...form, price: Number(form.price), imageUrl: form.imageUrl.trim() || null });
      setForm(initialForm);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <details className="add-product">
      <summary>Add a product</summary>
      <form onSubmit={submit} className="product-form">
        <fieldset disabled={busy}>
          <label>
            Product name
            <input name="name" value={form.name} onChange={updateField} required maxLength="120" />
          </label>
          <label>
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={updateField}
              required
              maxLength="1000"
              rows="2"
            />
          </label>
          <label>
            Price (₹)
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={updateField}
              min="0.01"
              step="0.01"
              required
            />
          </label>
          <label>
            Image URL <span className="optional">(optional)</span>
            <input name="imageUrl" type="url" value={form.imageUrl} onChange={updateField} />
          </label>
        </fieldset>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save product'}</button>
      </form>
    </details>
  );
}
