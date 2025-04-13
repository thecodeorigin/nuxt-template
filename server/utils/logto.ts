import type LogtoClient from '@logto/node'
import type { LogtoUser } from '@base/server/types/logto'
import { cleanDoubleSlashes } from 'ufo'

type LogtoAccountCenterFieldStatus = 'Off' | 'Edit' | 'ReadOnly'

interface LogtoAccountCenterSettings {
  tenantId: string
  id: string
  enabled: boolean
  fields: Partial<{
    name: LogtoAccountCenterFieldStatus
    avatar: LogtoAccountCenterFieldStatus
    profile: LogtoAccountCenterFieldStatus
    email: LogtoAccountCenterFieldStatus
    phone: LogtoAccountCenterFieldStatus
    password: LogtoAccountCenterFieldStatus
    username: LogtoAccountCenterFieldStatus
    social: LogtoAccountCenterFieldStatus
    customData: LogtoAccountCenterFieldStatus
  }>
}

export function useLogtoUser() {
  const event = useEvent()

  return (event.context?.logtoUser as LogtoUser) || null
}

export function useLogtoClient() {
  const event = useEvent()

  return (event.context?.logtoClient as LogtoClient) || null
}

export async function getLogtoUserById(userId: string) {
  const { access_token: accessToken } = await fetchM2MAccessToken()

  const response = await $fetch<Record<string, any>>(cleanDoubleSlashes(`${process.env.LOGTO_ENDPOINT!}/api/users/${userId}`), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  return response
}

export async function getLogtoUserCustomData(userId: string) {
  const { access_token: accessToken } = await fetchM2MAccessToken()
  const response = await $fetch<Record<string, any>>(cleanDoubleSlashes(`${process.env.LOGTO_ENDPOINT!}/api/users/${userId}/custom-data`), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  return response
}

export async function updateLogtoUserCustomData(userId: string, customData: Record<string, any>) {
  const { access_token: accessToken } = await fetchM2MAccessToken()
  const response = await $fetch(cleanDoubleSlashes(`${process.env.LOGTO_ENDPOINT!}/api/users/${userId}/custom-data`), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: {
      customData,
    },
  })

  return response as { credit?: string }
}

export async function fetchM2MAccessToken() {
  const response = await $fetch<{ access_token: string }>(cleanDoubleSlashes(`${process.env.LOGTO_ENDPOINT!}/oidc/token`), {
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

export async function enableAccountCenter() {
  const { access_token: accessToken } = await fetchM2MAccessToken()

  const accountCenterSettings = await $fetch<LogtoAccountCenterSettings>(cleanDoubleSlashes(`${process.env.LOGTO_ENDPOINT!}/api/account-center`), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (accountCenterSettings.enabled)
    return

  await $fetch(cleanDoubleSlashes(`${process.env.LOGTO_ENDPOINT!}/api/account-center`), {
    method: 'PATCH',
    body: {
      enabled: true,
      fields: {
        name: 'Edit',
        avatar: 'Edit',
        username: 'Edit',
        password: 'Edit',
      },
    },
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}
