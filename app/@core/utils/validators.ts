import { isEmpty, isEmptyArray, isNullOrUndefined } from './helpers'

// 👉 Required Validator
export function requiredValidator(value: unknown, message?: string) {
  if (isNullOrUndefined(value) || isEmptyArray(value) || value === false)
    return message || 'This field is required'

  return !!String(value).trim().length || message || 'This field is required'
}

// 👉 Email Validator
export function emailValidator(value: unknown, message?: string) {
  if (isEmpty(value))
    return true

  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\])|(([a-z\-0-9]+\.)+[a-z]{2,}))$/i

  if (Array.isArray(value))
    return value.every(val => re.test(String(val))) || message || 'The Email field must be a valid email'

  return re.test(String(value)) || message || 'The Email field must be a valid email'
}

// 👉 Password Validator
export function passwordValidator(password: string, message?: string) {
  const regExp = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%&*()]).{8,}/

  const validPassword = regExp.test(password)

  return validPassword || message || 'Field must contain at least one uppercase, lowercase, special character and digit with min 8 chars'
}

// 👉 Confirm Password Validator
export function confirmedValidator(value: string, target: string, message?: string) {
  return value === target || message || 'The Confirm Password field confirmation does not match'
}

// 👉 Between Validator
export function betweenValidator(value: unknown, min: number, max: number, message?: string) {
  const valueAsNumber = Number(value)

  return (Number(min) <= valueAsNumber && Number(max) >= valueAsNumber) || message || `Enter number between ${min} and ${max}`
}

// 👉 Integer Validator
export function integerValidator(value: unknown, message?: string) {
  if (isEmpty(value))
    return true

  if (Array.isArray(value))
    return value.every(val => /^-?\d+$/.test(String(val))) || message || 'This field must be an integer'

  return /^-?\d+$/.test(String(value)) || message || 'This field must be an integer'
}

// 👉 Regex Validator
export function regexValidator(value: unknown, regex: RegExp | string, message?: string): string | boolean {
  if (isEmpty(value))
    return true

  let regeX = regex
  if (typeof regeX === 'string')
    regeX = new RegExp(regeX)

  if (Array.isArray(value))
    return value.every(val => regexValidator(val, regeX, message))

  return regeX.test(String(value)) || message || 'The Regex field format is invalid'
}

// 👉 Alpha Validator
export function alphaValidator(value: unknown, message?: string) {
  if (isEmpty(value))
    return true

  return /^[A-Z]*$/i.test(String(value)) || message || 'The Alpha field may only contain alphabetic characters'
}

// 👉 URL Validator
export function urlValidator(value: unknown, message?: string) {
  if (isEmpty(value))
    return true

  const re = /^(https?):\/\/[^\s$.?#].\S*$/

  return re.test(String(value)) || message || 'URL is invalid'
}

// 👉 Length Validator
export function lengthValidator(value: unknown, length: number, message?: string) {
  if (isEmpty(value))
    return true

  return String(value).length === length || message || `The Min Character field must be at least ${length} characters`
}

// 👉 Alpha-dash Validator
export function alphaDashValidator(value: unknown, message?: string) {
  if (isEmpty(value))
    return true

  const valueAsString = String(value)

  return /^[\w-]*$/.test(valueAsString) || message || 'All Character are not valid'
}
