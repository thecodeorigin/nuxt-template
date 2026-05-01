import type { AuthUser } from '#layers/auth/server/services/auth'

export interface ImpersonationCandidate {
  id: string
  username: string | null
  name: string | null
  primary_email: string
  avatar: string | null
  abilities: string[]
  is_suspended: boolean | null
}

export function useAuthApi() {
  function fetchCurrentUser() {
    return $http<AuthUser>('/api/auth/me')
  }

  function updateCurrentUser(data: { name: string }) {
    return $http('/api/user', {
      method: 'PATCH',
      body: data,
    })
  }

  function fetchUserNotificationSettings() {
    return $http('/api/user/notification')
  }

  function updateUserNotificationSettings(settings: {
    email: boolean
    product_updates: boolean
    weekly_digest: boolean
    important_updates: boolean
  }) {
    return $http('/api/user/notification', {
      method: 'PATCH',
      body: settings,
    })
  }

  function updatePhoneNumber(phone: string) {
    return $http('/api/auth/phone', {
      method: 'PATCH',
      body: { phone },
    })
  }

  function fetchImpersonationCandidates() {
    return $http<ImpersonationCandidate[]>('/api/auth/impersonate/users')
  }

  function startImpersonation(userId: string) {
    return $http<AuthUser>('/api/auth/impersonate/start', {
      method: 'POST',
      body: { user_id: userId },
    })
  }

  function stopImpersonation() {
    return $http<AuthUser>('/api/auth/impersonate/stop', {
      method: 'POST',
    })
  }

  function logout() {
    return $http('/api/auth/logout')
  }

  return {
    fetchCurrentUser,
    updateCurrentUser,
    fetchUserNotificationSettings,
    updateUserNotificationSettings,
    updatePhoneNumber,
    fetchImpersonationCandidates,
    startImpersonation,
    stopImpersonation,
    logout,
  }
}
