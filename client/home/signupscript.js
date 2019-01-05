document.getElementsByClassName("snvbtn")[0].addEventListener("click", function(){
	username = document.getElementById("scratchUsername").value

	email = document.getElementById("email").value

	emailRepetition = document.getElementById("emailRepetition").value

	if (email.length <= 200){

		document.getElementById("error3").innerText = ""

		if (emailRepetition.length <= 200){

			document.getElementById("error2").innerText = ""


			fetch(`/api/v1/signupGetCode/${username}/`, {mode: 'cors'})
 			
 			.then(function(response) {

 				return response.json();
 			})
 			
 			.then(function(res){
 				if(!('Error' in res)){

 					code = res.authCode;
 					localStorage.setItem("recoveryQuestion", email)
 					localStorage.setItem("recoveryAnswer", emailRepetition)

 					document.location.href = `/signup/?username=${username}&code=${code}`

 				}else{
 					document.getElementById("error1").innerText = res['Error']
 				}
 			})
 			
 			.catch(function(error) {
 				console.log('Request failed')
 			})
		
		}else{
			document.getElementById("error2").innerText = "Recovery answer too long"
		}
	}else{
		document.getElementById("error3").innerText = "Recovery question too long"
	}

})

