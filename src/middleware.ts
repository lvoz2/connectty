"use server";

import { NextRequest, NextResponse } from "next/server";
import { authorise } from "@/lib/authorise.ts";
import utils from "@/lib/utils.ts";
//import toobusy from "toobusy-js";

const defaultCookieOptions = utils.createCookieOptions();

const authService = authorise(
	utils.endpoints,
	utils.timeout,
	defaultCookieOptions
);

export async function middleware(req: NextRequest) {
	/*if (toobusy()) {
		// log if you see necessary
		return Response("Server Too Busy", {status: 503, statusText: "Server Too Busy"});
	}*/
	const endpoint = req.nextUrl.pathname;
	const jwt = req.cookies.has(process.env.COOKIE_NAME)
		? req.cookies.get(process.env.COOKIE_NAME)
		: { name: process.env.COOKIE_NAME, value: "" };
	if (jwt == undefined || jwt.value.length == 0) {
		return NextResponse.rewrite(new URL("/404", req.url));
	}
	console.log(jwt);
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
	}
}
