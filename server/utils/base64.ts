export function encodeBase64(input: string): string {
  return Buffer.from(input, 'utf-8').toString('base64')
}
