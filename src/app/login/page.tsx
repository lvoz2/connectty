"use client";

import { CredentialLogin } from "@/components/credLogin.tsx";
import { PasskeyLogin } from "@/components/passkeyLogin.tsx";

export default function Page() {
	// Style from https://uiverse.io/Dhananjoy43/pretty-earwig-32

	return (
		<div className="flex flex-row min-h-screen w-screen justify-center items-center">
			<div id="loginCard" className="card px-8 py-6 rounded-lg bg-gray-800 w-72">
				<h1 className="text-center font-bold text-3xl text-white">Login</h1>
				<CredentialLogin />
				<p className="overflow-hidden text-center text-white my-3 before:bg-white before:inline-block before:h-px before:relative before:align-middle before:[width:50%] before:right-2 before:[margin-left:-50%] after:bg-white after:inline-block after:h-px after:relative after:align-middle after:[width:50%] after:left-2 after:[margin-right:-50%]">or</p>
				<PasskeyLogin />
			</div>
		</div>
	);
}
