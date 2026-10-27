import { describe, expect, it } from 'vitest';
import { formatRupees } from '../utils/currency.js';

describe('formatRupees', () => {
  it('formats numeric strings as Indian Rupees', () => {
    expect(formatRupees('1234.5')).toContain('₹');
    expect(formatRupees('1234.5')).toContain('1,234.50');
  });
});
