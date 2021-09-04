const { HTTP_METHODS } = require('../constants/methods');
const { api } = require('../utils/api');
const { forward } = require('../utils/forward');

module.exports = [
  api(HTTP_METHODS.GET, '/projects', forward('https://6034d2676496b9001749dbad.mockapi.io/api/v1/blogs')),
  api(HTTP_METHODS.GET, '/projects/:id', forward('https://6034d2676496b9001749dbad.mockapi.io/api/v1/blogs/{id}')),
  api(HTTP_METHODS.POST, '/projects', []),
  api(HTTP_METHODS.PUT, '/projects/:id', []),
  api(HTTP_METHODS.PATCH, '/projects/:id', []),
  api(HTTP_METHODS.DELETE, '/projects/:id', []),
];
