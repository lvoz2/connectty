"use client";

export default function Page() {
	function submitLogin(e) {
		const username = document.querySelector("#username").value;
		const password = document.querySelector("#password").value;
		const credentials = {"username": username, "password": password};
		fetch("/api/auth", {
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
				fetch('/api/captcha', {
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

	function handleClick(e) {
		runCaptcha(e, submitLogin);
	}

	return (
		<div id="container">
			<div className="row">
				<input id="username" type="text" placeholder="Username"></input>
			</div>
			<div className="row">
				<input id="password" type="password" placeholder="Password"></input>
			</div>
			<div className="row">
				<button id="login" onClick={handleClick}>Login</button>
				<input type="checkbox" disabled id="captcha-status"></input>
			</div>
		</div>
	);
}
