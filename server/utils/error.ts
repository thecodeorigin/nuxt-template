export enum ErrorMessage {
  UNAUTHORIZED = 'Unauthorized!',
  CANNOT_FIND_ROLE = 'Cannot assign role and permissions to user!',
  INTERNAL_SERVER_ERROR = 'Internal server error!',
  INVALID_CREDENTIALS = 'Invalid signin credentials!',
  CANNOT_CHECKOUT = 'Cannot create Stripe Checkout session!',
  DONOT_HAVE_PERMISSION = 'You do not have permission to perform this action!',
  INVALID_PARAMS = 'Invalid parameter: <%= key %>, receive value: <%= value %>',
  STRIPE_NO_PRICE = 'No price found for this product!',
  BAD_REQUEST = 'Bad request!',
  EMAIL_NOT_VERIFIED = 'Email not verified!',
  INVALID_VERIFICATION_URL = 'Invalid verification URL!',
  EMAIL_ALREADY_VERIFIED = 'Email already verified!',
  PASSWORD_MISMATCH = 'Password mismatch!',
  INVALID_WEBHOOK_BODY = 'Invalid webhook body!',
}

export function parseError(error: any) {
  if (error.name === 'PostgresError') {
    return createError({
      statusCode: 400,
      statusMessage: ErrorMessage.BAD_REQUEST,
      data: error,
      stack: '',
    })
  }

  return createError({
    statusCode: error.statusCode || 500,
    statusMessage: error.message,
    data: error,
    stack: '',
  })
}
