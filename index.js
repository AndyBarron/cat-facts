'use strict';
const axios = require('axios');
const Koa = require('koa');
const Router = require('koa-router');

const API_URL = 'https://catfact.ninja/fact';
const DEFAULT_PORT = 3000;
const PORT = process.env.PORT || DEFAULT_PORT; // eslint-disable-line no-process-env

const app = new Koa();
const router = new Router();

const getFactJson = async () => {
  return (await axios(API_URL)).data;
};

const slackHandler = async (ctx) => {
  ctx.body = (await getFactJson()).fact;
};

router.get('/slack', slackHandler);
router.post('/slack', slackHandler);

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(PORT, () => console.info(`Server listening on port ${PORT}`));
