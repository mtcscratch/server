//I too hate repetitive jquery. However i wrote this when mattcoin was originally supposed to launch and im too lazy to make it non-jquery dependent. I stil refactored some of it but theres no fixing this
//Jquery is also good for animations so

const htmlPresets = {
	"signupNav": `<div class="signupNav">
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
			</div>`,
	"mobileNav": `<div class='mobileNav'>
				<div class='mnvbtn' id='homem'>home</div>
				<div class='mnvbtn' id='tosm' onclick="document.location.href = '/tos'">tos</div>
				<div class='mnvbtn' id='requirementsm' onclick="document.location.href = '/requirements'">requirements</div>
				<div class='mnvbtn' id='newsm' onclick="document.location.href = 'https://mtcscratch.wordpress.com/'">news</div>
				<div class='mnvbtn' id='loginm' onclick="document.location.href = '/login'">login</div>
				<div class='mnvbtn' id='signupm' onclick="document.location.href = '/signup'">signup</div>
				</div>`,
	"innerStockHeader": `<div class="nvbtn" id="home">home</div>
				<div class="nvbtn" id="tos" onclick="document.location.href = '/tos'">tos</div>
				<div class="nvbtn" id="requirements" onclick="document.location.href = '/requirements'">requirements</div>
				<div class="nvbtn" id="news" onclick="document.location.href = 'https://mtcscratch.wordpress.com/'">news</div>
				<div class="nvbtn" id="login" onclick="document.location.href = '/login'">login</div>
				<div class="nvbtn" id="signup" onclick="document.location.href = '/signup'">signup</div>`,
	"imgStockHeader": `<img class='mobileStack' src='assets/mobileStack.svg'></img>`,
	"mobileStack": `<img class='mobileStack' src='assets/mobileStack.svg'></img>`
}

function checkOne(){
	if (window.innerWidth > 1086){

		if($(".signupNav").length === 0){
			$("body").append(htmlPresets.signupNav)

		}

		$(".footer").attr("id", "normalFooter");

		$(".mainFooter").attr("id", "nmf")


		return true		
	}else{

		if($(".signupNav").length != 0){

			$(".signupNav")[0].remove()

		}
		$(".footer").attr("id", "mobileFooter")
		
		$(".mainFooter").attr("id", "mmf")

		return false

	}
}

function checkTwo(){

	if (!(window.innerWidth > 618)){
		
		$(".mainFooter").attr("id", "mmmf")
		
		$(".subFooter").attr("id", "mmsf")
		
		$(".footer").attr("id", "mmFooter")

		return true
	}else{

		return false
	}
}

function resizeFunc(){

	if (window.innerWidth > 845){
			if ($(".nvbtn").length == 0){

				$(".mobileStack").remove()

				$(".mobileNav").remove()

				$(".stockHeader").append(htmlPresets.innerStockHeader)
			}
		}else{

			if ($(".nvbtn").length != 0){

				$(".nvbtn").remove()

				$(".stockHeader").append(htmlPresets.imgStockHeader)
			}
		}
		
		checkOne()

		if (!(checkTwo())){

			$(".subFooter").attr("id", "nsf")
			checkOne()

		}
}


$(function(){
	let mobileReady = false;
	
	if (!(window.innerWidth > 845)){

		$(".stockHeader").append(htmlPresets.mobileStack)
	}

	resizeFunc()
	
	$(window).resize(function(){
		
		resizeFunc()

	})

	$("body").on("click", ".mobileStack", function() {

		if ($(".mobileNav").length == 0){

			$(".stockHeader").append(htmlPresets.mobileNav)

			$(".mobileNav").fadeIn("fast", function() {
				
				mobileReady = true
			});
		}
	})

	$("body").on("click", function(e){

		if ($(".mobileNav").length != 0 && mobileReady && ($(e.target).parent().attr("class") != "mobileNav" && $(e.target).attr("class") != "mobileNav")){
			
			$(".mobileNav").fadeOut("fast", function(){

				$(".mobileNav").remove()
				mobileReady = false
			});
		}
	})
	
});

let username = null
let email = null
let emailRepetition = null
let code = null


function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}


document.addEventListener('click', function(e){
	console.log(e.target.className)
	if(e.target && e.target.className == 'snvbtn'){

		console.log('alright!')
		let username = document.getElementById("scratchUsername").value

		let email = document.getElementById("email").value

		let emailRepetition = document.getElementById("emailRepetition").value

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
	}
})
