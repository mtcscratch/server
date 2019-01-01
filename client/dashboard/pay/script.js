let globalObject = {};



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
	document.getElementById("maxAmount").innerText = globalObject.balance;
});



document.getElementById("paybtn").addEventListener("click", function(e){
	if (document.getElementById('message').value.length < 201){

		document.getElementById('error3').value = ''

		if (document.getElementById('scratchUsername').value.length < 21 && !document.getElementById('scratchUsername').value.includes(' ')){

				fetch(`/api/v1/act/pay`, {

				 	method: "POST",

				 	headers: {"Content-Type": "application/json"} ,

				 	body: JSON.stringify(
				 		{
				 			"username": localStorage.getItem('username'),
				 	 		"apiKey": localStorage.getItem('apiKey'),
				 	 		"topay": document.getElementById("scratchUsername").value,
				 	 		"amount": document.getElementById("amount").value,
				 	 		"message":  document.getElementById("message").value
				 	 	}
				 	 )

				}).then(function(response) {
					return response.json()

				}).then(function(res){
					console.log(res)

					if(!('Error' in res)){

							if(res['response']){
								document.getElementById('error1').innerText = ''
								document.getElementById('error2').innerText = ''
								document.getElementById('error3').innerText = ''
								document.getElementById('error4').innerText = 'Payment completed successfully.'

							}
					}else{



						document.getElementById('error4').innerText = ''

						if(res['Error'] == 'This username is invalid'){
							document.getElementById('error1').innerText = res['Error']

						}else if(res['Error'] == 'This message is too long'){
								document.getElementById('error3').innerText = res['Error']

						}else if(res['Error'] == 'Your balance doesnt cover this amount'){
							document.getElementById('error2').innerText = res['Error']

						}else if (res['Error'] == 'Invalid amount'){

							document.getElementById('error2').innerText = res['Error']

						}

						}


				}).catch(function(e){

				})
		}else{
			document.getElementById('error4').innerText = ''

			document.getElementById('error1').value = 'This username is invalid'
		}
	}else{

		document.getElementById('error4').innerText = ''

		document.getElementById('error3').value = 'This message is too long'
	}


})

