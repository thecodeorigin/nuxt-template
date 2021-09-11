export const VALIDATION_TYPE = Object.freeze({
  REQUIRED: 1,
  EMAIL: 2,
  PHONE: 3,
  ALPHA: 4,
  NUMBER: 5,
  URL: 6,
});

// Wrap with i18n
export const VALIDATION_MESSAGE = Object.freeze({
  REQUIRED: 'This field is required',
  EMAIL: 'This field must be a valid email',
  PHONE: 'This field must be a valid phone number',
  ALPHA: 'This field can only contain words and spaces',
  TEXT: 'This field cannot contain special letters',
  NUMBER: 'This field must be a number',
  URL: 'This field must be a valid url',
});

export const VALIDATION_REGEX = Object.freeze({
  EMAIL: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g,
  PHONE: /^\s*(?:\+?(\d{1,3}))?([-. (]*(\d{3})[-. )]*)?((\d{3})[-. ]*(\d{2,4})(?:[-.x ]*(\d+))?)\s*$/gm,
  ALPHA: /^[A-Za-z ]*$/g,
  TEXT: /^[A-Za-z0-9-_ ]*$/g,
  NUMBER: /^[0-9]*$/g,
  URL: /^(https?:\/\/)?([\da-z.-]+\.[a-z.]{2,6}|[\d.]+)([/:?=&#]{1}[\da-z.-]+)*[/?]?$/g,
});

