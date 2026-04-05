export function useAuthApi() {
  function fetchCurrentUser() {
    return $http('/api/auth/me')
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

  function logout() {
    return $http('/api/auth/logout')
  }

  return {
    fetchCurrentUser,
    updateCurrentUser,
    fetchUserNotificationSettings,
    updateUserNotificationSettings,
    updatePhoneNumber,
    logout,
  }
}
