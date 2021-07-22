import { useAuthService } from '@/services/auth';

export default {
  register: async(context, { form }) => {
    const authService = useAuthService(context);

    const { data } = await authService.register(form);
    context.commit('SET_AUTH', data);

    return data;
  },
  login: async(context, { form }) => {
    const authService = useAuthService(context);

    const { data } = await authService.login(form);
    context.commit('SET_AUTH', data);

    return data;
  },
  getAuth: async(context) => {
    const authService = useAuthService(context);

    const { data } = await authService.getAuth();

    return data;
  },
};
