import type LogtoClient from '@logto/node'
import type { UserInfoResponse } from '@logto/node'

export function useLogtoUser() {
  const event = useEvent()

  return (event.context?.logtoUser as UserInfoResponse) || null
}

export function useLogtoClient() {
  const event = useEvent()

  return (event.context?.logtoClient as LogtoClient) || null
}

export async function fetchM2MAccessToken() {
  const response = await $fetch<{ access_token: string }>(`${process.env.LOGTO_ADMIN_ENDPOINT!}/oidc/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      // eslint-disable-next-line node/prefer-global/buffer
      'Authorization': `Basic ${Buffer.from(`${process.env.LOGTO_ADMIN_APP_ID!}:${process.env.LOGTO_ADMIN_APP_SECRET!}`).toString(
        'base64',
      )}`,
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      resource: `${process.env.LOGTO_ADMIN_ENDPOINT!}/api`,
      scope: 'all',
    }).toString(),
  })

  return response
}
