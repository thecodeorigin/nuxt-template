const cookieparser = process.server ? require('cookieparser') : undefined;

export default {
  nuxtServerInit({ commit }, { req }) {
    const cookie = cookieparser.parse(req?.headers?.cookie || '');

    if (cookie) {
      commit('SET_LOCALE', cookie.lang || 'en');
    }

    commit('auth/SET_AUTH', {
      user: {
        email: 'contact@thecodeorigin.com',
        fullName: 'thecodeorigin',
        avatar: 'https://avatars.githubusercontent.com/u/60340907?s=200&v=4',
      },
      token: 'ultraSecretToken',
    });
  },
};
