import { HTTP_METHODS } from '../constants';
import { api } from '../utils/api';
import { forward } from '../utils/forward';

export default [
  api(HTTP_METHODS.GET, '/projects', forward('https://6034d2676496b9001749dbad.mockapi.io/api/v1/blogs')),
  api(HTTP_METHODS.GET, '/projects/:id', forward('https://6034d2676496b9001749dbad.mockapi.io/api/v1/blogs/{id}')),
  api(HTTP_METHODS.POST, '/projects'),
  api(HTTP_METHODS.PUT, '/projects/:id'),
  api(HTTP_METHODS.PATCH, '/projects/:id'),
  api(HTTP_METHODS.DELETE, '/projects/:id'),
];
