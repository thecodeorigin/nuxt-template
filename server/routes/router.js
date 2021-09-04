const express = require('express');
const { CONFIG } = require('../config');

const router = [
  ...require('./auth'),
  ...require('./project'),
];

module.exports = {
  getApiRoutes: () => {
    const routes = express.Router();

    router.forEach(route => {
      routes[route.method](route.path, route.handlers);
    });

    // 404 error handler
    routes.use((req, res) => {
      return res.status(404).json({
        status: 'error',
        code: 404,
        message: `${req.url} not found`,
      });
    });

    // Error handler
    routes.use((err, req, res, _next) => {
      // HTTP Exception
      if (err.statusCode && err.message) {
        return res.status(err.statusCode).json({
          status: err.statusCode === 400 || err.statusCode === 401 ? 'fail' : 'error',
          statusCode: err.statusCode,
          message: err.message,
        });
      }

      // Exception
      return res.status(500).json({
        status: 'error',
        statusCode: 500,
        message: !CONFIG.IS_DEV ? 'An unexpected error has occurred.' : err,
      });
    });

    return routes;
  }
};