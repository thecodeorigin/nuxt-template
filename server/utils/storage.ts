export function getStorageSessionKey(userEmail: string) {
  return `session:${userEmail}`
}
