# Cloudflare KYA News Crawler Demo

## Setup

### 1. Clone the repository

```sh
git clone git@github.com:skyfire-xyz/skyfire-solutions-cloudflare-news-crawler-demo.git
cd skyfire-solutions-cloudflare-news-crawler-demo/cloudflare/api-gateway
```

### 2. Install dependencies

```sh
npm install
```

### 3. Configure environment variables

Edit `wrangler.toml` and set your environment variables under `[vars]`:

```toml
[vars]
BACKEND_API_URL = "https://api.skyfire.xyz"
OFFICIAL_SKYFIRE_JWT_ALGORITHM = "ES256"
OFFICIAL_SKYFIRE_JWT_ISSUER = "https://app.skyfire.xyz"
MOCK_NEWS_WEBSITE="https://demo-mock-news-cloudflare.onrender.com"
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

Deploy your Worker:


```sh
npx wrangler deploy
```

### 6. Test your Worker

- Visit the deployed URL shown in the deploy output (e.g. `https://skyfire-solutions-cloudflare-news-crawler-demo.supermojo.workers.dev/`).
- Use `curl` or your frontend to send requests.

## CORS

This Worker is CORS-enabled. All responses (including errors) include the necessary CORS headers. If you use custom headers or credentials, adjust the CORS logic as needed.

## Useful Commands

- Build: `npx esbuild worker.ts --bundle --outfile=dist/worker.js --format=esm --platform=browser`
- Deploy: `npx wrangler deploy`

## References

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler Docs](https://developers.cloudflare.com/workers/wrangler/)
- [esbuild Docs](https://esbuild.github.io/)
