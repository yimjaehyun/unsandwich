const express = require('express');
const {google} = require('googleapis');

const app = express();
app.set('view engine', 'ejs');
const port = process.env.PORT;
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  'https://unsandwich.herokuapp.com'
);

google.options({auth: oauth2Client});

const scopes = [
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/documents'
];

const url = oauth2Client.generateAuthUrl({
  scope: scopes
});

const scriptId = '1PRlWl7iMcR9GsA2cs2cVe4MR8Kj6w-KA4BZ97E2-X8YHZNm3Kd62uE4W';
const script = google.script('v1');

app.get('/', async function(req, res) {
  const code = req.query.code;
  if (code) {
    console.log('You\'ve been unsandwiched :)');
    const {tokens} = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    script.scripts.run({
      auth: oauth2Client,
      resource: {
        function: 'myFunction'
      },
      scriptId: scriptId
    });
  }
  res.render('app.ejs');
});

app.get('/auth', async function(req, res) {
  res.json(url);
})

app.listen(process.env.PORT || 3000, () => console.log(`Listening on port ${port}!`));
