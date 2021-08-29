import { useContext } from '@nuxtjs/composition-api';

// You must pass "this" like useAuthService(this) in Vuex to get the $axios instance
export const useAuthService = (context) => {
  const { $axios } = context || useContext();

  const register = (form) => $axios.$post('/auth/register', form);

  const login = (form) => $axios.$post('/auth/login', form);

  const getAuth = () => $axios.$get('/auth/me');

  return {
    register,
    login,
    getAuth,
  };
};
