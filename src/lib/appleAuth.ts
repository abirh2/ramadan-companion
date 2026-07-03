export const APPLE_BUNDLE_ID = 'com.deencompanion.app';
export const APPLE_NATIVE_REDIRECT = `${APPLE_BUNDLE_ID}://login-callback`;

export async function generateAppleNonce(): Promise<{ rawNonce: string; hashedNonce: string }> {
  const rawNonce = crypto.randomUUID();
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(rawNonce));
  const hashedNonce = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return { rawNonce, hashedNonce };
}

export function isAppleSignInCancelled(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;

  const e = err as { code?: string | number; message?: string; errorMessage?: string };
  const message = (e.message ?? e.errorMessage ?? '').toLowerCase();

  if (message.includes('cancel') || message.includes('canceled')) return true;
  if (e.code === 1001 || e.code === '1001') return true;

  return false;
}
