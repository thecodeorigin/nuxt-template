export enum ErrorMessage {
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
}
