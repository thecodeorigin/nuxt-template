import dev from '@utils/functions/dev';

export default ({ app, $axios, error: nuxtError }, inject) => {
  const clientApi = $axios.create({
    headers: {
      common: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    },
  });

  clientApi.onRequest(() => {
    dev.log('Client API executed');
  });

  clientApi.onResponse((_response) => {});

  clientApi.onError((error) => {
    dev.error(error);
    switch (error.response?.status) {
      case 404:
        nuxtError({
          statusCode: 404,
          message: app.i18n.t('error.404'),
        });
        break;
      default:
        nuxtError({
          statusCode: 500,
          message: app.i18n.t('error.500'),
        });
        break;
    }
  });

  clientApi.onRequestError((_err) => {});
  clientApi.onResponseError((_err) => {});

  inject('clientApi', clientApi);
};
