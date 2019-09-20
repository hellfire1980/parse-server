// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');

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
      module: 'parse-server-sendinblue-adapter',
      options: {
         apiKey: process.env.SENDINBLUE_API,
		 fromName: process.env.SENDINBLUE_FROM_NAME,
		 fromEmail: process.env.SENDINBLUE_FROM_EMAIL,
		 translation: {
			default: 'en', // default locale for templates and texts (required)
			locale: 'locale' // the name of the property that stores the language of the user into the User table. It must be a two-letter language code: 'en', 'fr', 'de' etc. (optional)
		 },
		 
		       // 1. set the subject here, according to the languages you support.
      // Required only if verificationEmailTemplateId is not defined.
      verificationEmailSubject: {
        en: "Verify your email",
        fr: "Vérifier votre adresse e-mail"
      },
      // 2. set the plain text part here, according to the languages you support.
      // Required only if verificationEmailTemplateId is not defined.
      verificationEmailTextPart: {
        en: "Hi,\n\nYou are being asked to confirm the e-mail address {EMAIL} with %APP_NAME%\n\nClick here to confirm it: %LINK%",
        fr: "Bonjour,\n\nMerci de confirmer l'adresse e-mail {EMAIL} avec %APP_NAME%\n\nCliquez ici pour confirmer : %LINK%"
      },
      // 3. set the html text part here, according to the languages you support.
      // Required only if verificationEmailTemplateId is not defined.
      verificationEmailHtmlPart: {
        en: "Hi,<p>You are being asked to confirm the e-mail address {EMAIL} with <b>%APP_NAME%</b></p><p>Click <a href=\"%LINK%\">here</a> to confirm it.</p>",
        fr: "Bonjour,<p>Merci de confirmer l'adresse e-mail {EMAIL} avec <b>%APP_NAME%</b></p><p>Cliquez <a href=\"%LINK%\">ici</a> pour confirmer.</p>"
      },
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
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
