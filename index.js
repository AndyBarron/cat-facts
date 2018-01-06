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
  ctx.body = (await getFactJson()).fact;
};

router.get('/slack', slackHandler);
router.post('/slack', slackHandler);
router.get('/slack/authorize', async (ctx) => {
  const { code } = ctx.query;
  const query = queryString.stringify({
    client_id: SLACK_CLIENT_ID,
    client_secret: SLACK_CLIENT_SECRET,
    code,
  });
  const _accessToken = (await axios.post(SLACK_OAUTH_URL, query)).data.access_token;
  ctx.redirect('/slack/success');
});
router.get('/slack/success', async (ctx) => {
  ctx.body = 'Welcome to CAT FACTS!';
})

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(PORT, () => console.info(`Server listening on port ${PORT}`));
