export function useApiAuth() {
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
    updateProfile,
    updatePassword,
  }
}
