/// <reference types="@cloudflare/workers-types" />

import { jwtVerify, createRemoteJWKSet, errors as joseErrors } from "jose";
import validator from "validator";

const errorResponse = (error: string, status = 401) =>
  new Response(JSON.stringify({ error }), {
    status,
    headers: { "content-type": "application/json" },
  });

const runChecks = (
  checks: Array<[boolean, string]>,
): Response | null => {
  for (const [ok, msg] of checks) {
    if (!ok) {
      console.log(msg);
      return errorResponse(msg);
    }
  }
  return null;
};

type Env = {
  BACKEND_API_URL: string;
  OFFICIAL_SKYFIRE_JWT_ALGORITHM: string;
  OFFICIAL_SKYFIRE_JWT_ISSUER: string;
  SELLER_DOMAIN: string;
};

// Cloudflare Workers entry point
export default {
  async fetch(
    request: Request,
    env: Env,
    _ctx: ExecutionContext,
  ): Promise<Response> {
    // Environment variables (set these in your Worker environment)
    const BACKEND_API_URL = env.BACKEND_API_URL;
    const JWT_ALGORITHM = env.OFFICIAL_SKYFIRE_JWT_ALGORITHM;
    const JWKS_URL = `${BACKEND_API_URL}/.well-known/jwks.json`;
    const JWT_ISSUER = env.OFFICIAL_SKYFIRE_JWT_ISSUER;

    // Authentication with kyapay-token header
    const skyfireToken = request.headers.get("kyapay-token") || "";
    if (!skyfireToken) {
      return errorResponse(
        "Missing KYAPay token in the kyapay-token header. Please create an account at https://app.skyfire.xyz and create a kya token - https://docs.skyfire.xyz/reference/create-token and include it in your request in the kyapay-token header.",
        403,
      );
    }

    // JWT verification
    const JWKS = createRemoteJWKSet(new URL(JWKS_URL));

    let payload;
    let protectedHeader;

    try {
      ({ payload, protectedHeader } = await jwtVerify(skyfireToken, JWKS, {
        issuer: JWT_ISSUER,
        algorithms: [JWT_ALGORITHM],
      }));
    } catch (err: unknown) {
      console.error("Error while verifying token: ", err);
      if (err instanceof joseErrors.JOSEError) {
        return new Response(
          JSON.stringify({
            error:
              "`Invalid KYAPay token in the kyapay-token header. Please create an account at https://app.skyfire.xyz and create a kya token - https://docs.skyfire.xyz/reference/create-token and include it in your request in the kyapay-token header.`",
            errorCode: err.code,
            message: err.message,
          }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      return errorResponse(`Something went wrong while verifying your JWT token`);
    }

    const typOk = ["kya+jwt", "kya-pay+jwt"].includes(`${protectedHeader.typ}`);
    const err = runChecks([
      [typOk, "Invalid typ - typ should be one of kya+jwt or kya-pay+jwt"],
      [validator.isEmail(payload.hid?.email), "Invalid email format"],
      [payload.env === "production", "Token is not from production environment"],
      [validator.isUUID(payload.jti), "Invalid token ID (jti) - not a valid UUID"],
      [validator.isUUID(payload.sub), "Invalid subject (sub) - not a valid UUID"],
      [validator.isUUID(payload.aud), "Invalid audience (aud) - not a valid UUID"],
      [payload.apd != null, "Missing required claim: apd"],
      [payload.aid != null, "Missing required claim: aid"],
      [payload.sdm === env.SELLER_DOMAIN, "Invalid sdm claim"],
    ]);
    if (err) return err;

    return fetch(request);
  },
};
