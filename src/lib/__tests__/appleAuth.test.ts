import { createHash, randomUUID } from 'crypto';
import { generateAppleNonce, isAppleSignInCancelled } from '../appleAuth';

describe('appleAuth', () => {
  beforeAll(() => {
    Object.defineProperty(global, 'crypto', {
      value: {
        randomUUID,
        subtle: {
          digest: async (_algorithm: string, data: ArrayBuffer) =>
            createHash('sha256').update(Buffer.from(data)).digest().buffer,
        },
      },
      configurable: true,
    });
  });

  describe('generateAppleNonce', () => {
    it('returns raw and hashed nonce pair', async () => {
      const { rawNonce, hashedNonce } = await generateAppleNonce();

      expect(rawNonce).toBeTruthy();
      expect(hashedNonce).toHaveLength(64);
      expect(hashedNonce).toMatch(/^[0-9a-f]+$/);
    });
  });

  describe('isAppleSignInCancelled', () => {
    it('returns true for cancellation code 1001', () => {
      expect(isAppleSignInCancelled({ code: 1001 })).toBe(true);
      expect(isAppleSignInCancelled({ code: '1001' })).toBe(true);
    });

    it('returns true when message mentions cancel', () => {
      expect(isAppleSignInCancelled({ message: 'User canceled authorization' })).toBe(true);
    });

    it('returns false for other errors', () => {
      expect(isAppleSignInCancelled({ message: 'Network error' })).toBe(false);
      expect(isAppleSignInCancelled(null)).toBe(false);
    });
  });
});
