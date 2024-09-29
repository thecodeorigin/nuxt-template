import jwt from 'jsonwebtoken'

function getSecret() {
  const secret = process.env.AUTH_SECRET!

  if (!secret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Authentication secret is missing!',
    })
  }

  return secret
}

export function sign(payload: { id: string, email: string }) {
  const secret = getSecret()

  return jwt.sign(payload, secret)
}

export function verify(token: string) {
  const secret = getSecret()

  return jwt.verify(token, secret)
}
