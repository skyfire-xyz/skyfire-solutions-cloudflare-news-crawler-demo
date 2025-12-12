# CDN-Based Architectures (CDN + Worker + WAF)

## CDN Overview

Cloudflare CDN is a global content delivery network that speeds up websites by caching content on servers worldwide, serving it from the location closest to the user, reducing latency, and improving load times. Beyond just speed, it acts as a reverse proxy, providing security features like DDoS protection and Web Application Firewall (WAF) by filtering traffic before it reaches your origin server, while also optimizing content delivery for better performance and lower bandwidth costs. 

## Cloudflare Workers

A serverless platform for building, deploying, and scaling apps across Cloudflare's global network with a single command 

## WAF

Cloudflare WAF (Web Application Firewall) is a security service that protects websites and APIs by filtering malicious traffic, blocking attacks like SQL injection, XSS, and zero-days using machine learning and rulesets, sitting in front of your application on Cloudflare's global network to inspect HTTP requests for threats, and offering managed rules, custom policies, rate limiting, and credential leak detection for comprehensive, layered defense. 

## Deployment Steps

1. Host your website on Cloudflare CDN (if not already)

2. Create a Worker

- Log in to your Cloudflare account and navigate to the Workers & Pages section
- Select Create application
- Choose Create Worker -> Deploy
- Your new Worker will be deployed with a Hello World example and a temporary URL (e.g., your-worker.your-subdomain.workers.dev). You can then select Edit code to modify the script within the browser editor
- Sample Worker code can be found [here](/cloudflare/cdn-waf/worker.ts) 
- Edit `wrangler.toml` and set your environment variables under `[vars]`:

```toml
[vars]
BACKEND_API_URL = "https://api.skyfire.xyz"
OFFICIAL_SKYFIRE_JWT_ALGORITHM = "ES256"
OFFICIAL_SKYFIRE_JWT_ISSUER = "https://app.skyfire.xyz"
MOCK_NEWS_WEBSITE="https://demo-mock-news-cloudflare.onrender.com"
```

- Bundle your TypeScript code for deployment:

```sh
npx esbuild worker.ts --bundle --outfile=dist/worker.js --format=esm --platform=browser
```

- Deploy to Cloudflare
    -- Authenticate with Cloudflare (first time only):
    ```sh
    npx wrangler login
    ```

    -- Deploy your Worker:
    ```sh
    npx wrangler deploy
    ```

3. Add routing to your created Worker

- Visit your deployed worker on Cloudflare Dashboard
- Navigate to Settings
- Add a route to your website hosted on CDN in the Domains & Routes section

![add route to worker](/cloudflare/static/cdn-waf-route.png)

4. Setup WAF rules

- Log in to your Cloudflare account and navigate to your domain
- Navigate to Security -> Security rules
- Create a custom rule to check for presence of ``skyfire-pay-id`` header or else block the request on this hostname. If you're on an enterprise plan and have bot management enabled, you can utilise bot-score condition also in this rule

In our demo, this is how our rule is configured - 
![sample waf rule](/cloudflare/static/cdn-waf-rule.png)

## Setup Instructions

### 1. Clone the repository

```sh
git clone git@github.com:skyfire-xyz/skyfire-solutions-cloudflare-news-crawler-demo.git
cd skyfire-solutions-cloudflare-news-crawler-demo/cloudflare/cdn-waf
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

- Visit the deployed URL shown in the deploy output.
- Use `curl` or your frontend to send requests.

## Useful Commands

- Build: `npx esbuild worker.ts --bundle --outfile=dist/worker.js --format=esm --platform=browser`
- Deploy: `npx wrangler deploy`

## References

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler Docs](https://developers.cloudflare.com/workers/wrangler/)
- [esbuild Docs](https://esbuild.github.io/)
