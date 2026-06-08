import type { ListQuery, Page } from '~~/shared/schemas/pagination'
import type { AuthUser } from '#layers/auth/server/services/auth'

export interface ImpersonationCandidate {
  id: string
  username: string | null
  name: string | null
  primary_email: string
  avatar: string | null
  is_suspended: boolean | null
}

export interface AuthProviders {
  credential: boolean
  google: boolean
  github: boolean
}

export function useAuthApi() {
  function fetchCurrentUser() {
    return $http<AuthUser>('/api/auth/me')
  }

  function updateCurrentUser(data: { name?: string, username?: string, bio?: string }) {
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

  function fetchImpersonationCandidates(query?: Partial<ListQuery>) {
    return $http<Page<ImpersonationCandidate>>('/api/auth/impersonate/users', { query })
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

  function uploadAvatar(file: File) {
    const form = new FormData()
    form.append('file', file)
    return $http<{ avatar: string }>('/api/user/avatar', { method: 'POST', body: form })
  }

  function logout() {
    return $http('/api/auth/logout')
  }

  function fetchAuthProviders() {
    return $http<AuthProviders>('/api/auth/providers')
  }

  function login(email: string, password: string) {
    return $http<{ session_id: string, user_id: string }>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
  }

  // Dev-only backdoors (routes 404 outside `import.meta.dev`). Used by the
  // dev login block on the sign-in card to exercise CASL as a seeded user.
  function devSeedUsers() {
    return $http<{ users: Array<{ id: string, primary_email: string }> }>('/api/auth/demo/dev-seed', {
      method: 'POST',
    })
  }

  function devLogin(email: string) {
    return $http<{ session_id: string, user_id: string }>('/api/auth/demo/dev-login', {
      method: 'POST',
      body: { email },
    })
  }

  return {
    fetchCurrentUser,
    updateCurrentUser,
    fetchUserNotificationSettings,
    updateUserNotificationSettings,
    updatePhoneNumber,
    uploadAvatar,
    fetchImpersonationCandidates,
    startImpersonation,
    stopImpersonation,
    logout,
    fetchAuthProviders,
    login,
    devSeedUsers,
    devLogin,
  }
}
