import type { NuxtError } from '#app'

export function getNuxtError(error: any) {
  const _error = (error.cause || error) as NuxtError

  return {
    code: _error.statusCode || 500,
    message: _error.statusMessage || 'Internal Server Error',
    stack: _error.stack,
  }
}

export function getErrorMessage(error: any): string {
  if (error.response?.data)
    return error.response.data.message || error.response.data.statusMessage || 'An error occurred!'

  if (error.response?._data)
    return error.response._data.message || error.response._data.statusMessage || 'An error occurred!'

  return error.statusMessage || error.message || 'An error occurred!'
}
