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

export async function updateLogtoUserCustomData(userId: string, customData: Record<string, any>) {
  const { access_token: accessToken } = await fetchM2MAccessToken()
  const response = await $fetch(`${process.env.LOGTO_ADMIN_ENDPOINT!}/api/users/${userId}/custom-data`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: {
      customData,
    },
  })

  return response
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
      resource: 'https://default.logto.app/api',
      scope: 'all',
    }).toString(),
  })

  return response
}
