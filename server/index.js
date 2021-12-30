import express from 'express';
import chalk from 'chalk';

import axios from 'axios';
import { logger } from './utils/logger';

const app = express();
app.use(express.json());

const http = axios.create({
  baseURL: process.env.SERVER_API_URL,
  // timeout: 10000,
});

app.all('*', async (req, res) => {
  const url = req.url;
  const method = req.method;
  const body = req.body;
  const headers = {};

  if (req.headers.authorization) {
    headers.authorization = req.headers.authorization;
  } else if (req.headers.authorization) {
    headers.Authorization = req.headers.Authorization;
  }

  try {
    const response = await http.request({
      url,
      method,
      headers,
      data: body,
    });

    logger.debug(
      `${chalk.bold.blue(process.env.SERVER_API_URL + url)}: ${chalk.green(
        response.status
      )}`
    );

    res.status(response.status).json(response.data);
  } catch (err) {
    logger.debug(
      `${chalk.bold.red(process.env.SERVER_API_URL + url)}: ${chalk.bold.red(
        err.response?.status || 500
      )} ${err.message}\nHeaders: ${chalk.yellow(
        JSON.stringify(Object.keys(headers).filter((k) => k))
      )}\nBody: ${chalk.yellow(
        JSON.stringify(Object.keys(body || {}).filter((k) => k))
      )}`
    );

    res.status(err.response?.status || 500).json({
      status: err.response?.status,
      statusText: err.response?.statusText,
      error: err.response?.data,
    });
  }
});

module.exports = app;
