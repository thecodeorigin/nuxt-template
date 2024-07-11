import { isEmpty, isEmptyArray, isNullOrUndefined } from './helpers'

// 👉 Required Validator
export function requiredValidator(value: unknown) {
  if (isNullOrUndefined(value) || isEmptyArray(value) || value === false)
    return 'This field is required'

  return !!String(value).trim().length || 'This field is required'
}

// 👉 Email Validator
export function emailValidator(value: unknown) {
  if (isEmpty(value))
    return true

  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\])|(([a-z\-0-9]+\.)+[a-z]{2,}))$/i

  if (Array.isArray(value))
    return value.every(val => re.test(String(val))) || 'The Email field must be a valid email'

  return re.test(String(value)) || 'The Email field must be a valid email'
}

// 👉 Password Validator
export function passwordValidator(password: string) {
  const regExp = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%&*()]).{8,}/

  const validPassword = regExp.test(password)

  return validPassword || 'Field must contain at least one uppercase, lowercase, special character and digit with min 8 chars'
}

// 👉 Confirm Password Validator
export function confirmedValidator(value: string, target: string) {
  return value === target || 'The Confirm Password field confirmation does not match'
}

// 👉 Between Validator
export function betweenValidator(value: unknown, min: number, max: number) {
  const valueAsNumber = Number(value)

  return (Number(min) <= valueAsNumber && Number(max) >= valueAsNumber) || `Enter number between ${min} and ${max}`
}

// 👉 Integer Validator
export function integerValidator(value: unknown) {
  if (isEmpty(value))
    return true

  if (Array.isArray(value))
    return value.every(val => /^-?\d+$/.test(String(val))) || 'This field must be an integer'

  return /^-?\d+$/.test(String(value)) || 'This field must be an integer'
}

// 👉 Regex Validator
export function regexValidator(value: unknown, regex: RegExp | string): string | boolean {
  if (isEmpty(value))
    return true

  let regeX = regex
  if (typeof regeX === 'string')
    regeX = new RegExp(regeX)

  if (Array.isArray(value))
    return value.every(val => regexValidator(val, regeX))

  return regeX.test(String(value)) || 'The Regex field format is invalid'
}

// 👉 Alpha Validator
export function alphaValidator(value: unknown) {
  if (isEmpty(value))
    return true

  return /^[A-Z]*$/i.test(String(value)) || 'The Alpha field may only contain alphabetic characters'
}

// 👉 URL Validator
export function urlValidator(value: unknown) {
  if (isEmpty(value))
    return true

  const re = /^(https?):\/\/[^\s$.?#].\S*$/

  return re.test(String(value)) || 'URL is invalid'
}

// 👉 Length Validator
export function lengthValidator(value: unknown, length: number) {
  if (isEmpty(value))
    return true

  return String(value).length === length || `The Min Character field must be at least ${length} characters`
}

// 👉 Alpha-dash Validator
export function alphaDashValidator(value: unknown) {
  if (isEmpty(value))
    return true

  const valueAsString = String(value)

  return /^[\w-]*$/.test(valueAsString) || 'All Character are not valid'
}
