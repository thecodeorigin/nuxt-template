import type { User } from '@base/server/types/models'

export function useApiAuth() {
  function fetchProfile() {
    // Get user credit from our database instead of depending on Logto data
    return $api<{ data: User }>('/api/auth/me')
  }

  function updateProfile(payload: Partial<{ username: string, name: string, avatar: string }>) {
    return $api('/api/auth/me', {
      method: 'PATCH',
      body: payload,
    })
  }

  function updatePassword(payload: Partial<{ password: string }>) {
    return $api('/api/auth/password', {
      method: 'POST',
      body: payload,
    })
  }

  return {
    fetchProfile,
    updateProfile,
    updatePassword,
  }
}
