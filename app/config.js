'use strict';
const env = require('strict-env');

module.exports = env.config({
  PORT: env.port,
  SLACK_CLIENT_ID: env.string,
  SLACK_CLIENT_SECRET: env.string,
});
