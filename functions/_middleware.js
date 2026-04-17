function unauthorized(realm) {
  return new Response("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${realm}", charset="UTF-8"`,
      "Cache-Control": "no-store"
    }
  });
}

function parseBasicAuth(authorization) {
  if (!authorization || !authorization.startsWith("Basic ")) {
    return null;
  }

  const encoded = authorization.slice(6).trim();
  if (!encoded) {
    return null;
  }

  let decoded;
  try {
    decoded = atob(encoded);
  } catch (error) {
    return null;
  }

  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex < 0) {
    return null;
  }

  return {
    username: decoded.slice(0, separatorIndex),
    password: decoded.slice(separatorIndex + 1)
  };
}

export async function onRequest(context) {
  const username = String(context.env.BASIC_AUTH_USERNAME || "").trim();
  const password = String(context.env.BASIC_AUTH_PASSWORD || "").trim();

  // Do not enforce authentication when credentials are not configured.
  if (!username || !password) {
    return context.next();
  }

  const realm = String(context.env.BASIC_AUTH_REALM || "Sub Web").trim() || "Sub Web";
  const credentials = parseBasicAuth(context.request.headers.get("Authorization"));

  if (!credentials) {
    return unauthorized(realm);
  }

  if (credentials.username !== username || credentials.password !== password) {
    return unauthorized(realm);
  }

  return context.next();
}
