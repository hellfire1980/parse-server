Parse.Cloud.define("hello", (request) => {
    var text = "hello world";
    var jsonObject = {
        "answer": text
    };
    return jsonObject
});


Parse.Cloud.define('login', async (request) => {
	const username = request.params.username;
	const password = request.params.password;
	const user = await Parse.User.logIn(username, password);
	const sessionToken = user.getSessionToken();
	const oldSessionsQuery = new Parse.Query(Parse.Session);
	
	oldSessionsQuery.equalTo('user', user);
	oldSessionsQuery.notEqualTo('sessionToken', sessionToken);
	
	const oldSession = await oldSessionsQuery.find({ useMasterKey: true });
	await Parse.Object.destroyAll(oldSession, { useMasterKey: true });
	return sessionToken;
	
	/*var jsonObject = {
        "answer": sessionToken
    };
	return jsonObject;*/
});
