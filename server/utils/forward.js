import chalk from 'chalk';
import axios from 'axios';
import qs from 'qs';
import { BASE_FORWARD_API } from '../constants/index';
import { CONFIG } from '../config';
import { logger } from './logger';

export const forward = (url) => {
  return async (req, res, next) => {
    try {
      const params = req.params;
      const query = req.query;

      url = url || BASE_FORWARD_API + req.url;

      // Replace params in url
      Object.keys(params).forEach(key => {
        url = url.replace(new RegExp(`[${key}]`), params[key]);
      });

      // See https://github.com/axios/axios#request-config
      const response = await axios.request({
        url: url + '?' + qs.stringify(query),
        method: req.method,
        data: req.body,
        headers: {
          cookie: req.headers.cookie
        }
      });

      return res.status(response.status).json(response.data);
    } catch (error) {
      if (CONFIG.IS_DEV) {
        logger.debug(
          `${chalk.bold.blue(url)}: ${chalk.red(error)}`
        );
      } else {
        logger.info(
          `${chalk.bold.blue(url)}: ${chalk.red(error)}`
        );
      }

      return res.status(error?.response?.status || 500).json(error?.response?.data);
    }
  };
};
