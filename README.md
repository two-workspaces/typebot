# Deploy and Host Typebot on Railway

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new/template/typebot-production?referralCode=sLjDXb&utm_medium=integration&utm_source=button&utm_campaign=typebot-production)

[Typebot](https://typebot.io/) is an open-source chatbot builder. You drag text, image, video and input blocks onto a canvas, add conditions, variables, webhooks and AI blocks (OpenAI, Anthropic, Mistral and others), and publish the result as a full-page bot, a chat bubble or an inline widget on your site, or as a WhatsApp bot. Every conversation is saved, so you can see results and drop-off per block. This template runs Typebot 3.19.1 from the official images: the builder where you design bots, the viewer that serves them to visitors, and Postgres. You can sign in as soon as the deploy is green, before setting up an email provider.

## About Hosting Typebot

The stack is three services: Typebot (the builder), Viewer and Postgres.

- **Upstream's images, pinned.** The builder and viewer run `baptistearno/typebot-builder` and `baptistearno/typebot-viewer` at a fixed release (3.19.1), not `latest`. The builder has a thin wrapper ([source](https://github.com/two-workspaces/typebot)) that adds one entrypoint script and a small mail catcher. Upgrading means bumping the tag.
- **Sign-in without SMTP.** Typebot has no passwords. You sign in with a 6-digit code it emails you, or with OAuth. Without a mail server a fresh install has no way in, and Railway only allows outbound SMTP on the Pro plan. So until you set `SMTP_HOST`, the builder sends its emails to a mail catcher on localhost, which prints each sign-in code (and a one-click sign-in link) to the Typebot service's deploy logs. As soon as you add SMTP, codes go out by email instead.
- **Sign-up closed.** `DISABLE_SIGNUP=true`: only `ADMIN_EMAIL` and people you invite to a workspace can create accounts, so nobody else can use your instance. `ADMIN_EMAIL` also gets the unlimited plan, with no limits on chats or seats.
- **Generated secrets.** The 32-character `ENCRYPTION_SECRET`, which encrypts credentials saved in blocks (API keys, OAuth tokens), and the database password are generated at deploy time. Both services share the key.
- **Migrations on every boot.** The builder applies the database migrations before it starts, and Railway's health check only switches traffic once they finish. The viewer starts after the builder.
- **IPv6-ready.** Both Next.js servers listen on `::`, so they work on Railway's private network.

## Common Use Cases

- Lead capture and qualification bots that send answers to Google Sheets, a CRM or a webhook
- Customer support and FAQ bots with an AI block answering from your own prompt
- Quizzes, surveys and onboarding flows that feel like a chat instead of a form
- WhatsApp bots, and chat bubbles embedded on WordPress, Shopify, Webflow or any site

## Dependencies for Typebot Hosting

- Postgres 17 (included, private network only)
- An email provider for invitations and Send email blocks (optional)
- S3-compatible storage for file uploads (optional)

### Deployment Dependencies

- [Typebot self-hosting documentation](https://docs.typebot.io/self-hosting/get-started)
- [Typebot on GitHub](https://github.com/baptisteArno/typebot.io)
- [Template source on GitHub](https://github.com/two-workspaces/typebot)

### Implementation Details

**Sign in.** Enter your email in `ADMIN_EMAIL` when you deploy. When the deploy is green, open the Typebot service's Railway domain, type that email and click Submit. Then open the Typebot service's deploy logs in Railway and look for a line like:

```
==== Typebot sign-in code for you@example.com: 123456 ====
```

Type the code in the browser, or open the link printed below it. Codes are valid for 10 minutes.

**Your bots' address.** Published bots are served by the Viewer service at `https://<viewer domain>/<bot-id>`. The Share tab in the builder shows each bot's link and embed code.

**Email.** Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD` and `NEXT_PUBLIC_SMTP_FROM` on the Typebot service to send sign-in codes and workspace invitations by email. Railway only allows outbound SMTP on the Pro plan. Until then, invitation emails aren't sent; the log shows which ones were skipped, and an invited teammate can still sign in with their invited email using a code from the logs. For Send email blocks inside bots, add an SMTP credential in the block itself (that runs on the viewer).

**Sign in with GitHub.** Set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` from a GitHub OAuth app with the callback URL `https://<builder domain>/api/auth/callback/github`. Google, GitLab, Microsoft Entra, Keycloak and custom OAuth are also supported through upstream's variables.

**File uploads.** Uploading images in the builder and the File upload input block need S3-compatible storage with public read access, which Railway buckets don't offer. Without it, use image and video links instead of uploads. To enable uploads, set `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`, `S3_ENDPOINT` (and `S3_REGION`, `S3_PUBLIC_CUSTOM_DOMAIN` if needed) on both Typebot and Viewer, for example with Cloudflare R2 and a public bucket domain.

**Custom domains.** After adding one, set `NEXTAUTH_URL` (builder domain) and `NEXT_PUBLIC_VIEWER_URL` (viewer domain) on both services.

**Back up.** Postgres holds your bots and every conversation. Also keep `ENCRYPTION_SECRET`: without it the credentials saved in your blocks can't be decrypted.

**Resources.** On Railway, after building and publishing a bot and chatting with it, the builder used about 430 MB of RAM, the viewer about 310 MB and Postgres about 60 MB, around 800 MB in total. The builder sits close to the Trial plan's 512 MB per-service limit, so use the Hobby plan or above.

## Why Deploy Typebot on Railway?

Railway is a singular platform to deploy your infrastructure stack. Railway will host your infrastructure so you don't have to deal with configuration, while allowing you to vertically and horizontally scale it.

By deploying Typebot on Railway, you are one step closer to supporting a complete full-stack application with minimal burden. Host your servers, databases, AI agents, and more on Railway.
