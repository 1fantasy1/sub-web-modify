# sub-web-modify (改)
我在原项目修改了很多，主要是个人自用，所以没有部署教程，请参考[原项目](https://suburl.v1.mk)

## Cloudflare Pages 访问验证（自定义登录页）

项目已内置 Pages Functions 鉴权中间件 [functions/_middleware.js](functions/_middleware.js)。

未登录访问时会重定向到自定义登录页 [functions/login.js](functions/login.js)，登录成功后使用 HttpOnly Cookie 会话访问站点。

在 Cloudflare Pages 项目中配置以下变量：

- `BASIC_AUTH_USERNAME`：登录用户名
- `BASIC_AUTH_PASSWORD`：登录密码（建议放到 Secrets）
- `BASIC_AUTH_REALM`：可选，登录框显示的站点名称
- `BASIC_AUTH_SECRET`：可选，会话签名密钥（建议放到 Secrets）
- `BASIC_AUTH_SESSION_MAX_AGE`：可选，会话有效期（秒），默认 43200（12 小时）

说明：

- 只要 `BASIC_AUTH_USERNAME` 和 `BASIC_AUTH_PASSWORD` 同时存在，就会启用验证。
- 任一变量缺失时，会自动跳过验证（避免误配置导致站点锁死）。
- 修改 Variables/Secrets 后需要重新部署一次才会生效。
- 可访问 `/logout` 清除当前登录会话。