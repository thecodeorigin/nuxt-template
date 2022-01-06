/* eslint-disable no-console */
const isDev =  () => process.env.NODE_ENV !== 'production';
const devText = '[Dev only]';

export const dev = {
  /**
   * Equivalent to console.error but in dev mode only
   * @param  {...any} args
   */
  error: (...args) => {
    if (isDev()) {
      console.error(devText, ...args);
    } else {
      console.error('Something is wrong');
    }
  },
  /**
   * Equivalent to console.log but in dev mode only
   * @param  {...any} args
   */
  log: (...args) => {
    if (isDev()) {
      console.log(devText, ...args);
    }
  },
  /**
   * Equivalent to console.warn but in dev mode only
   * @param  {...any} args
   */
  warn: (...args) => {
    if (isDev()) {
      console.warn(devText, ...args);
    }
  },
};

export default dev;
