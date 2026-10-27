const rupeeFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

export function formatRupees(amount) {
  return rupeeFormatter.format(Number(amount));
}
