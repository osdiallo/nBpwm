/// <reference types="aws-sdk" />
var myCredentials = new AWS.CognitoIdentityCredentials({IdentityPoolId:"us-east-1:73d1f2dd-9a9a-4438-a351-16813034c36c"});
var myConfig = new AWS.Config({
  credentials: myCredentials, region: 'us-east-1'
});
AWS.config.getCredentials(function(err) {
  if (err) console.log(err.stack);
  // credentials not loaded
  else {
    console.log("Access key:", AWS.config.credentials.accessKeyId);
    console.log("Secret access key:", AWS.config.credentials.secretAccessKey);
  }
});

var myid = chrome.runtime.id;
console.log(myid);

document.addEventListener("DOMContentLoaded", function(event) {
	var db = new PouchDB('http://localhost:5984/user_table');
	
	var url;
	var key;
	var tab;
	chrome.tabs.query({'active': true, 'currentWindow': true}, 
		function (tabs) {
			tab = tabs[0];
			if(tab.url) {
				url = tab.url;
				console.log(url);
				key = new URL(url).hostname;
				key = key.substring(key.indexOf(".") + 1);
				console.log(key);
			} else {
				console.log("I'm lazy!");
			}
			
			db.find({
				selector: {_id: {$eq: key}},
				fields: ["username", "userpass"]
			}).then(function(result){
				var num_queries = result.docs.length;

				if(num_queries == 0){
					document.getElementById("username").value = '';
					document.getElementById("password").value = '';
					document.getElementById("username").placeholder = "Username...";
					document.getElementById("password").placeholder = "Password...";
				} else {
					username = result.docs[0].username;
					userpass = decrypt(result.docs[0].userpass, sk.toString());	
					
					document.getElementById("username").value = '';
					document.getElementById("password").value = '';
					document.getElementById("username").placeholder = username;
					document.getElementById("password").placeholder = userpass;
					document.getElementById("checkPage").innerText = "Update Information";
				}
			}).catch(function(err){
				console.log(err);
			});
		}
	);
	var checkBtn = document.getElementById('checkPage');
	checkBtn.addEventListener("click", updateTable, false);
});

var sk = window.screen.height * window.screen.width;
var db = new PouchDB('http://localhost:5984/user_table');
db.createIndex({
  index: {fields: ['site']}
});

function encrypt(message = '', key = ''){
	var tmp = CryptoJS.AES.encrypt(message, key);
	return tmp.toString();
}

function decrypt(message = '', key = ''){
    var code = CryptoJS.AES.decrypt(message, key);
    var decryptedMessage = code.toString(CryptoJS.enc.Utf8);

    return decryptedMessage;
};

function updateTable(){
	var db = new PouchDB('http://localhost:5984/user_table');
	var username = document.getElementById("username");
	var userpass = document.getElementById("password");
	var msgLabel = document.getElementById("labelfield");

	if(username.value.length == 0){
		msgLabel.style.opacity = 1
		msgLabel.style.color = "#e41c11";
		msgLabel.innerHTML = "Username field cannot be empty!";
		
		var fadeEffect = setInterval(function() {
			if(!msgLabel.style.opacity){
				msgLabel.style.opacity = 1;
			}
			if(msgLabel.style.opacity > 0){
				msgLabel.style.opacity -= 0.07;
			} else {
				clearInterval(fadeEffect);
			}
		}, 500);
		return false;
	}
	
	if(userpass.value.length == 0){
		msgLabel.style.opacity = 1
		msgLabel.style.color = "#e41c11";
		msgLabel.innerHTML = "Password field cannot be empty!";
		
		var fadeEffect = setInterval(function() {
			if(!msgLabel.style.opacity){
				msgLabel.style.opacity = 1;
			}
			if(msgLabel.style.opacity > 0){
				msgLabel.style.opacity -= 0.07;
			} else {
				clearInterval(fadeEffect);
			}
		}, 500);
		return false;
	}
	
	var url;
	var key;
	var tab;
	chrome.tabs.query({'active': true, 'currentWindow': true}, 
		function (tabs) {
			tab = tabs[0];
			if(tab.url) {
				url = tab.url;
				console.log(url);
				key = new URL(url).hostname;
				key = key.substring(key.indexOf(".") + 1);
				console.log(key);
			} else {
				console.log("I'm lazy!");
			}
			
			db.find({
				selector: {_id: {$eq: key}},
				fields: ['_id'],
				sort: ["_id"]
			}).then(function(result){
				var num_queries = result.docs.length;

				if(num_queries == 0){
					msgLabel.style.opacity = 1
					var encryptedPass = encrypt(userpass.value, sk.toString());
					db.put({
						_id: key, // website name
						username: username.value,
						userpass: encryptedPass
					}).catch(function (err) {
						console.log(err);
					});
					
					msgLabel.style.color = "#31b800";
					msgLabel.innerHTML = "Username and password saved!"; // green
					
					var fadeEffect = setInterval(function() {
						
						if(!msgLabel.style.opacity){
							msgLabel.style.opacity = 1;
						}
						if(msgLabel.style.opacity > 0){
							msgLabel.style.opacity -= 0.07;
						} else {
							clearInterval(fadeEffect);
						}
					}, 500);
					
					updateFields();
				} else {
					msgLabel.style.opacity = 1
					msgLabel.style.color = "#e41c11"; //reddish
					msgLabel.innerHTML = "Username and Password already saved.";
					window.alert("Are you sure?");
					
					var fadeEffect = setInterval(function() {
						if(!msgLabel.style.opacity){
							msgLabel.style.opacity = 1;
						}
						if(msgLabel.style.opacity > 0){
							msgLabel.style.opacity -= 0.07;
						} else {
							clearInterval(fadeEffect);
						}
					}, 500);
					console.log("Found duplicate bro");
					updateFields();
				}
			}).catch(function(err){
				console.log(err);
			});
		}
	);
	
	return true;
};

// display user name and password
function updateFields(){
	var db = new PouchDB('http://localhost:5984/user_table');
	
	var url;
	var key;
	var tab;
	chrome.tabs.query({'active': true, 'currentWindow': true}, 
		function (tabs) {
			tab = tabs[0];
			if(tab.url) {
				url = tab.url;
				console.log(url);
				key = new URL(url).hostname;
				key = key.substring(key.indexOf(".") + 1);
				console.log(key);
			} else {
				console.log("I'm lazy!");
			}
			
			db.find({
				selector: {_id: {$eq: key}},
				fields: ["username", "userpass"]
			}).then(function(result){
				var num_queries = result.docs.length;

				if(num_queries == 0){
					console.log("Found nothin' here bro");
				} else {
					username = result.docs[0].username;
					userpass = decrypt(result.docs[0].userpass, sk.toString());	
					
					document.getElementById("username").value = '';
					document.getElementById("password").value = '';
					document.getElementById("username").placeholder = username;
					document.getElementById("password").placeholder = userpass;
					document.getElementById("checkPage").innerText = "Update Information";
				}
			}).catch(function(err){
				console.log(err);
			});
		}
	);
	
}