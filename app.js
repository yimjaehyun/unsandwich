const express = require('express');
const {google} = require('googleapis');

const app = express();
app.set('view engine', 'ejs');
const port = 3000;
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  'http://localhost:3000'
);

google.options({auth: oauth2Client});

const scopes = [
  'https://www.googleapis.com/auth/gmail.readonly'
];

const url = oauth2Client.generateAuthUrl({
  scope: scopes
});


app.get('/', async function(req, res) {
  const code = req.query.code;
  if (code) {
    console.log('You\'ve been unsandwiched :)');
    const {tokens} = await oauth2Client.getToken(code);
    // console.log(tokens);
    oauth2Client.setCredentials(tokens);

    const gmail = google.gmail({version: 'v1', oauth2Client});

    // TODO: move to background so it doesn't make user wait in browser,
    // periodically call from database maybe
    var request = await gmail.users.threads.list({
      includeSpamTrash: true,
      userId: 'me',
      q: 'in:anywhere unsubscribe'
    });

    request = request.data;
    var result = request.threads;
    var nextPageToken = request.nextPageToken;
    while (nextPageToken) {
      request = await gmail.users.threads.list({
        includeSpamTrash: true,
        userId: 'me',
        q: 'in:anywhere unsubscribe',
        pageToken: nextPageToken
      });
      result = await result.concat(request.data.threads);
      nextPageToken = request.data.nextPageToken;
    }

  }
  res.render('app.ejs');
});

app.get('/auth', async function(req, res) {
  res.json(url);
})

app.listen(port, () => console.log(`Listening on port ${port}!`));
