"use client";

import { useRef } from "react";

export function CredentialLogin() {
	const usernameRef = useRef<HTMLInputElement>(null);
	const passwordRef = useRef<HTMLInputElement>(null);

	function credLogin() {
		const usernameE: HTMLInputElement | null = usernameRef.current;
		const passwordE: HTMLInputElement | null = passwordRef.current;
		grecaptcha.ready(function () {
			grecaptcha
				.execute("0x4AAAAAAA8j4p6VGvi4hKXL", {
					action: "submit",
				})
				.then((token: string) => {
					const username = usernameE == null ? "" : usernameE.value;
					const password = passwordE == null ? "" : passwordE.value;
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
								window.location.reload();
							}
						})
						.catch((error) => console.log(error));
				});
		});
	}

	function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
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
