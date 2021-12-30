import dev from '@/core/utils/functions/dev';

export default ({ $axios, store }) => {
  $axios.onRequest((config) => {
    const authToken = store.getters['auth/token'];

    if (authToken) {
      config.headers.Authorization = 'Bearer ' + authToken;
    }
    dev.log((authToken ? '[Authenticated] ' : '') + 'API executed');
  });

  $axios.onResponse((_response) => {});

  $axios.onError((error) => {
    // Handling, refresh token,...
    dev.error(error);

    return Promise.reject(error);
  });

  $axios.onRequestError((_err) => {});

  $axios.onResponseError((_err) => {});
};
