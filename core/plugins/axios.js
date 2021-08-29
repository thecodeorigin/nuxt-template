import dev from '@/core/utils/functions/dev';

export default ({ $axios, store, error: nuxtError }) => {
  const authToken = store.getters['auth/token'];

  $axios.onRequest((config) => {
    if (authToken) {
      config.headers.Authorization = 'Bearer ' + authToken;
    }
    dev.log((authToken && '[Authenticated]') + 'API executed');
  });

  $axios.onResponse((_response) => {});

  $axios.onError(async(error) => {
    await nuxtError({
      statusCode: error.response?.status,
      message: error.message,
    });
    dev.error(error);

    return Promise.resolve(false);
  });

  $axios.onRequestError((_err) => {});
  $axios.onResponseError((_err) => {});

};
