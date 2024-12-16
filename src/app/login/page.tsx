"use client";

export default function Page() {
	function login(e) {
		e.preventDefault();
		grecaptcha.ready(function() {
			grecaptcha.execute("6LdHimkqAAAAAOXLRndbYvcmN3dzYjvLz7-5QBAD", {action: "submit"}).then((token) => {	
				const username = document.querySelector("#username").value;
				const password = document.querySelector("#password").value;
				let data = {"token": token, "username": username, "password": password};
				fetch('/api/auth', {
					headers: {
						"Accept": "application/json",
						"Content-Type": "application/json"
					},
					method: "post",
					body: JSON.stringify(data)
				}).then(response => response.json()).then((json) => {
					if (json.status == "Success") {
						//window.location = "https://lvoz2.duckdns.org";
					}
				}).catch(error => console.log(error));
			});
		});
	}

	function handleClick(e) {
		login(e);
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
