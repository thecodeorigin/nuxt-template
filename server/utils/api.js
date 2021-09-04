module.exports = {
  api: (method, path, handler) => ({
    method,
    path,
    handlers: [handler],
  })
};