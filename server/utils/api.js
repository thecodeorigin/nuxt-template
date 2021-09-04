import { forward } from './forward';

export const api = (method, path, handler) => ({
  method,
  path,
  handlers: handler ? [handler] : [forward()],
});
