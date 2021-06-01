var user = { id:null, name:null, token:null };
var $alertSuccess = $('#alert-success');
var $alertError = $('#alert-error');
var $formLogin = $('#form-login');
var $inputLogin = $formLogin.find('[name=login]');
var $inputLoginPass = $formLogin.find('[name=password]');
var $formSignin = $('#form-signin');
var $inputSignin = $formSignin.find('[name=login]');
var $inputSigninPass = $formSignin.find('[name=password]');
var $messagesContainer = $('#messages-container');
var $list = $messagesContainer.find('#list');
var $formAdd = $('#form-add');
var $inputMessage = $formAdd.find('#messageText');
var $usersConnected = $('#usersConnected');
var $logoutButton = $('#logout');
var getMessagesTimeout;
var getUsersTimeout;

$(document).ready(appInit);

function appInit() {
	'use strict';
	
	$formLogin.on('submit', onLogin);
	$formSignin.on('submit', onSignin);
	$formAdd.on('submit', onAdd);
	$logoutButton.on('click', onLogout);
}

function onLogin(event) {
	'use strict';
	event.preventDefault(); 
	
	var login = $inputLogin.val();
	var password = $inputLoginPass.val();
	
	var request = $.ajax({
		method : 'GET',
		url : 'https://greenvelvet.alwaysdata.net/kwick/api/login/'+ login +'/'+password,
		dataType : 'jsonp'
	});
											 
	request.done(function(response) {
		if (response.result.status !== "failure") {
			$alertSuccess.show().text('Successful connection!'); 
			setTimeout(hideAlerts, 3000); // pencere 3 saniye sonra gizlenir
			user.token = response.result.token;
			user.id = response.result.id;
			user.name = login;
			initChat();
		} else {
			$alertError.show().text(response.result.message); // socket alan mesaj gösterimi
			setTimeout(hideAlerts, 3000);
		}
	});
}

function onSignin(event) {
	'use strict';
	
	event.preventDefault(); // Sayfanın tarayıcı tarafından yeniden yüklenmesini engeller
	
	var login = $inputSignin.val();
	var password = $inputSigninPass.val();
	
	var request = $.ajax({
		method : 'GET',
		url : 'https://greenvelvet.alwaysdata.net/kwick/api/signup/'+ login +'/'+ password,
		dataType : 'jsonp'
	});
											 
	request.done(function(response) {
		if (response.result.status !== "failure") {
			$alertSuccess.show().text('Successful registration!');
			setTimeout(hideAlerts, 3000);
			user.token = response.result.token;
			user.id = response.result.id;
			user.name = login;
			initChat();} 
		else {
			$alertError.show().text(response.result.message);
			setTimeout(hideAlerts, 3000); }});}
function onAdd(event) {
	'use strict';
	event.preventDefault(); 
	var message = $inputMessage.val();
	var request = $.ajax({
		method : 'GET',
		url : 'https://greenvelvet.alwaysdata.net/kwick/api/say/'+ user.token +'/'+ user.id +'/'+ window.encodeURIComponent(message),
		dataType : 'jsonp'
	});									 
	request.done(function(response) {
		if (response.result.status !== "failure") {
			$formAdd[0].reset();
			clearTimeout(getMessagesTimeout);
			getMessages(); 
		}
	});
}
function onLogout(event) {
	'use strict';
	
	var request = $.ajax({
		method : 'GET',
		url : 'https://greenvelvet.alwaysdata.net/kwick/api/logout/'+ user.token +'/'+ user.id,
		dataType : 'jsonp'
	});						 
	request.done(function(response) {
		if (response.result.status !== "failure") {
			$alertSuccess.show().text('Successful logout!');
			setTimeout(hideAlerts, 3000);
			clearTimeout(getMessagesTimeout);
			clearTimeout(getUsersTimeout);
			$formLogin.show();$formSignin.show();$messagesContainer.hide(); $logoutButton.hide();
		} 
		else {
			$alertError.show().text(response.result.message);
			setTimeout(hideAlerts, 3000);
		}
	});
}
function hideAlerts(fading) {
	'use strict';
	fading = !!fading;
	if (!fading) {
		$alertSuccess.empty().hide();$alertError.empty().hide();
		return;
	}
	$alertSuccess.empty().fadeOut();$alertError.empty().fadeOut();
}
function initChat() {
	$formLogin.hide()[0].reset();$formSignin.hide()[0].reset();
	$messagesContainer.show(); $logoutButton.show(); 
	clearTimeout(getMessagesTimeout);
	getMessages();
	clearTimeout(getUsersTimeout);
	getUsers();
}
function getMessages() {
	'use strict';
	var request = $.ajax({
		method : 'GET',
		url : 'https://greenvelvet.alwaysdata.net/kwick/api/talk/list/'+ user.token +'/0',
		dataType : 'jsonp'});
	request.done(function(response) {
		var $fragment = $(document.createDocumentFragment());
		
		var messages = response.result.talk.slice(-10).reverse(); // Sunucu tarafından döndürülen ileti gösteriyor
		var theDate = new Date(); 
		for (var i = 0; i < messages.length; i++) {
			theDate.setTime(messages[i].timestamp * 1000);
			$fragment.append(
				'<p> <i>('+ theDate.toLocaleString() +')</i> <b>'+ messages[i].user_name +' &gt; </b> '+ messages[i].content +'</p>'
			);
		}
		$list.empty().append($fragment);		
	});
	
	request.fail(function() {$alertError.show().text('Unable to retrieve new messages');setTimeout(hideAlerts, 3000);});
	request.always(function() {getMessagesTimeout = setTimeout(getMessages, 3000);});}
function getUsers() {
	'use strict';
	var request = $.ajax({
		method : 'GET',
		url : 'https://greenvelvet.alwaysdata.net/kwick/api/user/logged/'+ user.token,
		dataType : 'jsonp'
	});
	request.done(function(response) {
		var $fragment = $(document.createDocumentFragment());
		var users = response.result.user; 
		for (var i = 0; i < users.length; i++) {
			$fragment.append(
				'<span class="label '+ (users[i] === user.name ? 'label-info' : 'label-default') +'">'+ users[i] +'</span> ');}
		$usersConnected.empty().append($fragment);		
		clearTimeout(getUsersTimeout);
		getUsersTimeout = setTimeout(getUsers, 3000);
	});
}