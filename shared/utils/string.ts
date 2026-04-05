export function shortenId(id: string, prefixLen: number = 4, suffixLen: number = 4): string {
  if (!id)
    return ''
  if (id.length <= prefixLen + suffixLen)
    return id
  return `${id.substring(0, prefixLen)}***${id.substring(id.length - suffixLen)}`
}

export function cutId(id: string, len: number = 6): string {
  if (!id)
    return ''
  if (id.length <= len)
    return id
  return id.substring(0, len)
}
