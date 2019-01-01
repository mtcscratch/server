let globalObject = {};


function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}


function makeRequest(callback){
	fetch(`/api/v1/getUserData/${localStorage.getItem('username')}/${localStorage.getItem('apiKey')}`, {mode: 'cors'})
	
	.then(function(response) {

		return response.json();
	})
	
	.then(function(res){
		console.log(res)
		if(res){
			return callback(res)
		}else{
			console.log(res['Error'])
		}
	})
	
	.catch(function(error) {
		console.log('Request failed')
	})
}


makeRequest(function(e){

	//download data to variable
	globalObject = e;

	document.getElementsByClassName('userIcon')[0].src = globalObject.iconLink;
	document.getElementsByClassName('username')[0].innerText = localStorage.getItem('username')
	document.getElementById("email").value = globalObject.email;


})

document.getElementById("logoutBtn").addEventListener("click", function(e){
	localStorage.removeItem('username')
	localStorage.removeItem('apiKey')

	document.location.href = '/home/'
})

document.getElementById("clearPaymentHistoryBtn").addEventListener("click", function(e){
	let dialogResponse = confirm(`The following action will permanently delete your entire payment history. We cannot recover this. Continue?`)

	if(dialogResponse){

		fetch(`/api/v1/act/clearPaymentHistory`, {

		 	method: "POST",

		 	headers: {"Content-Type": "application/json"} ,

		 	body: JSON.stringify({"username": localStorage.getItem('username'), "apiKey": localStorage.getItem('apiKey')})

		}).then(function(response) {
			return response.json()

		}).then(function(res){

			if(!('Error' in res)){

					if(res['response']){
						alert('Action completed successfully.')
					}
			}else{

			}


		}).catch(function(e){

		})
	}

})

document.getElementById("changeBtn").addEventListener("click", function(e){
	if(validateEmail(document.getElementById("email").value)){

		fetch(`/api/v1/act/changeEmail`, {

		 	method: "POST",

		 	headers: {"Content-Type": "application/json"} ,

		 	body: JSON.stringify({"username": localStorage.getItem('username'), "apiKey": localStorage.getItem('apiKey'), "email": document.getElementById("email").value})

		}).then(function(response) {
			return response.json()

		}).then(function(res){

			if(!('Error' in res)){

					if(res['response']){
						document.getElementById('error1').innerText = ''

						alert('Action completed successfully.')
					}
			}else{

			}


		}).catch(function(e){

		})
	}else{

		document.getElementById('error1').innerText = 'Invalid email'
	}
})
