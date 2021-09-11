/* eslint-disable no-console */
import Express from 'express';
import chalk from 'chalk';
import { CONFIG } from './config';
import { router } from './routes/index';
import { logger } from './utils/logger';

const app = Express();

app.use(Express.json({ limit: '5mb' }));

const routes = Express.Router();

logger.debug(
  `${chalk.red(`(!)`)} Make change to API Routes at: ${chalk.yellow('@/server/routes/**')}\n`
);
router.forEach(route => {
  routes[route.method](route.path, route.handlers);
  logger.debug(
    `${chalk.green(`✓ API Routes ready:`)} ${chalk.yellow(`[${route.method}] ${route.path}`)}`
  );
});

app.use(routes);

process.on('SIGINT', function () {
  console.log('\nGracefully shutting down from SIGINT (Ctrl-C)');
  // some other closing procedures go here
  process.exit(1);
});

// Export express app
export default app;

// Start standalone server if directly running
if (require.main === module) {
  // Start express server
  app.listen(CONFIG.PORT, CONFIG.HOST, () => {
    console.log(`Server started at http://${CONFIG.HOST}:${CONFIG.PORT} \n`);
  });
}
