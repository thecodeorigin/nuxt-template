interface Encrypted { ciphertext: string, iv: string }

function toBase64(arr: Uint8Array): string {
  return Buffer.from(arr).toString('base64')
}

function fromBase64(str: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(Buffer.from(str, 'base64'))
}

async function key(): Promise<CryptoKey> {
  const secret = useRuntimeConfig().authSecret
  if (!secret)
    throw createError({ statusCode: 500, statusMessage: 'authSecret not configured' })
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret))
  return crypto.subtle.importKey('raw', hash, 'AES-GCM', false, ['encrypt', 'decrypt'])
}

export async function encryptSecret(plain: string): Promise<Encrypted> {
  const iv = new Uint8Array(12)
  crypto.getRandomValues(iv)
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await key(), new TextEncoder().encode(plain))
  return { ciphertext: toBase64(new Uint8Array(ct)), iv: toBase64(iv) }
}

export async function decryptSecret(enc: Encrypted): Promise<string> {
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(enc.iv) }, await key(), fromBase64(enc.ciphertext))
  return new TextDecoder().decode(pt)
}
