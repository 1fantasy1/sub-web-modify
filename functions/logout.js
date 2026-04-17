import {buildClearSessionCookie} from "./lib/auth";

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const loginUrl = new URL("/login", url.origin);
  return new Response(null, {
    status: 302,
    headers: {
      Location: loginUrl.toString(),
      "Set-Cookie": buildClearSessionCookie(),
      "Cache-Control": "no-store"
    }
  });
}
