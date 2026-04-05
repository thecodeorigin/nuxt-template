import { customAlphabet } from 'nanoid'

export const ID_LENGTH = 8
export const ID_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_'

export function createId() {
  let result = ''
  const alphabetLength = ID_ALPHABET.length
  const randomValues = new Uint8Array(ID_LENGTH)

  // Use crypto.getRandomValues for secure random number generation
  crypto.getRandomValues(randomValues)

  for (let i = 0; i < ID_LENGTH; i++) {
    result += ID_ALPHABET[randomValues[i]! % alphabetLength]
  }

  return result
}

export function generateRandomString(length: number = 32) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const alphabetLength = alphabet.length
  const randomValues = new Uint8Array(length)

  crypto.getRandomValues(randomValues)

  for (let i = 0; i < length; i++) {
    result += alphabet[randomValues[i]! % alphabetLength]
  }

  return result
}

// Default nanoid length is 21
export function simplifyNanoId(length: number = 21) {
  const newId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', length)

  return newId()
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomFrom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]!
}
