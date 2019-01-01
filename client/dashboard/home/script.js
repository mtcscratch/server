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
	document.getElementsByClassName('bal')[0].innerText = globalObject.balance;

	fetch(`/api/v1/getUserHistory/${localStorage.getItem('username')}/${localStorage.getItem('apiKey')}`, {mode: 'cors'})
	
	.then(function(response) {

		return response.json();
	})
	
	.then(function(res){
		console.log(res)
		if(!('Error' in res)){

			globalObject.balanceHistory = res.history;
				for (const key of Object.keys(globalObject.balanceHistory)) {
					if(globalObject.balanceHistory[key].notification.startsWith('-')){

						document.getElementsByClassName('paymentHistoryContainer')[0].innerHTML = `<div class="paymentBox">
								<div class="paymentHeaderNegative">${globalObject.balanceHistory[key].notification}</div>
								<div class="paymentBody">${globalObject.balanceHistory[key].message}</div>
							</div>` + document.getElementsByClassName('paymentHistoryContainer')[0].innerHTML
					}else{

						document.getElementsByClassName('paymentHistoryContainer')[0].innerHTML = `<div class="paymentBox">
								<div class="paymentHeaderPositive">${globalObject.balanceHistory[key].notification}</div>
								<div class="paymentBody">${globalObject.balanceHistory[key].message}</div>
							</div>` + document.getElementsByClassName('paymentHistoryContainer')[0].innerHTML
					}
					
				}
		}else{
			console.log(res['Error'])
		}
	})
	
	.catch(function(error) {
		console.log('Request failed')
	})


})
