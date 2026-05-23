export function safeEqual(a: string, b: string): boolean {
  const ea = new TextEncoder().encode(a)
  const eb = new TextEncoder().encode(b)
  if (ea.length !== eb.length)
    return false
  let diff = 0
  for (let i = 0; i < ea.length; i++)
    diff |= ea[i]! ^ eb[i]!
  return diff === 0
}
