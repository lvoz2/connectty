"use server";

import { NextResponse } from "next/server";
import { authorise } from "@/lib/authorise.ts";
import utils from "@/lib/utils.ts";
import { notFound } from "next/navigation";
//import toobusy from "toobusy-js";

const authService = authorise(
	utils.endpoints,
	utils.timeout,
	utils.cookieOptions
);

export async function middleware(req: NextRequest) {
	/*if (toobusy()) {
		// log if you see necessary
		return Response("Server Too Busy", {status: 503, statusText: "Server Too Busy"});
	}*/
	const endpoint = req.nextUrl.pathname;
	const jwt = req.cookies.has(process.env.COOKIE_NAME)
		? req.cookies.get(process.env.COOKIE_NAME)
		: "";
	if (endpoint == "/" || endpoint == "/home" || endpoint == "/login") {
		const loggedIn = await authService.checkAuth("/home", jwt.value);
		if (loggedIn && endpoint !== "/home") {
			return NextResponse.redirect(new URL("/home", req.url));
		} else if (!loggedIn && endpoint !== "/login") {
			return NextResponse.redirect(new URL("/login", req.url));
		}
	}
	const authStatus = await authService.checkAuth(endpoint, jwt.value);
	if (!authStatus) {
		return NextResponse.rewrite(new URL("/404", req.url));
		//notFound();
	}
}
