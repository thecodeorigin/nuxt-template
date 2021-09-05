import { HTTP_METHODS } from '../constants';
import { api } from '../utils/api';

export default [
  api(HTTP_METHODS.GET, '/auth/me'),
  api(HTTP_METHODS.PUT, '/auth/me'),
  api(HTTP_METHODS.DELETE, '/auth/me'),
  api(HTTP_METHODS.POST, '/auth/login'),
  api(HTTP_METHODS.POST, '/auth/register'),
];
