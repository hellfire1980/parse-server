// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');
var unirest = require('unirest');
var cryptLib = require('@skavinvarnan/cryptlib');

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || '', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',  // Don't forget to change to https if needed
  publicServerURL: process.env.PARSE_PUBLIC_SERVER_URL || 'http://localhost:1337/parse',
  appName: process.env.PARSE_SERVER_APP_NAME || 'myAppName',
  verifyUserEmails: process.env.PARSE_SERVER_VERIFY_USER_EMAILS || false,
  emailAdapter: {
      module: 'parse-server-mailjet-adapter',
      options: {
         apiKey: process.env.MAILJET_API_KEY,
         apiSecret: process.env.MAILJET_API_SECRET,
         apiErrorEmail: process.env.MAILJET_ERROR_EMAIL,
         fromName: process.env.MAILJET_FROM_NAME,
         fromEmail: process.env.MAILJET_FROM_EMAIL,
         passwordResetSubject: "Reset My Password",
         passwordResetHtmlPart: "Hi,<p>You requested to reset your password for <b>{{var:appName}}</b>.</p><p>Please, <a href={{var:link}}, target='_blank'>click here to set a new password</a></p>",
         verificationEmailSubject: "Verify your email",
         verificationEmailHtmlPart: "Hi,<p>You are being asked to confirm the e-mail address {{var:email}} with <b>{{var:appName}}</b></p><p><a href={{var:link}} target='_blank'>Click here to confirm it</a></p>"
      }
  },
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  }
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
//app.get('/test', function(req, res) {
//  res.sendFile(path.join(__dirname, '/public/test.html'));
//});

// -------------------
//	Open subscription
// -------------------
// This is a post methos without authentication require
app.use(express.json());

app.post('/authSubscription', function(req, res) {
	 unirest.post("http://localhost:1337/parse/functions/authSubscription")
    .headers({'X-Parse-Application-Id': process.env.APP_ID, 'Content-Type': 'application/json'})
	.send(req.body)
    .end(function(response) {
		console.log(response.body);
		res.status(200).send();
     });
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
