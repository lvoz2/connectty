"use client";

import { useRef } from "react";
import { startAuthentication } from '@simplewebauthn/browser';

export function PasskeyLogin() {
	let usernameRef = useRef(null);

	async function passkeyLogin(e) {
		e.preventDefault();
		const username = usernameRef.current.value;
		const jwt = (await fetch("/api/passkey/login/start", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({username: username})}).then(res => res.json())).jwt;
		console.log(jwt);
		const assertion = await startAuthentication(options);
		const verifyResponse = await fetch("/api/passkey/login/finish", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(assertion)});
		if (verifyResponse.ok) {
			console.log("Login success");
			window.location = "https://lvoz2.duckdns.org";
		} else {
			console.log("Login failure");
		}
	}

	function handleClick(e) {
		passkeyLogin(e);
	}

	return (
		<div id="passkeyLogin">
			<form>
				<input ref={usernameRef} className="p-2 mb-2 rounded w-[100%] focus:outline-blue-600" placeholder="Username" autoComplete="username" type="text"></input>
				<button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold p-2 mt-3 rounded w-[100%]" onClick={handleClick}>Login with Passkey</button>
			</form>
		</div>
	);
}

export default { PasskeyLogin };
