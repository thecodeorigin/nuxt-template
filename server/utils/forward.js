const axios = require('axios');
const qs = require('qs');

module.exports = {
  forward: (url) => {
    return async (req, res, next) => {
      try {
        const params = req.params;
        const query = req.query;

        // Replace params in url
        Object.keys(params).forEach(key => {
          url = url.replace(new RegExp(`[${key}]`), params[key]);
        });

        // See https://github.com/axios/axios#request-config
        const response = await axios.request({
          url: url + '?' + qs.stringify(query),
          method: req.method,
          data: req.body,
          headers: {
            cookie: req.headers.cookie
          }
        });

        return res.json({
          status: response.status,
          statusText: response.statusText,
          data: response.data
        });
      } catch (error) {
        return next(error);
      }
    };
  }
};