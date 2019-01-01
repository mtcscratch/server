let blob = {};
function verifyIntegrity(){
	console.log(localStorage.getItem('username'))
	if(localStorage.getItem('username') === null){
		document.location.href = '/home'
	}else if(localStorage.getItem('apiKey') === null){
			document.location.href = '/home'
	}else{
		fetch(`/api/v1/verifyLoginIntegrity/${localStorage.getItem('username')}/${localStorage.getItem('apiKey')}`, {mode: 'cors'})
			
			.then(function(response) {

				return response.json();
			})
			
			.then(function(res){
				if(res.response){

					blob.username = localStorage.getItem('username');
					blob.apiKey = localStorage.getItem('apiKey');
					
					document.getElementsByClassName('nametest')[0].innerText = blob.username;
				}else{
					console.log(res['Error'])
					document.location.href = '/home'

				}
			})
			
			.catch(function(error) {
				console.log('Request failed')
			})
	}
}
verifyIntegrity()
