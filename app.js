const express = require('express');
const {google} = require('googleapis');

const app = express();
const port = 3000;

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  'https://localhost:3000'
); 

google.options({auth: oauth2Client});

const scopes = [
  'https://www.googleapis.com/auth/gmail.readonly'
]

app.get('/', async function(req, res) {
  const url = oauth2Client.generateAuthUrl({
    scope: scopes
  });
  res.redirect(url);
  const {tokens} = await oauth2Client.getToken(res.code);
  oauth2Client.setCredentials(tokens);
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
