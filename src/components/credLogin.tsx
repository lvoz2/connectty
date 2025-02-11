"use client";

import { useRef } from "react";

export function CredentialLogin() {
	const usernameRef = useRef(null);
	const passwordRef = useRef(null);

	function credLogin() {
		grecaptcha.ready(function () {
			grecaptcha
				.execute("6LdHimkqAAAAAOXLRndbYvcmN3dzYjvLz7-5QBAD", {
					action: "submit",
				})
				.then((token) => {
					const username = usernameRef.current.value;
					const password = passwordRef.current.value;
					const data = {
						token: token,
						username: username,
						password: password,
					};
					fetch("/api/auth", {
						headers: {
							Accept: "application/json",
							"Content-Type": "application/json",
						},
						method: "post",
						body: JSON.stringify(data),
					})
						.then((response) => response.json())
						.then((json) => {
							if (json.success) {
								window.location = "https://lvoz2.duckdns.org";
							}
						})
						.catch((error) => console.log(error));
				});
		});
	}

	function handleClick(e) {
		e.preventDefault();
		credLogin();
	}

	return (
		<div id="credentialLogin">
			<form className="mt-6">
				<input
					ref={usernameRef}
					className="p-2 my-2 rounded w-[100%] focus:outline-blue-600"
					placeholder="Username"
					autoComplete="username"
					type="text"
				></input>
				<input
					ref={passwordRef}
					className="p-2 my-2 rounded w-[100%] focus:outline-blue-600"
					placeholder="Password"
					autoComplete="current-password"
					type="password"
				></input>
				<button
					className="bg-blue-600 hover:bg-blue-500 text-white font-semibold p-2 mt-3 rounded w-[100%]"
					onClick={handleClick}
				>
					Login
				</button>
			</form>
		</div>
	);
}

export default { CredentialLogin };
