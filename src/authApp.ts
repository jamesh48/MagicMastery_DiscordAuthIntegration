import express from 'express';
import bodyParser from 'body-parser';
import generateAuthHtml from './static/authTemplate';

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
  const { discordId, email } = req.body;

  console.info(discordId, email);
  // post details to active campaign
  res.send('ok');
});

export default app;
