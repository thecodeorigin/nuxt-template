/* eslint-disable no-console */
export const dev = {
  /**
   * Equivalent to console.error but in dev mode only
   * @param  {...any} args
   */
  error: (...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Dev only]', ...args);
    } else {
      console.error('Something is wrong');
    }
  },
  /**
   * Equivalent to console.log but in dev mode only
   * @param  {...any} args
   */
  log: (...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Dev only]', ...args);
    }
  },
  /**
   * Equivalent to console.warn but in dev mode only
   * @param  {...any} args
   */
  warn: (...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Dev only]', ...args);
    }
  },
};

export default dev;
