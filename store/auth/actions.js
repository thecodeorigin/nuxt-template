import Cookies from 'js-cookie';
import { useAuthService } from '@/services/auth';

export default {
  async register(context, { form }) {
    const authService = useAuthService(this);

    const { data } = await authService.register(form);
    context.commit('SET_AUTH', data);
    Cookies.set('auth', data);

    return data;
  },
  async login(context, { form }) {
    const authService = useAuthService(this);

    const { data } = await authService.login(form);
    context.commit('SET_AUTH', data);
    Cookies.set('auth', data);

    return data;
  },
  async getAuth() {
    const authService = useAuthService(this);

    const { data } = await authService.getAuth();

    return data;
  },
};
