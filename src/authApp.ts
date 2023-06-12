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
  assignBadgesFromTags,
  assignBadge,
  removeBadgesFromTags,
  dgAcmpReq,
  fetchContactTags,
} from './utilities';

const app = express();
const jsonParser = bodyParser.json();
const urlEncodedParser = bodyParser.urlencoded({ extended: true });

app.get('/healthcheck', async (_req, res) => {
  return sendResponse({
    res,
    statusCode: 200,
    responseBody: { message: 'App is Healthy!' },
  });
});

/* Backwards Compatible Api Route */
app.post('/dgmagic/assignBadge', jsonParser, async (req, res) => {
  try {
    await assignBadge(req.body.data.email);
    return sendResponse({
      res,
      statusCode: 200,
      responseBody: { message: 'ok' },
    });
  } catch (err) {
    return sendResponse({
      res,
      statusCode: 500,
      responseBody: { error: 'error' },
    });
  }
});

app.post('/dgmagic/newMemberAssignBadges', jsonParser, async (req, res) => {
  console.info(req.body);
  try {
    const { email } = req.body.data;
    const { contacts } = await dgAcmpReq({
      method: 'GET',
      dataOrParams: { email },
      endpoint: 'contacts',
    });

    const [{ id }] = contacts;

    const fetchedContactTags = await fetchContactTags(id, true);

    const joinedContactTags = fetchedContactTags.join(', ');

    console.info(joinedContactTags, '->', email);
    await assignBadgesFromTags(joinedContactTags, email);

    return sendResponse({
      res,
      statusCode: 200,
      responseBody: { message: 'ok' },
    });
  } catch (err) {
    console.info(err.message);
    return sendResponse({
      res,
      statusCode: 500,
      responseBody: { error: 'error' },
    });
  }
});

app.post('/dgmagic/deleteBadgeFromTag', urlEncodedParser, async (req, res) => {
  try {
    const { tags, email } = req.body.contact;
    await removeBadgesFromTags(tags, email);
    return sendResponse({
      res,
      statusCode: 200,
      responseBody: { message: 'ok' },
    });
  } catch (err) {
    return sendResponse({
      res,
      statusCode: 500,
      responseBody: { error: 'error' },
    });
  }
});

app.post('/dgmagic/assignBadgeFromTag', urlEncodedParser, async (req, res) => {
  try {
    console.info(req.body.contact);
    const { tags, email } = req.body.contact;
    await assignBadgesFromTags(tags, email);
    return sendResponse({
      res,
      statusCode: 200,
      responseBody: { message: 'ok' },
    });
  } catch (err) {
    return sendResponse({
      res,
      statusCode: 500,
      responseBody: { error: 'error' },
    });
  }
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
      responseBody: { error: 'Please include a valid email' },
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

  const contactTags = await fetchContactTags(id, false);

  if (contactTags.indexOf('MM Member') !== -1) {
    return sendResponse({
      res,
      statusCode: 404,
      responseBody: {
        error: 'Email not found',
      },
    });
  }

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

  try {
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
      responseBody: { message: 'Thank you' },
    });
  } catch (err) {
    return sendResponse({
      res,
      statusCode: 500,
      responseBody: {
        error:
          'Your registration did not work as expected, please try again but if the error persists- contact an Admin.',
      },
    });
  }
});

export default app;
