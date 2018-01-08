'use strict';
const axios = require('axios');
const Koa = require('koa');
const Router = require('koa-router');
const queryString = require('querystring');
const { PORT, SLACK_CLIENT_ID, SLACK_CLIENT_SECRET } = require('./config');

const API_URL = 'https://catfact.ninja/fact';
const SLACK_OAUTH_URL = 'https://slack.com/api/oauth.access';

const app = new Koa();
const router = new Router();

const getFactJson = async () => {
  return (await axios(API_URL)).data;
};

const slackHandler = async (ctx) => {
  const { fact } = await getFactJson();
  ctx.body = {
    response_type: 'in_channel', // eslint-disable-line camelcase
    text: fact,
  };
};

router.get('/', async (ctx) => {
  ctx.body = 'Welcome to CAT FACTS! Actual landing page coming soon...';
});

router.get('/health', async (ctx) => {
  ctx.body = 'healthy';
});

router.post('/slack', slackHandler);
router.get('/slack/authorize', async (ctx) => {
  const { code } = ctx.query;
  /* eslint-disable camelcase */
  const query = queryString.stringify({
    client_id: SLACK_CLIENT_ID,
    client_secret: SLACK_CLIENT_SECRET,
    code,
  });
  /* eslint-enable camelcase */
  await axios.post(SLACK_OAUTH_URL, query); // TODO: Save access token
  ctx.redirect('/slack/success');
});
router.get('/slack/success', (ctx) => {
  ctx.body = 'Welcome to CAT FACTS!'; // TODO: Pretty landing page
});

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(PORT, () => console.info(`Server listening on port ${PORT}`));
