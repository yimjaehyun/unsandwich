const express = require('express');
const {google} = require('googleapis');
const fs = require('fs');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }, resave: true, saveUninitialized: true}));

const SCOPES = [
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/script.external_request'
];

app.set('view engine', 'ejs');

const port = process.env.PORT;

const scriptId = '16jjw7Mkqd_OxAP1uIKBaEDZaizbKbTI6q5yRLI1L2zKrRArm1IRgzmxx';

function callScript(auth) {
  console.log("calling script");
  const script = google.script('v1');
  script.scripts.run({
    scriptId: scriptId,
    auth: auth,
    resource: {
      function: 'myFunction'
    },
  },
  function(err, event) {
    if (err) return console.log('The API returned an error: ' + err);
    console.log('unsandwiched');
  });
}


// app.get('/', async function(req, res) {
//   const code = req.query.code;
//   if (code) {
//     console.log('You\'ve been unsandwiched :)');
//
//     const {tokens} = await oauth2Client.getToken(code);
//     oauth2Client.setCredentials(tokens);
//
//     script.scripts.run({
//       auth: oauth2Client,
//       resource: {
//         function: 'myFunction'
//       },
//       scriptId: scriptId
//     });
//   }
//   res.render('app.ejs');
// });

// app.get('/auth', async function(req, res) {
//   oauth2Client = new google.auth.OAuth2(
//     process.env.CLIENT_ID,
//     process.env.CLIENT_SECRET,
//     'http://localhost:3000'
//   );
//   //google.options({auth: oauth2Client});
//
//   const url = oauth2Client.generateAuthUrl({
//     // access_type: 'offline',
//     scope: scopes
//   });
//   res.json(url);
// });

app.get('/', async function(req, res) {
  res.render('app.ejs');
});

app.get('/auth', function(req, res) {
  fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    const {client_secret, client_id, redirect_uris} = JSON.parse(content).installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[1]);
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });

    req.app.locals.client = oAuth2Client;
    req.session.url = authUrl;
    res.json(authUrl);
  });
});

app.get('/done', function(req, res) {
  var code = req.query.code;
  var auth = req.app.locals.client;
  auth.getToken(code, (err, token) => {
    if (err) return console.error('Error retrieving access token', err);
    auth.setCredentials(token);
    callScript(auth);
  });
  res.render('done.ejs');
});

app.listen(process.env.PORT || 3000, () => console.log(`Listening on port ${port}!`));
