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
	const id = user.id;
	const sessionToken = user.getSessionToken();
	const vip = user.get("vip");
	const subscribeDate = user.get("subscribeDate");
	const oldSessionsQuery = new Parse.Query(Parse.Session);
	
	oldSessionsQuery.equalTo('user', user);
	oldSessionsQuery.notEqualTo('sessionToken', sessionToken);
	
	const oldSession = await oldSessionsQuery.find({ useMasterKey: true });
	await Parse.Object.destroyAll(oldSession, { useMasterKey: true });
	//return sessionToken;
	
	var jsonObject = {
        "sessionToken": sessionToken,
		"objectId": id,
		"vip": vip,
		"subscribeDate": subscribeDate
    };
	return jsonObject;
});

Parse.Cloud.define('authSubscription', async (request) => {
	const order_id = request.params.order_id;
	const product_title = request.params.product_title;
	const product_id = request.params.product_id;
	const buyer_email = request.params.buyer_email;
	const buyer_ip = request.params.buyer_ip;
	const payment_method = request.params.payment_method; //0 = Paypal, 1 = Bitcoin, 2 = Ethereum, 3 = Perfect Money, 4 = Stripe
	const invoice_amount = request.params.invoice_amount;
	const invoice_amount_usd = request.params.invoice_amount_usd;
	const quantity = request.params.quantity;
	const purchased_at = request.params.purchased_at;
	const txn_id = request.params.txn_id;
	const status = request.params.status;
	const custom_fields = JSON.parse(request.params.custom_fields);
	const invoice_id = request.params.invoice_id;
	const email = custom_fields.Email_to_subscribe;
	
	var todayDate;
	var calExpireDate;
	var vip = "";
	var monthVal = 0;
	var remark;
	
	if (product_id == 'ad524b6771ff') {
		vip = "monthly-pro";
		monthVal = 1;
	}
	
	if (product_id == 'ad03f62ba4a5') {
		vip = "yearly-pro";
		monthVal = 12;
	}
	
	if ((status == 3 || status == 4 ) && vip != '') {
		const userQuery = new Parse.Query(Parse.User);	
		
		userQuery.equalTo('email', email);
		
		const user = await userQuery.first({ useMasterKey: true });
		
		if (user != undefined) {
			var expireDate = user.get("expireDate");
			
			todayDate = new Date(new Date().toUTCString());
			
			if (expireDate == undefined) {
				calExpireDate = new Date(todayDate.setMonth(todayDate.getMonth() + monthVal));
				user.set("expireDate", calExpireDate);
			} else {
				calExpireDate = new Date(expireDate.setMonth(expireDate.getMonth() + monthVal));
				user.set("expireDate", calExpireDate);
			}
			
			user.set("vip", vip);
			user.set("subscribeDate", todayDate);
			user.save(null, { useMasterKey: true });
		} else {
			remark = "User email not exists";
		}
		
	}
	
	var jsonObject = {
		"product_id": product_id,
        "email": email,
		"purchased_at": purchased_at,
		"payment_method": payment_method,
		"invoice_amount_usd": invoice_amount_usd,
		"vip": vip,
		"subscribeDate": todayDate,
		"expireDate": calExpireDate,
		"remark": remark
    };
	
	return jsonObject;
});

Parse.Cloud.define('authGoogleSubscription', async (request) => {
	const crypto = require('crypto');
	const object_id = request.params.ObjectId;
	const date = request.params.date;
	const sku = request.params.sku;
	const token = request.params.token;
	const user = request.user;
	const key = 'codingaffairscom';
	
	var http_ipn_hash = request.headers.http_ipn_hash;
	var hash = crypto.createHmac('sha512', key)
		.update(object_id + date + sku + token)
		.digest('hex');
	var todayDate;
	var vip;
	var monthVal = 0;
		
	if (http_ipn_hash == undefined || http_ipn_hash == '' || http_ipn_hash != hash) {
		throw new Error('Invalid content');
	}
	
	if (sku == 'com.atvx.launcher.iab.monthly') {
		vip = 'monthly';
		monthVal = 1;
	} else if (sku == 'com.atvx.launcher.iab.yearly') {
		vip = 'yearly';
		monthVal = 12;
	}
	
	if (user != undefined && monthVal > 0 && vip != '') {
		todayDate = new Date(new Date().toUTCString());
		
		user.set("vip", vip);
		user.set("subscribeDate", todayDate);
		user.set("googleToken", token);
		
		user.save(null, { useMasterKey: true });
	}
	
	var jsonObject = {
		"objectId": object_id,
		"date": date,
		"vip": vip,
		"subscribeDate": todayDate
    };
	
	return jsonObject;
});


Parse.Cloud.define('rewardCoin', async (request) => {
	const crypto = require('crypto');
	const object_id = request.params.ObjectId;
	const date = request.params.date;
	const coin = Number(request.params.coin);
	const user = request.user;
	const key = 'codingaffairscom';
	
	var http_ipn_hash = request.headers.http_ipn_hash;
	var hash = crypto.createHmac('sha512', key)
		.update(object_id + date + coin)
		.digest('hex');
		
	if (http_ipn_hash == undefined || http_ipn_hash == '' || http_ipn_hash != hash) {
		throw new Error('Invalid content');
	}
	
	if (user != undefined && coin > 0) {
		var availCoins = user.get("coin");
		
		if (availCoins == undefined) {
			availCoins = 0;
		}
		
		availCoins += coin;
		
		user.set("coin", availCoins);
		user.save(null, { useMasterKey: true });
	}
	
	var jsonObject = {
		"objectId": object_id,
		"coin": availCoins
    };
	
	return jsonObject;
});

Parse.Cloud.define('redeem', async (request) => {
	const crypto = require('crypto');
	const object_id = request.params.ObjectId;
	const requireCoin = Number(request.params.requireCoin);
	const vip = request.params.sub_name;
	const redemption = Number(request.params.redemption);
	const user = request.user;
	const key = 'codingaffairscom';
	
	var http_ipn_hash = request.headers.http_ipn_hash;
	var hash = crypto.createHmac('sha512', key)
		.update(object_id + requireCoin + vip + redemption)
		.digest('hex');
	var todayDate;
	var calExpireDate;
	var monthVal = 0;
	
	if (http_ipn_hash == undefined || http_ipn_hash == '' || http_ipn_hash != hash) {
		throw new Error('Invalid content');
	}
	
	if (redemption == 0) {
		monthVal = 1;
	} else if (redemption == 1) {
		monthVal = 12;
	}
	
	if (user != undefined && monthVal > 0) {
		var availCoins = user.get("coin");
		var expireDate = user.get("expireDate");
		var balCoin = availCoins;
		
		if (availCoins != undefined && availCoins >= requireCoin) {
			todayDate = new Date(new Date().toUTCString());
			balCoin -= requireCoin;
			
			if (expireDate == undefined) {
				calExpireDate = new Date(todayDate.setMonth(todayDate.getMonth() + monthVal));
				user.set("expireDate", calExpireDate);
			} else {
				calExpireDate = new Date(expireDate.setMonth(expireDate.getMonth() + monthVal));
				user.set("expireDate", calExpireDate);
			}
			//request.log.info('info test');
			user.set("vip", vip);
			user.set("subscribeDate", todayDate);
			user.set("coin", balCoin)
			user.save(null, { useMasterKey: true });
		}
	}
	
	var jsonObject = {
		"objectId": object_id,
		"coin": balCoin,
		"vip": vip,
        "subscribeDate": todayDate,
		"expireDate": calExpireDate
    };
	
	return jsonObject;
});

Parse.Cloud.define('revokeSubscription', async (request) => {
	const crypto = require('crypto');
	const object_id = request.params.ObjectId;
	const date = request.params.date;
	const user = request.user;
	const key = 'codingaffairscom';
	
	var http_ipn_hash = request.headers.http_ipn_hash;
	var hash = crypto.createHmac('sha512', key)
		.update(object_id + date)
		.digest('hex');
	
	if (http_ipn_hash == undefined || http_ipn_hash == '' || http_ipn_hash != hash) {
		throw new Error('Invalid content');
	}
	
	if (user != undefined) {
		user.unset('vip');
		user.unset('expireDate');
		user.unset('subscribeDate');
		user.save(null, { useMasterKey: true });
	}
	
	var jsonObject = {
		"objectId": object_id
    };
	
	return jsonObject;
});