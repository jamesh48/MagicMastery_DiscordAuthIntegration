import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
//
import express from 'express';
import bodyParser from 'body-parser';
import generateAuthHtml from './static/authTemplate';
import { acmpReq } from './acmpUtils';
import { validateDiscordUser } from './discordUtils';

const app = express();
const jsonParser = bodyParser.json();

app.get('/ping', async (_req, res) => {
  res.send('pong');
});

app.get('/healthcheck', async (_req, res) => {
  res.send('App is Healthy!');
});

app.get('/authCode', async (req, res) => {
  /* Parameters */
  const code = req.query.code as string;
  const client_secret = process.env.DISCORD_CLIENT_SECRET;
  const client_id = process.env.DISCORD_CLIENT_ID;
  const redirect_uri = `${process.env.MM_AUTH_URL}/authCode`;

  const oAuthResult = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    body: new URLSearchParams({
      client_id,
      client_secret,
      code,
      grant_type: 'authorization_code',
      scope: 'email',
      redirect_uri,
    }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  const oAuthData = await oAuthResult.json();

  const userResult = await fetch('https://discord.com/api/users/@me', {
    headers: {
      authorization: `${oAuthData.token_type} ${oAuthData.access_token}`,
    },
  });

  console.info('\n\n<--- USER RESULT --->\n\n');
  const candidateUser = await userResult.json();
  const { id: discordId, email } = candidateUser;
  console.info(discordId, email);

  if (!discordId) {
    return res.status(400).send('bad request');
  }

  const baseUrl = process.env.MM_AUTH_URL;
  const defaultChannelID = process.env.DISCORD_DEFAULT_CHANNELID;
  return res
    .status(200)
    .send(generateAuthHtml(discordId, baseUrl, defaultChannelID));
});

app.post('/acmpActivate', jsonParser, async (req, res) => {
  // Validate that the inputs are present
  if (!req.body.discordId) {
    return res.status(400).json({ error: 'Bad Request' });
  }

  if (!req.body.email) {
    return res.status(400).json({ error: 'Please include Email' });
  }

  // Discord Token Request has expired after 5 minutes
  if (req.body.discordId === 'undefined') {
    return res
      .status(400)
      .json({ error: 'Expired Request, please reauthenticate.' });
  }

  const { discordId, email } = req.body;
  // Validate that the user exists in Discord at all
  const verifiedUser = await validateDiscordUser(discordId);
  if (!verifiedUser) {
    return res.status(403).json({ error: 'Unauthorized Request' });
  }

  const { contacts } = await acmpReq({
    method: 'GET',
    dataOrParams: { email },
    endpoint: 'contacts',
  });
  // validate that the email is found, send 404 otherwise
  if (!contacts.length) {
    return res.status(404).json({
      error: 'Email not found, did you use the email you registered with?',
    });
  }

  const [{ id }] = contacts;

  const { fields } = await acmpReq({
    method: 'GET',
    endpoint: 'fields',
    dataOrParams: { limit: 100 },
  });

  let discordIdFieldId = '';
  for (let i = 0; i < fields.length; i++) {
    if (fields[i].title === 'Discord Member ID') {
      discordIdFieldId = fields[i].id;
    }
  }

  const { fieldValues } = await acmpReq({
    endpoint: `contacts/${id}/fieldValues`,
    dataOrParams: {},
    method: 'GET',
  });

  for (let i = 0; i < fieldValues.length; i++) {
    if (fieldValues[i].field === discordIdFieldId) {
      if (fieldValues[i].value) {
        return res.status(403).send({ error: 'User is already authorized' });
      }
    }
  }

  await acmpReq({
    method: 'PUT',
    endpoint: `contacts/${id}`,
    dataOrParams: {
      contact: {
        fieldValues: [{ field: discordIdFieldId, value: discordId }],
      },
    },
  });

  return res.send('ok');
});

export default app;
