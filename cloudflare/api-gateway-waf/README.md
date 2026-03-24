# API Gateway-Based Architectures (API Gateway + Worker + WAF)

## API Gateway Overview

Cloudflare API Shield enables you to use Cloudflare as your API Gateway, delivering strong security, simplified API management, and seamless integration with the Cloudflare Developer Platform for creating and running APIs.

## Cloudflare Workers

A serverless platform for building, deploying, and scaling apps across Cloudflare's global network with a single command 

## WAF

Cloudflare WAF (Web Application Firewall) is a security service that protects websites and APIs by filtering malicious traffic, blocking attacks like SQL injection, XSS, and zero-days using machine learning and rulesets, sitting in front of your application on Cloudflare's global network to inspect HTTP requests for threats, and offering managed rules, custom policies, rate limiting, and credential leak detection for comprehensive, layered defense. 

## Deployment Steps

1. Create a API Gateway 

- Log in to your Cloudflare dashboard and select your account and domain.
- Navigate to Security -> Web Assets.
- Go to the Endpoint Management section and define a new one.

2. Create a Worker

- Log in to your Cloudflare account and navigate to the Workers & Pages section
- Select Create application
- Choose Create Worker -> Deploy
- Your new Worker will be deployed with a Hello World example and a temporary URL (e.g., your-worker.your-subdomain.workers.dev). You can then select Edit code to modify the script within the browser editor
- Sample Worker code can be found [here](/cloudflare/api-gateway-waf/worker.ts) 
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

3. Associate the Worker with the created API Gateway

- Expand the details for the specific endpoint
- Under the Routing section, select Create route

![add or edit route](/cloudflare/static/api-gateway-route.png)

- Enter the target URL of your deployed Worker (e.g., your-worker.your-subdomain.workers.dev) in the target field
- Select Deploy route to link the API Gateway endpoint to your Worker

4. Setup WAF rules

- Log in to your Cloudflare account and navigate to your domain
- Navigate to Security -> Security rules
- Create a custom rule to check for presence of ``skyfire-pay-id`` header or else block the request on this hostname. If you're on an enterprise plan and have bot management enabled, you can utilise bot-score condition also in this rule

In our demo, this is how our rule is configured - 
![sample waf rule](/cloudflare/static/api-gateway-waf-rule.png)

## Setup Instructions

### 1. Clone the repository

```sh
git clone git@github.com:skyfire-xyz/skyfire-solutions-cloudflare-news-crawler-demo.git
cd skyfire-solutions-cloudflare-news-crawler-demo/cloudflare/api-gateway-waf
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
