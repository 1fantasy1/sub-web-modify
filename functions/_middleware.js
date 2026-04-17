import {
  SESSION_COOKIE_NAME,
  getAuthCredentials,
  getCookieValue,
  isPublicPath,
  isValidSession,
  safeNextPath
} from "./lib/auth";

function redirectToLogin(requestUrl) {
  const url = new URL(requestUrl);
  const loginUrl = new URL("/login", url.origin);
  loginUrl.searchParams.set("next", safeNextPath(`${url.pathname}${url.search}`));

  return new Response(null, {
    status: 302,
    headers: {
      Location: loginUrl.toString(),
      "Cache-Control": "no-store"
    }
  });
}

export async function onRequest(context) {
  const credentials = getAuthCredentials(context.env);

  // Keep site open when auth credentials are not configured.
  if (!credentials) {
    return context.next();
  }

  const path = new URL(context.request.url).pathname;
  if (isPublicPath(path)) {
    return context.next();
  }

  const token = getCookieValue(context.request.headers.get("Cookie"), SESSION_COOKIE_NAME);
  if (token && await isValidSession(context.env, token)) {
    return context.next();
  }

  return redirectToLogin(context.request.url);
}
