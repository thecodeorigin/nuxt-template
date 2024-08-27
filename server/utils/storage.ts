export function getStorageSessionKey(userId: string) {
  return `session:${userId}`
}
