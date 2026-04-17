export const SESSION_COOKIE_NAME = "subweb_session";
const DEFAULT_REALM = "Sub Web";
const DEFAULT_SESSION_MAX_AGE = 60 * 60 * 12;

function normalizeString(value) {
  return String(value || "").trim();
}

export function getAuthCredentials(env) {
  const username = normalizeString(env.BASIC_AUTH_USERNAME);
  const password = normalizeString(env.BASIC_AUTH_PASSWORD);
  if (!username || !password) {
    return null;
  }

  return {username, password};
}

export function getAuthRealm(env) {
  const realm = normalizeString(env.BASIC_AUTH_REALM);
  return realm || DEFAULT_REALM;
}

export function getSessionMaxAge(env) {
  const maxAge = Number.parseInt(normalizeString(env.BASIC_AUTH_SESSION_MAX_AGE), 10);
  if (!Number.isFinite(maxAge) || maxAge <= 0) {
    return DEFAULT_SESSION_MAX_AGE;
  }

  return maxAge;
}

function getSessionSecret(env, credentials) {
  const configuredSecret = normalizeString(env.BASIC_AUTH_SECRET);
  if (configuredSecret) {
    return configuredSecret;
  }

  // Fallback keeps setup simple while still avoiding plaintext credentials in cookies.
  return `${credentials.username}:${credentials.password}`;
}

function toBase64Url(uint8Array) {
  let binary = "";
  for (const byte of uint8Array) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function sha256Base64Url(input) {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return toBase64Url(new Uint8Array(buffer));
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }

  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function createSessionToken(env, credentials) {
  const secret = getSessionSecret(env, credentials);
  return sha256Base64Url(`${credentials.username}:${credentials.password}:${secret}`);
}

export async function isValidSession(env, rawToken) {
  const credentials = getAuthCredentials(env);
  if (!credentials || !rawToken) {
    return false;
  }

  const expectedToken = await createSessionToken(env, credentials);
  return timingSafeEqual(String(rawToken), expectedToken);
}

export function getCookieValue(cookieHeader, key) {
  if (!cookieHeader || !key) {
    return "";
  }

  const pairs = cookieHeader.split(";");
  for (const pair of pairs) {
    const index = pair.indexOf("=");
    if (index < 0) {
      continue;
    }

    const name = pair.slice(0, index).trim();
    if (name !== key) {
      continue;
    }

    return decodeURIComponent(pair.slice(index + 1).trim());
  }

  return "";
}

export function buildSessionCookie(token, maxAge) {
  const safeMaxAge = Number.isFinite(maxAge) && maxAge > 0 ? Math.floor(maxAge) : DEFAULT_SESSION_MAX_AGE;
  const encodedToken = encodeURIComponent(token);
  return `${SESSION_COOKIE_NAME}=${encodedToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${safeMaxAge}`;
}

export function buildClearSessionCookie() {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export function safeNextPath(rawValue) {
  const next = normalizeString(rawValue);
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }

  if (next === "/login") {
    return "/";
  }

  return next;
}

export function isPublicPath(pathname) {
  return pathname === "/login" || pathname === "/logout" || pathname === "/favicon.ico";
}
