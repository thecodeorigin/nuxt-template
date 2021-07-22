export const VALIDATION_TYPE = {
  REQUIRED: 1,
  EMAIL: 2,
  PHONE: 3,
  ALPHA: 4,
  NUMBER: 5,
}

// Wrap with i18n
export const VALIDATION_MESSAGE = Object.freeze({
  [VALIDATION_TYPE.REQUIRED]: 'validate.required',
  [VALIDATION_TYPE.EMAIL]: 'validate.email',
  [VALIDATION_TYPE.PHONE]: 'validate.phone',
  [VALIDATION_TYPE.ALPHA]: 'validate.alpha',
  [VALIDATION_TYPE.NUMBER]: 'validate.number',
});
