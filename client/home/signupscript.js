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

 					document.location.href = `/signup/?username=${username}&email=${email}&code=${code}`

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

