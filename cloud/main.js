Parse.Cloud.define('hello', function(req, res) {
  return 'Hi';
});

/*Parse.Cloud.define('login', function(req, res) {
	const username = req.params.username;
	const password = req.params.password;
	const user = await Parse.User.logIn(username, password);
	const sessionToken = user.getSessionToken();
	const oldSessionQuery = new Parse.Query(Parse.Session);
	
	oldSessionQuery.equalTo('user', user);
	oldSessionQuery.notEqualTo('sessionToken', sessionToken);
	
	const oldSession = await oldSessionsQuery.find({ useMasterKey: true });
	await Parse.Object.destroyAll(oldSession, { useMasterKey: true });
	return sessionToken;
});*/