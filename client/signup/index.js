let username = null
let email = null
let emailRepetition = null
let code = null

htmlPresets = {"signupNav": `<div class="signupNav">
				<center>
				<img class="snvlogo" src="assets/mtc-logo-sized.svg"></img>
				</center>
				<div class="snvph"><div id="suph">Scratch</div>&nbsp;username:</div>
				<input type="text" class="snvin" id="scratchUsername">
				<div class="snve" id="error1"></div>
				<div class="snvph">Email:</div>
				<input type="text" class="snvin" id="email">
				<div class="snve" id="error2"></div>

				<div class="snvph">Retype email:</div>
				<input type="text" class="snvin" id="emailRepetition">
				<div class="snve" id="error3"></div>
				<div class="snvbtn">Sign up for Mattcoin</div>
				<div class="disclaimer">By clicking "Signup for Mattcoin" you agree to our
				<a href="/tos">terms of service</a> and are aware of the mattcoin
				account requirements (<a href="/requirements">see here</a>).</div>
			</div>`
			}

var url_string = window.location.href
var url = new URL(url_string);


code = url.searchParams.get("code");
username = url.searchParams.get("username");
email = url.searchParams.get("email");


function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

if (username != null){

	document.getElementsByClassName('signupNav')[0].parentNode.removeChild(document.getElementsByClassName('signupNav')[0])
	document.body.innerHTML += `<div class="codeNav">
							<div class="cnvcode">${code}</div>
							<div class="cnvph">Type the code above in <a href="https://scratch.mit.edu/projects/275981545/" target="_blank">this scratch project</a> to
							verify that ${username} is your scratch account. Autochecking and reseting every 30 seconds.</div>
							</div>`;

	setInterval(function(){

		fetch(`/api/v1/signup/`, {

	 	method: "POST",

	 	headers: {"Content-Type": "application/json"} ,

	 	body: JSON.stringify({"username": username, "email": email})

	}).then(function(response) {
		return response.json()

	}).then(function(res){

		if(!('Error' in res)){

			localStorage.setItem('username', username)

			localStorage.setItem('apiKey', res['apiKey'])

			document.location.href = "/dashboard/home/"
		}else{
			code = res.newCode

			document.body.innerHTML += `<div class="codeNav">
							<div class="cnvcode">${code}</div>
							<div class="cnvph">Type the code above in <a href="https://scratch.mit.edu/projects/275981545/" target="_blank">this scratch project</a> to
							verify that ${username} is your scratch account. Autochecking and reseting every 30 seconds.</div>
							</div>`;
		}


	}).catch(function(e){

	})

	}, 1000*10*3)
}else{

	document.getElementsByClassName("snvbtn")[0].addEventListener("click", function(){
		username = document.getElementById("scratchUsername").value

		email = document.getElementById("email").value

		emailRepetition = document.getElementById("emailRepetition").value

		if (validateEmail(email)){

			document.getElementById("error3").innerText = ""

			if (email == emailRepetition){

				document.getElementById("error2").innerText = ""


				fetch(`/api/v1/signupGetCode/${username}/`, {mode: 'cors'})
	 			
	 			.then(function(response) {

	 				return response.json();
	 			})
	 			
	 			.then(function(res){
	 				if(!('Error' in res)){

	 					code = res.authCode;

	 					document.getElementsByClassName('signupNav')[0].parentNode.removeChild(document.getElementsByClassName('signupNav')[0])
	 					document.body.innerHTML += `<div class="codeNav">
													<div class="cnvcode">${code}</div>
													<div class="cnvph">Type the code above in <a href="https://scratch.mit.edu/projects/275981545/" target="_blank">this scratch project</a> to
													verify that ${username} is your scratch account. Autochecking and reseting every 30 seconds.</div>
													</div>`;

	 					setInterval(function(){

	 						fetch(`/api/v1/signup/`, {

							 	method: "POST",

							 	headers: {"Content-Type": "application/json"} ,

							 	body: JSON.stringify({"username": username, "email": email})

							}).then(function(response) {
								return response.json()

							}).then(function(res){

								if(!('Error' in res)){

									localStorage.setItem('username', username)

									localStorage.setItem('apiKey', res['apiKey'])

									document.location.href = "/dashboard/home/"
								}else{
									code = res.newCode

									document.body.innerHTML += `<div class="codeNav">
													<div class="cnvcode">${code}</div>
													<div class="cnvph">Type the code above in <a href="https://scratch.mit.edu/projects/275981545/" target="_blank">this scratch project</a> to
													verify that ${username} is your scratch account. Autochecking and reseting every 30 seconds.</div>
													</div>`;
								}


							}).catch(function(e){

							})

	 					}, 1000*10*3)

	 				}else{
	 					document.getElementById("error1").innerText = res['Error']
	 				}
	 			})
	 			
	 			.catch(function(error) {
	 				console.log('Request failed')
	 			})
			
			}else{
				document.getElementById("error2").innerText = "Emails do not match"
			}
		}else{
			document.getElementById("error3").innerText = "Invalid Email"
		}

	})


}
