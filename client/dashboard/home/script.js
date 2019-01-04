let globalObject = {};
let loadmore = `<center><div class="pnvbtn" id="loadmore">Load more</div></center>`
let lid = 'none';

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

	fetch(`/api/v1/getUserHistory/${localStorage.getItem('username')}/${localStorage.getItem('apiKey')}/${lid}`, {mode: 'cors'})
	
	.then(function(response) {

		return response.json();
	})
	
	.then(function(res){
		console.log(res)
		if(!('Error' in res)){

			addBoxes(res)
		}else{
			console.log(res['Error'])
		}
	})
	
	.catch(function(error) {
		console.log('Request failed')
	})


})

document.addEventListener("click", function(e){
	if(e.target.id == 'loadmore'){
		document.getElementById("loadmore").innerText = 'loading'
		document.getElementById('loadmore').className = 'loadmored'

		fetch(`/api/v1/getUserHistory/${localStorage.getItem('username')}/${localStorage.getItem('apiKey')}/${lid}`, {mode: 'cors'})
		
		.then(function(response) {

			return response.json();
		})
		
		.then(function(res){
			
			document.getElementById("loadmore").innerText = 'Load more'
			
			document.getElementById('loadmore').className = 'pnvbtn'
			
			if(!('Error' in res)){

				addBoxes(res)
			}else{
				console.log(res['Error'])
			}
		})
		
		.catch(function(error) {
			console.log('Request failed')
		})
	}
})

function addBoxes(res){

	lid = res.lid;
	globalObject.balanceHistory = res.obj;

	if(document.getElementById("loadmore") != undefined){
			document.getElementById("loadmore").parentNode.removeChild(document.getElementById("loadmore"))
	}

	
	for (let i in globalObject.balanceHistory) {

		if(globalObject.balanceHistory[i].notification.startsWith('-')){

			document.getElementsByClassName('paymentHistoryContainer')[0].innerHTML += `<div class="paymentBox">
					<div class="paymentHeaderNegative">${globalObject.balanceHistory[i].notification}</div>
					<div class="paymentBody">${globalObject.balanceHistory[i].message}</div>
				</div>`
		}else{

			document.getElementsByClassName('paymentHistoryContainer')[0].innerHTML += `<div class="paymentBox">
					<div class="paymentHeaderPositive">${globalObject.balanceHistory[i].notification}</div>
					<div class="paymentBody">${globalObject.balanceHistory[i].message}</div>
				</div>`
		}
		
	}

	if(!(res.dipped)){
		document.body.innerHTML += loadmore
	}
}