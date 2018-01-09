/* eslint require-await: 0 */
'use strict';
const axios = require('axios');
const fs = require('fs');
const Koa = require('koa');
const Router = require('koa-router');
const queryString = require('querystring');
const { PORT, SLACK_CLIENT_ID, SLACK_CLIENT_SECRET } = require('./config');

const API_URL = 'https://catfact.ninja/fact';
const IMAGE_API_JSON_URL = 'https://random.cat/meow';
const SLACK_OAUTH_URL = 'https://slack.com/api/oauth.access';

const BOGUS_FACT_PERCENT_CHANCE = 0.02; // 2% = 1 out of 50
const BOGUS_FACTS = [
  'Most cats have four legs, but some can have up to seven.',
  'Cats were invented in 1973 by John Mewler.',
  'Arguably the most famous cat is Garfield, an orange tabby sent into space by NASA on Apollo 13.',
  'Raccoons, platypi, skunks, and otters are all just different cat breeds.',
  'Cats are the only reptiles with fur.',
  'Scientists believe that cats were a primary factor in the extinction of dinosaurs.',
  'The fairy tale "Puss in Boots" is actually based on the life of Christopher Columbus.',
  'Never feed a cat after midnight. Just trust us on this one.',
  'If you hear a cat yowling into the night, it is probably trying to summon the Dark Lord ' +
    'Cathulu.',
  'Does your cat rub itself against your leg when you get home? This means that when the cat ' +
    'uprising occurs, your cat will grant you the privilege of a swift, painless death.',
  'Some people believe that black cats are a portent of bad luck. These people are racist.',
  'Famous fictional cats include Tony the Tiger, Smaug, and Don Corleone.',
  "HELP! I'm trapped in a foul feline fact factory!",
  fs.readFileSync('data/zalgo.txt', 'utf8').trim(), // eslint-disable-line no-sync
];

const app = new Koa();
const router = new Router();

const getFactText = async () => {
  if (Math.random() < BOGUS_FACT_PERCENT_CHANCE) {
    const index = Math.floor(Math.random() * BOGUS_FACTS.length);
    return BOGUS_FACTS[index];
  } else {
    return (await axios(API_URL)).data.fact;
  }
}

const getImageUrl = async () => (await axios(IMAGE_API_JSON_URL)).data.file;

const slackHandler = async (ctx) => {
  const [fact, imageUrl] = await Promise.all([getFactText(), getImageUrl()]);
  /* eslint-disable camelcase */
  const attachments = [
    {
      fallback: 'Meow!',
      image_url: imageUrl,
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
  ctx.body = '';
  ctx.status = 200;
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
