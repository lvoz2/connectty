"use strict";

window.addEventListener("load", (e) => {
	const loginE = document.querySelector("#login");
	loginE.addEventListener("click", (e) => {
		runCaptcha(e, submitLogin)
	});
});

function submitLogin(e) {
	console.log("Human")
	const username = document.querySelector("#username").value;
	const password = document.querySelector("#password").value;
	const credentials = {"username": username, "password": password};
	fetch("/auth", {
		credentials: "include",
		headers: {
			"Accept": "application/json",
			"Content-Type": "application/json"
		},
		method: "post",
		body: JSON.stringify(credentials)
	}).then((res) => {
		return res.json();
	}).then((json) => {
		if (json.status == "Success") {
			//window.location = "https://lvoz2.duckdns.org";
		}
	});
}

function runCaptcha(e, f, data) {
	e.preventDefault();
	grecaptcha.ready(function() {
		grecaptcha.execute("6LdHimkqAAAAAOXLRndbYvcmN3dzYjvLz7-5QBAD", {action: "submit"}).then((token) => {
			// Add your logic to submit to your backend server here.
			let data = {"token": token};
			fetch('/captcha', {
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				method: "post",
				body: JSON.stringify(data)
			}).then(response => response.json()).then((json) => {
				if (json.google_response.score > 0.5) {
					if (data == undefined) {
						f(e);
					} else {
						f(e, data);
					}
				}
			}).catch(error => console.log(error));
		});
	});
}
