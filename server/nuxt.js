/* eslint-disable no-console */
const { loadNuxt, build } = require('nuxt');
const { CONFIG } = require('./config');

module.exports = async function(app) {
  try {
    // We get Nuxt instance
    const nuxt = await loadNuxt(CONFIG.IS_DEV ? 'dev' : 'start');

    // Build only in dev mode with hot-reloading
    if (CONFIG.IS_DEV) {
      build(nuxt);
  
      const cors = require('cors');
      app.use(cors());
    }

    // Render every route with Nuxt.js
    app.use(nuxt.render);

  } catch (error) {
    // Do something when server fails to start
    console.error(error);
  }
};