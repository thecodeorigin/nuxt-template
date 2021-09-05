import { AUTH_API_URL } from '@/constants/auth';
import Cookies from 'js-cookie';

// See docs on how should we handle the API
// https://vuex.vuejs.org/#what-is-a-state-management-pattern
export default {
  async register(context, { form }) {
    const { data } = await this.$axios.$post(AUTH_API_URL.REGISTER(), form);
    context.commit('SET_AUTH', data);
    Cookies.set('auth', data);

    return data;
  },
  async login(context, { form }) {
    const { data } = await this.$axios.$post(AUTH_API_URL.LOGIN(), form);
    context.commit('SET_AUTH', data);
    Cookies.set('auth', data);

    return data;
  },
  async getAuth() {
    const { data } = await this.$axios.$get(AUTH_API_URL.ME());

    return data;
  },
};
