let blob = {};
function verifyIntegrity(){
	console.log(localStorage.getItem('username'))
	if(!(localStorage.getItem('username') === null)){
		
		if(!(localStorage.getItem('apiKey') === null)){

			fetch(`/api/v1/verifyLoginIntegrity/${localStorage.getItem('username')}/${localStorage.getItem('apiKey')}`, {mode: 'cors'})
 			
 			.then(function(response) {

 				return response.json();
 			})
 			
 			.then(function(res){
 				if(res.response){
 					
 					document.location.href = "/dashboard/home/"
 				}
 			})
 			
 			.catch(function(error) {
 				console.log('Request failed')
 			})
		}
	}
}
verifyIntegrity()
