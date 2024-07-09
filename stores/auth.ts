export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref()

  function fetchCurrentUser() {
    
  }

  return {
    fetchCurrentUser,
  }
});
