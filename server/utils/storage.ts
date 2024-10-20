export function getStorageSessionKey(providerAccountId: string) {
  return `session:${providerAccountId}`
}
