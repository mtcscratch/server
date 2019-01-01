const express = require("express");
const bodyParser = require('body-parser');
const cheerio = require("cheerio");
const path = require("path")
const app = express()
const { exec } = require('child_process');
const fs = require("fs")
const firebase = require("firebase")
const RateLimit = require('express-rate-limit');
var request = require("request");
var crypto = require("crypto");

let authCodes = {}

function isNumeric(num){
  return !isNaN(num)
}


function getRandom(length) {

	return Math.floor(Math.pow(10, length-1) + Math.random() * 9 * Math.pow(10, length-1));

}

app.use(express.static(path.join(__dirname, "client")))

app.use("/api/" ,bodyParser.urlencoded({ extended: false }));
app.use("/api/", bodyParser.json());

var apiLimiter = new RateLimit({
  windowMs: 10*60*1000, // 15 minutes
  max: 100,
  delayMs: 0 // disabled
});
 
app.use('/api/', apiLimiter);

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', '*');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);


        next();
  });


app.listen(80, () => console.log('Running Mattcoin'))

app.get('/', (req, res) => {  
	res.redirect("/home")
});

app.get('/home', (req, res) => {
	res.redirect(path.join(__dirname, "client/home/index.html"))
});

app.get('/dashboard', (req, res) => {
	res.redirect(path.join(__dirname, "client/dashboard/index.html"))
});

function verifyIdentity(username, apiKey, callback){
	load(`accounts/${username}/scratchVerified`, function(verified){
		
		if(verified){

			load(`accounts/${username}/apiKey`, function(apiKey2){
				if(apiKey2 === apiKey){

					return callback(true)
				}else{
					return callback(false)
				}
			})
		}else{
			return callback(false)
		}
	})
}


function generateAuthCode(username){
	const code = Math.random().toString(36).substring(5);

	const codeTimeout = setTimeout(function() {

		delete authCodes[username];

	}, 900000);

	return {"code": code, "codeTimeout": codeTimeout}

}

//api requests

app.get('/api/v1/verifyLoginIntegrity/:username/:apiKey', function(req, res){

	load(`accounts/${req.params.username}/scratchVerified`, function(verified){
		if(verified){

			load(`accounts/${req.params.username}/apiKey`, function(apiKey){

				if(apiKey === req.params.apiKey){

					res.send({'response': true})
				}else{
					res.send({'Error': 'Login integrity could not be verified'})
				}
			})
		}else{
			res.send({'Error': 'Login integrity could not be verified'})

		}
	})

});

app.post('/api/v1/act/clearPaymentHistory', function(req, res){
	verifyIdentity(req.body.username, req.body.apiKey, function(bool){
		if(bool){

			save(`accounts/balanceHistories/${username}/balanceHistoryCount`, 0, function(e){
				res.send({"apiKey": object.apiKey} )

			})
		}else{

			res.send({'Error': 'Login integrity could not be verified'})
		}
	})
})

app.post('/api/v1/act/changeEmail', function(req, res){
	verifyIdentity(req.body.username, req.body.apiKey, function(bool){
		if(bool){

			save(`accounts/${req.body.username}/email`, req.body.email, function(e){

				res.send({'response': true})

			})
		}else{

			res.send({'Error': 'Login integrity could not be verified'})
		}
	})
})

app.post('/api/v1/act/pay', function(req, res){
	verifyIdentity(req.body.username, req.body.apiKey, function(bool){
		if(bool){

			load(`accounts/${req.body.username}/balance`, function(balance){

				if(!(balance >= req.body.amount)){
					res.send({'Error': 'Your balance doesnt cover this amount'})

				}else if (!(isNumeric(req.body.amount) && req.body.amount > 0)){
					res.send({'Error': 'Invalid amount'})

				}else if(!(req.body.topay.length < 21 && !req.body.topay.includes(' ') && req.body.username != req.body.topay)){
					res.send({'Error': 'This username is invalid'})

				}else if(!(req.body.message.length < 201)){
					res.send({'Error': 'This message is too long'})

				}else{
					let param = balance;
					let param2 = req.body.amount;

					if(typeof param === 'string' || param instanceof String){

						param = parseFloat(balance)
					}

					if(typeof param2 === 'string' || param2 instanceof String){

						param2 = parseFloat(req.body.amount)
					}

					let newBalance = parseFloat(param - param2).toFixed(4);
					
					save(`accounts/${req.body.username}/balance`, newBalance.toString(), function(e){
						
						load(`accounts/balanceHistories/${req.body.username}/balanceHistoryCount`, function(bhc1){

							let transactionCode = crypto.randomBytes(20).toString('hex');

							let paymentNotification = `-${parseFloat(req.body.amount).toFixed(4).toString()} MTC @${req.body.username} to @${req.body.topay}`

							save(`accounts/balanceHistories/${req.body.username}/history/${bhc1}`, {'notification':paymentNotification, 'message': req.body.message, 'transactionCode': transactionCode}, function(e){

								save(`accounts/balanceHistories/${req.body.username}/balanceHistoryCount`, bhc1 + 1, function(e){
									
									load(`accounts/balanceHistories/${req.body.topay}/balanceHistoryCount`, function(bhc2){

										load(`accounts/${req.body.topay}/balance`, function(balance2){

											param = balance2;
											param2 = req.body.amount;

											if(typeof param === 'string' || param instanceof String){

												param = parseFloat(balance2)
											}else if(balance2 != null){

												param = parseFloat('0.0')
											}
											if(typeof param2 === 'string' || param2 instanceof String){

												param2 = parseFloat(req.body.amount)
											}

											newBalance = parseFloat(param + param2).toFixed(4);

											save(`accounts/${req.body.topay}/balance`, newBalance.toString(), function(e){
												
												paymentNotification = `+${parseFloat(req.body.amount).toFixed(4).toString()} MTC @${req.body.username} to @${req.body.topay}`

												let realbhc = bhc2;
												
												if (bhc2 === null){
													realbhc = 0;
												}
												save(`accounts/balanceHistories/${req.body.topay}/history/${realbhc}`, {'notification':paymentNotification, 'message': req.body.message, 'transactionCode': transactionCode}, function(e){
														

													save(`accounts/balanceHistories/${req.body.topay}/balanceHistoryCount`, realbhc + 1, function(e){
														res.send({'response': true})

													})


												})
											})
										})

									});
								})
							})

							

						});
					})
				}
			})
		}else{

			res.send({'Error': 'Login integrity could not be verified'})
		}
	})
})


app.get('/api/v1/getUserData/:username/:apiKey', function(req, res){

	load(`accounts/${req.params.username}/scratchVerified`, function(verified){
		if(verified){

			load(`accounts/${req.params.username}/apiKey`, function(apiKey){
				if(apiKey === req.params.apiKey){

					load(`accounts/${req.params.username}/`, function(object){
						res.send(object)


					})
				}else{
					res.send({'Error': 'Login integrity could not be verified'})
				}
			})
		}
	})


})


app.get('/api/v1/getUserHistory/:username/:apiKey', function(req, res){

	load(`accounts/${req.params.username}/scratchVerified`, function(verified){
		if(verified){

			load(`accounts/${req.params.username}/apiKey`, function(apiKey){
				if(apiKey === req.params.apiKey){

					load(`accounts/balanceHistories/${req.params.username}/`, function(object){
						res.send(object)

					})
				}else{
					res.send({'Error': 'Login integrity could not be verified'})
				}
			})
		}
	})
})


app.get('/api/v1/signupGetCode/:username', function(req, res){
	
	const username = req.params.username;

	if(username in authCodes){
		clearTimeout(authCodes[username].codeTimeout);

	}

	load(`accounts/${username}/scratchVerified`, function(verified){
	
		if(verified){
			res.send({"Error": "Account already created"} )

		}else{

			authCodes[username] = generateAuthCode();

			res.send({'authCode': authCodes[username].code})
		}
	})


});




app.get('/api/v1/loginGetCode/:username', function(req, res){

	load(`accounts/${req.params.username}/scratchVerified`, function(verified){
		if(verified){
			const username = req.params.username;

			if(username in authCodes){
				clearTimeout(authCodes[username].codeTimeout);

			}

			authCodes[username] = generateAuthCode();

			res.send({'authCode': authCodes[username].code})
		}else{
			res.send({'Error': `User account isn't registered.`})

		}
	})	
});



app.post('/api/v1/login/', function(req, res){
	const username = req.body.username;

	load(`accounts/${req.body.username}/scratchVerified`, function(verified){
		if(verified){
			getComments('project', '275981545', function(e){
				if(username in e){

					if (e[username][0] == authCodes[username].code){

						load(`accounts/${username}/apiKey`, function(apiKey){

							res.send({'username': username, 'apiKey': apiKey})
						})

					}else{

						if(authCodes[username] != undefined){

							clearTimeout(authCodes[username].codeTimeout);
						}

						authCodes[username] = generateAuthCode();

						res.send({'Error': 'codeIncorrect', 'newCode': authCodes[username].code})

					}
				}else{

					if(authCodes[username] != undefined){

						clearTimeout(authCodes[username].codeTimeout);
					}

					authCodes[username] = generateAuthCode();


					res.send({'Error': 'commentNotFound', 'newCode': authCodes[username].code})

				}

			})
		}else{
			res.send({'Error': 'Login integrity could not be verified'})

		}
	})

})


app.post('/api/v1/signup/', function(req, res){
	const username = req.body.username;
	const email = req.body.email;


	//balance history - transaction name (+5 MTC @user to @user): message
	let object = {"iconLink":"", "email": email, "apiKey":  crypto.randomBytes(50).toString('hex'), "balance": '0.0', "scratchVerified": true, "emailVerified": false, "strikes": 0, "chargeBacks": 0, "banned": false}
	
	getComments('project', '275981545', function(e){
		if(username in e){

			if (authCodes[username].code == e[username][0]){
				getPictureUrl(username, function(imglink){

					object.iconLink = imglink;
					load(`accounts/${username}/scratchVerified`, function(verified){
						if (verified){

							res.send({"Error": "Account already created"} )

						}else{
							
							load(`accounts/${username}/balance`, function(balance){

								if(balance === null || balance === undefined){
									
									save(`accounts/${username}/`, object, function(){
										save(`accounts/balanceHistories/${username}/balanceHistoryCount`, 0, function(e){
											res.send({"apiKey": object.apiKey} )

										})

									})
								}else{
									const oldBalance = balance;

									load(`accounts/balanceHistories/${username}`, function(balanceHistory){

										const oldBalanceHistory = balanceHistory;
										
										object.balanceHistory = oldBalanceHistory;
										object.balance = oldBalance;


										save(`accounts/${username}/`, object, function(){
											res.send({"apiKey":object.apiKey} )

										})							
									});
								}
							});
						}
					});		
				})
	
			}else{

				if(authCodes[username] != undefined){

					clearTimeout(authCodes[username].codeTimeout);

				}
				
				authCodes[username] = generateAuthCode();

				res.send({'Error': 'codeIncorrect', 'newCode': authCodes[username].code})

			}
		}else{

			if(authCodes[username] != undefined){
				clearTimeout(authCodes[username].codeTimeout);

			}
			
			authCodes[username] = generateAuthCode();

			res.send({'Error': 'commentNotFound', 'newCode': authCodes[username].code})
		}
	})
});

const config = {
    apiKey: `AIzaSyBtmtqGLEStfTi2DDlnCKBQDntkMRCwURY`, //process.env.FIREBASE_APIKEY
    databaseURL: "https://mattcoin-b5948.firebaseio.com/"//process.env.FIREBASE_DATABASEURL
};


firebase.initializeApp(config);

function save(path, payload, callback){
		firebase.database().ref(path).set(payload, function(e){
			if (e){
				return callback(false);
			}else{
				return callback(true);
			}
		});

}

function load(path, callback){
	firebase.database().ref(path).once('value').then(function(snapshot) {
	return callback(snapshot.val())
	  // ...
	});
}

firebase.auth().signInWithEmailAndPassword(process.env.firebasemail, process.env.firebasepassword)
.then(function(user){


});



function getComments(type, id, callback){
	let object = {};
	request(
	    { uri: "https://scratch.mit.edu/site-api/comments/project/275981545/" },
	    
		    function(error, response, body) {
		       
		        const $ = cheerio.load(body)

			    $('.name').each(function (i, elem) {
			    	if (!($(this).first().text().split(`\n`).join(``).split(` `).join(``) in object)){
			    		object[$(this).first().text().split(`\n`).join(``).split(` `).join(``)] = []
			    	}
			    	object[$(this).first().text().split(`\n`).join(``).split(` `).join(``)].push( $(this).next().text().split(`\n`).join(``).split(` `).join(``) )
			    })

			    return callback(object)
			}
		);
}

function getPictureUrl(username, callback){
let object = {};
	request(
	    { uri: `https://api.scratch.mit.edu/users/${username}/` },
	    
		    function(error, response, body) {
		        let data = JSON.parse(body)

		        return callback(`https://cdn2.scratch.mit.edu/get_image/user/${data.id}_256x256.png`);
			}
		);
}
