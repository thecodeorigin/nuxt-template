// Pass context from Vuex
// const { register } = useAuthService(context);
export const useAuthService = ({ $clientApi, $authApi }) => {
  const endpoint = '/auth';

  const register = (form) => $clientApi.$post(`${endpoint}/register`, form);

  const login = (form) => $authApi.$post(`${endpoint}/login`, form);

  const getAuth = () => $authApi.$get(`${endpoint}/me`);

  return {
    register,
    login,
    getAuth,
  };
};
