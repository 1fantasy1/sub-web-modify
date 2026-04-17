import {
  SESSION_COOKIE_NAME,
  buildSessionCookie,
  createSessionToken,
  getAuthCredentials,
  getAuthRealm,
  getCookieValue,
  getSessionMaxAge,
  isValidSession,
  safeNextPath
} from "./lib/auth";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function redirect(location, cookie) {
  const headers = {
    Location: location,
    "Cache-Control": "no-store"
  };

  if (cookie) {
    headers["Set-Cookie"] = cookie;
  }

  return new Response(null, {
    status: 302,
    headers
  });
}

function renderLoginPage({realm, nextPath, hasError}) {
  const title = `${escapeHtml(realm)} Sign In`;
  const formAction = `/login?next=${encodeURIComponent(nextPath)}`;
  const errorHtml = hasError
    ? "<p class=\"error\">用户名或密码错误，请重试。</p>"
    : "<p class=\"hint\">请输入环境变量中配置的账号密码。</p>";

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
  <style>
    :root {
      --bg-1: #0a2236;
      --bg-2: #123b4a;
      --glow-a: #f3a366;
      --glow-b: #57d6c1;
      --card-bg: rgba(255, 255, 255, 0.9);
      --text-main: #1f2933;
      --text-soft: #4a5565;
      --error: #b91c1c;
      --accent: #0b8f84;
      --accent-strong: #0a776e;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      min-height: 100vh;
      font-family: "Space Grotesk", "Noto Serif SC", "Source Han Serif SC", "Microsoft YaHei", sans-serif;
      color: var(--text-main);
      background:
        radial-gradient(50rem 30rem at 10% 10%, rgba(243, 163, 102, 0.35), transparent 60%),
        radial-gradient(35rem 25rem at 90% 90%, rgba(87, 214, 193, 0.35), transparent 65%),
        linear-gradient(130deg, var(--bg-1), var(--bg-2));
      display: grid;
      place-items: center;
      padding: 1.2rem;
      overflow: hidden;
    }

    .aurora {
      position: fixed;
      inset: -20%;
      background: conic-gradient(from 220deg at 50% 50%, rgba(243, 163, 102, 0.18), rgba(87, 214, 193, 0.14), transparent 60%);
      filter: blur(80px);
      animation: drift 12s ease-in-out infinite alternate;
      pointer-events: none;
    }

    .panel {
      width: min(28rem, 100%);
      border-radius: 1.25rem;
      background: var(--card-bg);
      border: 1px solid rgba(255, 255, 255, 0.7);
      box-shadow: 0 20px 50px rgba(3, 11, 22, 0.28);
      padding: 1.8rem;
      backdrop-filter: blur(6px);
      animation: rise 420ms ease-out;
      position: relative;
      z-index: 1;
    }

    .badge {
      display: inline-block;
      padding: 0.3rem 0.7rem;
      border-radius: 999px;
      font-size: 0.75rem;
      letter-spacing: 0.06em;
      color: #fff;
      background: linear-gradient(120deg, var(--glow-a), #f07b7b);
      margin-bottom: 1rem;
    }

    h1 {
      margin: 0;
      font-size: 1.7rem;
      font-family: "Noto Serif SC", serif;
      font-weight: 600;
      letter-spacing: 0.01em;
    }

    .sub {
      margin: 0.5rem 0 0;
      color: var(--text-soft);
      line-height: 1.6;
      font-size: 0.92rem;
    }

    form {
      margin-top: 1.25rem;
      display: grid;
      gap: 0.9rem;
    }

    label {
      display: block;
      font-size: 0.82rem;
      color: var(--text-soft);
      margin-bottom: 0.35rem;
      letter-spacing: 0.03em;
    }

    input {
      width: 100%;
      border: 1px solid rgba(148, 163, 184, 0.5);
      border-radius: 0.8rem;
      padding: 0.72rem 0.85rem;
      font-size: 0.96rem;
      background: rgba(255, 255, 255, 0.86);
      transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
    }

    input:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 4px rgba(11, 143, 132, 0.18);
      transform: translateY(-1px);
    }

    button {
      border: 0;
      border-radius: 0.85rem;
      padding: 0.78rem 1rem;
      font-size: 0.96rem;
      color: #fff;
      cursor: pointer;
      font-weight: 700;
      letter-spacing: 0.02em;
      background: linear-gradient(120deg, var(--accent), var(--accent-strong));
      box-shadow: 0 12px 22px rgba(10, 119, 110, 0.32);
      transition: transform 140ms ease, filter 140ms ease;
    }

    button:hover {
      transform: translateY(-1px);
      filter: saturate(1.08);
    }

    .hint,
    .error {
      margin: 0.25rem 0 0;
      font-size: 0.84rem;
      min-height: 1.2rem;
    }

    .hint {
      color: var(--text-soft);
    }

    .error {
      color: var(--error);
      font-weight: 600;
    }

    .footer {
      margin-top: 1.1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-soft);
      font-size: 0.78rem;
    }

    .footer a {
      color: var(--accent);
      text-decoration: none;
      font-weight: 600;
    }

    @keyframes rise {
      from {
        opacity: 0;
        transform: translateY(12px) scale(0.985);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes drift {
      from {
        transform: translate3d(-4%, -2%, 0) rotate(0deg);
      }
      to {
        transform: translate3d(4%, 2%, 0) rotate(12deg);
      }
    }

    @media (max-width: 640px) {
      .panel {
        padding: 1.3rem;
        border-radius: 1rem;
      }

      h1 {
        font-size: 1.45rem;
      }
    }
  </style>
</head>
<body>
  <div class="aurora" aria-hidden="true"></div>
  <main class="panel">
    <span class="badge">PRIVATE ACCESS</span>
    <h1>${escapeHtml(realm)}</h1>
    <p class="sub">站点已启用访问保护，请登录后继续使用订阅转换工具。</p>
    <form method="post" action="${formAction}" autocomplete="off">
      <div>
        <label for="username">用户名</label>
        <input id="username" name="username" type="text" required />
      </div>
      <div>
        <label for="password">密码</label>
        <input id="password" name="password" type="password" required />
      </div>
      <button type="submit">登录并继续</button>
    </form>
    ${errorHtml}
    <div class="footer">
      <span>Session Cookie Auth</span>
      <a href="/">返回首页</a>
    </div>
  </main>
</body>
</html>`;
}

export async function onRequestGet(context) {
  const credentials = getAuthCredentials(context.env);
  if (!credentials) {
    return redirect("/");
  }

  const url = new URL(context.request.url);
  const nextPath = safeNextPath(url.searchParams.get("next"));
  const currentToken = getCookieValue(context.request.headers.get("Cookie"), SESSION_COOKIE_NAME);

  if (currentToken && await isValidSession(context.env, currentToken)) {
    return redirect(nextPath);
  }

  const realm = getAuthRealm(context.env);
  const hasError = url.searchParams.get("error") === "1";
  return new Response(renderLoginPage({realm, nextPath, hasError}), {
    headers: {
      "Content-Type": "text/html; charset=UTF-8",
      "Cache-Control": "no-store"
    }
  });
}

export async function onRequestPost(context) {
  const credentials = getAuthCredentials(context.env);
  if (!credentials) {
    return redirect("/");
  }

  const url = new URL(context.request.url);
  const nextPath = safeNextPath(url.searchParams.get("next"));
  const formData = await context.request.formData();
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "").trim();

  if (username !== credentials.username || password !== credentials.password) {
    const realm = getAuthRealm(context.env);
    return new Response(renderLoginPage({realm, nextPath, hasError: true}), {
      status: 401,
      headers: {
        "Content-Type": "text/html; charset=UTF-8",
        "Cache-Control": "no-store"
      }
    });
  }

  const token = await createSessionToken(context.env, credentials);
  const sessionCookie = buildSessionCookie(token, getSessionMaxAge(context.env));
  return redirect(nextPath, sessionCookie);
}
