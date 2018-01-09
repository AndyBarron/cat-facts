/* eslint require-await: 0 */
'use strict';
const axios = require('axios');
const Koa = require('koa');
const Router = require('koa-router');
const queryString = require('querystring');
const util = require('util');
const xml2js = require('xml2js');
const { PORT, SLACK_CLIENT_ID, SLACK_CLIENT_SECRET } = require('./config');

const API_URL = 'https://catfact.ninja/fact';
const IMAGE_XML_URL = 'https://thecatapi.com/api/images/get?format=xml';
const SLACK_OAUTH_URL = 'https://slack.com/api/oauth.access';

const app = new Koa();
const router = new Router();

const getFactText = async () => {
  return (await axios(API_URL)).data.fact;
};

const objectFromXmlString = util.promisify(xml2js.parseString);

const getImageData = async () => {
  const result = await axios({
    responseType: 'document',
    url: IMAGE_XML_URL,
  });
  const xml = result.data;
  const parsed = await objectFromXmlString(xml);
  const image = parsed.response.data[0].images[0].image[0];
  return {
    sourceUrl: image.source_url[0],
    url: image.url[0],
  };
};

const slackHandler = async (ctx) => {
  const [fact, imageData] = await Promise.all([getFactText(), getImageData()]);
  /* eslint-disable camelcase */
  const attachments = [
    {
      author_link: imageData.sourceUrl,
      author_name: 'Meow!',
      fallback: 'Meow!',
      image_url: imageData.url,
    },
  ];
  ctx.body = {
    attachments,
    response_type: 'in_channel',
    text: fact,
  };
  /* eslint-enable camelcase */
};

router.get('/', async (ctx) => {
  ctx.body = 'Welcome to CAT FACTS! Actual landing page coming soon...';
});

router.get('/health', async (ctx) => {
  ctx.body = 'healthy';
});

router.get('/slack', slackHandler);
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
