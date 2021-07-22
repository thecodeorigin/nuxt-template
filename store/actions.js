export default {
  nuxtServerInit: ({ commit }) => {
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
