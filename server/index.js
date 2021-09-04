/* eslint-disable no-console */
const express = require('express');
const nuxt = require('./nuxt');
// const { router } = require('./routes/router');
const { CONFIG } = require('./config');
const { getApiRoutes } = require('./routes/router');

const app = express();

app.use(express.json({ limit: '5mb' }));

async function start() {
  try {
    app.use('/api/v1', getApiRoutes());

    await nuxt(app);

    // Start express server
    app.listen(CONFIG.PORT, CONFIG.HOST, () => {
      console.log(`Nuxt Render Server started at http://${CONFIG.HOST}:${CONFIG.PORT} \n`);
    });
  } catch (error) {
    // Do something when server fails to start
    console.error(error);
  }
}

process.on('SIGINT', function () {
  console.log('\nGracefully shutting down from SIGINT (Ctrl-C)');
  // some other closing procedures go here
  process.exit(1);
});

start();
