import { describe, expect, it } from 'vitest';
import { extractPublicCodeFromQrPayload } from './qr';

describe('extractPublicCodeFromQrPayload', () => {
  it('extracts current mobile QR URLs without requiring mat_ prefix', () => {
    expect(
      extractPublicCodeFromQrPayload('https://nhz3z41r-3001.uks1.devtunnels.ms/i/WS34EGQ48G2HXJZV02KTHR2X')
    ).toBe('WS34EGQ48G2HXJZV02KTHR2X');
  });

  it('extracts material detail URLs', () => {
    expect(
      extractPublicCodeFromQrPayload('https://inventario.tuempresa.com/materials/mat_abcd1234?from=scanner#details')
    ).toBe('mat_abcd1234');
  });

  it('accepts raw public codes', () => {
    expect(extractPublicCodeFromQrPayload('WS34EGQ48G2HXJZV02KTHR2X')).toBe('WS34EGQ48G2HXJZV02KTHR2X');
  });

  it('rejects unrelated URLs', () => {
    expect(extractPublicCodeFromQrPayload('https://example.com/not-an-inventory-qr')).toBeNull();
  });
});
