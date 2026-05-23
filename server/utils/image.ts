const SIGNATURES: { type: string, ext: string, bytes: number[] }[] = [
  { type: 'image/png', ext: 'png', bytes: [0x89, 0x50, 0x4E, 0x47] },
  { type: 'image/jpeg', ext: 'jpg', bytes: [0xFF, 0xD8, 0xFF] },
  { type: 'image/gif', ext: 'gif', bytes: [0x47, 0x49, 0x46, 0x38] },
  { type: 'image/webp', ext: 'webp', bytes: [0x52, 0x49, 0x46, 0x46] },
]

export function sniffImage(buf: Uint8Array): { type: string, ext: string } | null {
  for (const sig of SIGNATURES) {
    if (sig.bytes.every((b, i) => buf[i] === b)) {
      if (sig.type === 'image/webp' && !(buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50))
        continue
      return { type: sig.type, ext: sig.ext }
    }
  }
  return null
}
