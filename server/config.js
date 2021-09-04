module.exports = {
  CONFIG: {
    IS_DEV: process.env.NODE_ENV !== 'production',
    PORT: process.env.PORT || 3000,
    HOST: process.env.HOST || 'localhost',
  }
};
