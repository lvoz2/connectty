import auth from "@/lib/auth.ts";
import utils from "@/lib/utils.ts";
import { type NextRequest } from "next/server";
import { cookies } from "next/headers";

try {
	const authService = auth();
} catch (err) {
	const authService = auth(utils.endpoints, utils.timeout, utils.cookieOptions);
}

export async function POST(req: NextRequest) {
	const body = await req.json();
	const username = body.username;
	const password = body.password;
	const permsLevel = body.permsLevel || "basic";
	const urls = body.urls;
	const authStatus = authService.register(username, password, permsLevel, urls);
	if (authStatus.status.status) {
		const cookieStore = await cookies();
		cookieStore.set(authStatus.options);
	}
	return Response.json({status: authStatus.status.status});
}
