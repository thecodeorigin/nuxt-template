import type { IncomingHttpHeaders } from 'node:http'
import { createRemoteJWKSet, jwtVerify } from 'jose'

function extractBearerTokenFromHeaders({ authorization }: IncomingHttpHeaders) {
  if (!authorization) {
    throw new Error('Authorization header is missing')
  }

  if (!authorization.startsWith('Bearer')) {
    throw new Error('Authorization header is not in the Bearer scheme')
  }

  return authorization.slice(7) // The length of 'Bearer ' is 7
}

export async function getUserScopes() {
  const config = useRuntimeConfig()

  const event = useEvent()

  // Generate a JWKS using jwks_uri obtained from the Logto server
  const jwks = createRemoteJWKSet(new URL(`${process.env.LOGTO_ENDPOINT}/oidc/jwks`))

  const token = extractBearerTokenFromHeaders(event.node.req.headers)

  const { payload } = await jwtVerify(
    // The raw Bearer Token extracted from the request header
    token,
    jwks,
    {
      // Expected issuer of the token, issued by the Logto server
      issuer: `${process.env.LOGTO_ENDPOINT}/oidc`,
      // Expected audience token, the resource indicator of the current API
      audience: config.public.apiBaseUrl,
    },
  )

  return String(payload.scope).split(' ')
}
