const { HTTP_METHODS } = require('../constants/methods');
const { api } = require('../utils/api');

module.exports = [
  api(HTTP_METHODS.GET, '/auth/me', []),
  api(HTTP_METHODS.PUT, '/auth/me', []),
  api(HTTP_METHODS.DELETE, '/auth/me', []),
  api(HTTP_METHODS.POST, '/auth/login', []),
  api(HTTP_METHODS.POST, '/auth/register', []),
];
