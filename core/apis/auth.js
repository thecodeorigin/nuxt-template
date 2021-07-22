import dev from '@utils/functions/dev';

export default ({ $axios, store, error: nuxtError }, inject) => {
  const authApi = $axios.create({
    headers: {
      common: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    },
  });

  const authToken = store.getters['auth/token'];

  authApi.onRequest((config) => {
    config.headers.Authorization = 'Bearer ' + authToken;
    dev.log('Auth API executed');
  });

  authApi.onResponse((_response) => {});

  authApi.onError(async(error) => {
    await nuxtError({
      statusCode: error.response?.status,
      message: error.message,
    });
    dev.error(error);

    return Promise.resolve(false);
  });

  authApi.onRequestError((_err) => {});
  authApi.onResponseError((_err) => {});

  inject('authApi', authApi);
};
