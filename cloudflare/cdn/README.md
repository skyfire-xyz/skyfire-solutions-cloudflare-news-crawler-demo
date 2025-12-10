# Cloudflare KYA News Crawler Demo

## Setup

### 1. Clone the repository

```sh
git clone git@github.com:skyfire-xyz/skyfire-solutions-cloudflare-news-crawler-demo.git
cd skyfire-solutions-cloudflare-news-crawler-demo
```

### 2. Install dependencies

```sh
npm install
```

### 3. Configure environment variables

Edit `wrangler.toml` and set your environment variables under `[vars]`:

```toml
[vars]
BACKEND_API_URL = "https://api-qa.skyfire.xyz"
OFFICIAL_SKYFIRE_AGENT_ID = "your-seller-id"
OFFICIAL_SKYFIRE_JWT_ALGORITHM = "ES256"
```

**Do not put secrets in `wrangler.toml`.**

#### Add secrets securely:

```sh
npx wrangler secret put OFFICIAL_SKYFIRE_API_KEY
```

### 4. Build the Worker

Bundle your TypeScript code for deployment:

```sh
npx esbuild worker.ts --bundle --outfile=dist/worker.js --format=esm --platform=browser
```

### 5. Deploy to Cloudflare

Authenticate with Cloudflare (first time only):

```sh
npx wrangler login
```

Deploy your Worker to QA:


```sh
npx wrangler deploy
```

Deploy your Worker to Prod:


```sh
npx wrangler --config wrangler.toml.prod deploy
```

### 6. Test your Worker

- Visit the deployed URL shown in the deploy output (e.g. `https://skyfire-solutions-cloudflare-news-crawler-demo.supermojo.workers.dev/`).
- Use `curl` or your frontend to send requests.

## CORS

This Worker is CORS-enabled. All responses (including errors) include the necessary CORS headers. If you use custom headers or credentials, adjust the CORS logic as needed.

## Useful Commands

- Build: `npx esbuild worker.ts --bundle --outfile=dist/worker.js --format=esm --platform=browser`
- Deploy: `npx wrangler deploy`
- Add secret: `npx wrangler secret put <SECRET_NAME>`

## References

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler Docs](https://developers.cloudflare.com/workers/wrangler/)
- [esbuild Docs](https://esbuild.github.io/)
