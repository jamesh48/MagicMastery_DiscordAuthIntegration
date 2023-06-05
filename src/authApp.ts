import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
//
import express from 'express';
import bodyParser from 'body-parser';
import {
  validateDiscordUser,
  acmpReq,
  validateEmail,
  sendResponse,
} from './utilities';

const app = express();
const jsonParser = bodyParser.json();

app.get('/healthcheck', async (_req, res) => {
  return sendResponse({
    res,
    statusCode: 200,
    responseBody: { message: 'App is Healthy!' },
  });
});

app.post('/acmpActivate', jsonParser, async (req, res) => {
  // Validate that the inputs are present
  if (!req.body.discordId) {
    return sendResponse({
      res,
      statusCode: 400,
      responseBody: {
        error: 'Bad Request: Missing DiscordId, contact an Admin',
      },
    });
  }

  if (!req.body.email) {
    return sendResponse({
      res,
      statusCode: 400,
      responseBody: {
        error: 'Please include Email',
      },
    });
  }

  if (!validateEmail(req.body.email)) {
    return sendResponse({
      res,
      statusCode: 400,
      responseBody: { error: 'Please include a valid emeail' },
    });
  }

  if (req.body.discordId === 'undefined') {
    return sendResponse({
      res,
      statusCode: 400,
      responseBody: {
        error: 'Bad Request: undefined DiscordId, contact an Admin',
      },
    });
  }

  const { discordId, email } = req.body;
  // Validate that the user exists in Discord at all
  const verifiedUser = await validateDiscordUser(discordId);
  if (!verifiedUser) {
    return sendResponse({
      res,
      statusCode: 403,
      responseBody: { error: 'Unauthorized Request' },
    });
  }

  const { contacts } = await acmpReq({
    method: 'GET',
    dataOrParams: { email },
    endpoint: 'contacts',
  });
  // validate that the email is found, send 404 otherwise
  if (!contacts.length) {
    return sendResponse({
      res,
      statusCode: 404,
      responseBody: {
        error: 'Email not found, did you use the email you registered with?',
      },
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
        return sendResponse({
          res,
          statusCode: 403,
          responseBody: { error: 'User is already authorized' },
        });
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

  return sendResponse({
    res,
    statusCode: 200,
    responseBody: { message: 'ok' },
  });
});

export default app;
