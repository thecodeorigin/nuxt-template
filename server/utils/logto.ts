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
