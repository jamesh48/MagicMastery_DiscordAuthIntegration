import express from 'express';
import bodyParser from 'body-parser';
import generateAuthHtml from './static/authTemplate';
import { acmpReq } from './acmpUtils';

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

  const baseUrl = process.env.MM_AUTH_URL;
  const defaultChannelID = process.env.DISCORD_DEFAULT_CHANNELID;

  res.send(generateAuthHtml(discordId, baseUrl, defaultChannelID));
});

app.post('/acmpActivate', jsonParser, async (req, res) => {
  // Validate that the inputs are present
  if (!req.body.discordId || !req.body.email) {
    return res.status(400).send('Bad Request');
  }
  const { discordId, email } = req.body;
  const { contacts } = await acmpReq({
    method: 'GET',
    dataOrParams: { email },
    endpoint: 'contacts',
  });
  // validate that the email is found, send 404 otherwise
  if (!contacts.length) {
    return res.status(404).send('Email not found');
  }

  const [{ id }] = contacts;

  const { fields } = await acmpReq({
    method: 'GET',
    endpoint: 'fields',
    dataOrParams: { limit: 100 },
  });

  let discordIdFieldId = '';
  for (let i = 0; i < fields.length; i++) {
    if (fields[i].title === 'Discord ID') {
      discordIdFieldId = fields[i].id;
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
