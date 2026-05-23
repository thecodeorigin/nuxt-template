import { describe, expect, it } from 'vitest'
import { sniffImage } from '~~/server/utils/image'

describe('sniffImage', () => {
  it('detects PNG', () => {
    expect(sniffImage(new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D]))).toEqual({ type: 'image/png', ext: 'png' })
  })
  it('detects JPEG', () => {
    expect(sniffImage(new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]))).toEqual({ type: 'image/jpeg', ext: 'jpg' })
  })
  it('detects GIF', () => {
    expect(sniffImage(new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39]))).toEqual({ type: 'image/gif', ext: 'gif' })
  })
  it('detects WEBP', () => {
    const buf = new Uint8Array(12)
    buf.set([0x52, 0x49, 0x46, 0x46], 0)
    buf.set([0x57, 0x45, 0x42, 0x50], 8)
    expect(sniffImage(buf)).toEqual({ type: 'image/webp', ext: 'webp' })
  })
  it('rejects SVG bytes', () => {
    expect(sniffImage(new Uint8Array([0x3C, 0x73, 0x76, 0x67]))).toBeNull()
  })
  it('rejects truncated/garbage', () => {
    expect(sniffImage(new Uint8Array([0x00, 0x01]))).toBeNull()
  })
})
