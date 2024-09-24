import type { NuxtError } from '#app'

export function getNuxtError(error: any) {
  const _error = (error.cause || error) as NuxtError

  return {
    code: _error.statusCode || 500,
    message: _error.statusMessage || 'Internal Server Error',
    stack: _error.stack,
  }
}
