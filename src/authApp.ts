import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
//
import express from 'express';
import bodyParser from 'body-parser';
import { acmpReq } from './acmpUtils';
import { validateDiscordUser } from './discordUtils';
import { validateEmail } from './serverUtils';

const app = express();
const jsonParser = bodyParser.json();

app.get('/healthcheck', async (_req, res) => {
  res.send('App is Healthy!');
});

app.post('/acmpActivate', jsonParser, async (req, res) => {
  // Validate that the inputs are present
  if (!req.body.discordId) {
    return res.status(400).json({ error: 'Bad Request' });
  }

  if (!req.body.email) {
    return res.status(400).json({ error: 'Please include Email' });
  }

  if (!validateEmail(req.body.email)) {
    return res.status(400).json({ error: 'Please include a valid email' });
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
