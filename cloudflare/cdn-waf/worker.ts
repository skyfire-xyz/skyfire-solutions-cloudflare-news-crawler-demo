/// <reference types="@cloudflare/workers-types" />

import {
  jwtVerify,
  createRemoteJWKSet,
  errors as joseErrors,
} from "jose";

var validator = require("validator");

type Env = {
  BACKEND_API_URL: string;
  OFFICIAL_SKYFIRE_JWT_ALGORITHM: string;
  OFFICIAL_SKYFIRE_JWT_ISSUER: string;
};

// Cloudflare Workers entry point
export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    // Environment variables (set these in your Worker environment)
    const BACKEND_API_URL = env.BACKEND_API_URL;
    const JWT_ALGORITHM = env.OFFICIAL_SKYFIRE_JWT_ALGORITHM;
    const JWKS_URL = `${BACKEND_API_URL}/.well-known/jwks.json`;
    const JWT_ISSUER = env.OFFICIAL_SKYFIRE_JWT_ISSUER;
    
    // Authentication with skyfire-pay-id header
    const skyfireToken = request.headers.get("skyfire-pay-id") || "";

    const skyfireHeaderExists = request.headers.has("skyfire-pay-id");

    if (skyfireHeaderExists) {
    

    // JWT verification
    const JWKS = createRemoteJWKSet(new URL(JWKS_URL));

    let payload;
    let protectedHeader;

    try {
      ({ payload, protectedHeader } = await jwtVerify(skyfireToken, JWKS, {
        issuer: JWT_ISSUER,
        algorithms: [JWT_ALGORITHM],
      }));

      if (!["kya+jwt", "kya-pay+jwt"].includes(`${protectedHeader.typ}`)) {
        console.log("Invalid typ:", protectedHeader.typ);
        return new Response(
          JSON.stringify({
            error: "Invalid typ - typ should be one of kya+jwt or kya-pay+jwt",
          }),
          {
            status: 401,
            headers: { "content-type": "application/json" },
          }
        );
      }
    } catch (err: unknown) {
      console.error("Error while verifying token: ", err);
      if (err instanceof joseErrors.JOSEError) {
        return new Response(
          JSON.stringify({
            error:
              "`Invalid KYAPay token in the skyfire-pay-id header. Please create an account at https://app.skyfire.xyz and create a kya token - https://docs.skyfire.xyz/reference/create-token and include it in your request in the skyfire-pay-id header.`",
            errorCode: err.code,
            message: err.message,
          }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      return new Response(
        JSON.stringify({
          error: `Something went wrong while verifying your JWT token`,
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // JWT successfully verified, now verify email
    const isEmailValid = validator.isEmail(payload.hid.email);

    if (!isEmailValid) {
      console.log("Invalid email format");
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });
    }

    // Validate env is 'production'
    if (payload.env !== "production") {
      console.log("Invalid environment:", payload.env);
      return new Response(
        JSON.stringify({ error: "Token is not from production environment" }),
        {
          status: 401,
          headers: { "content-type": "application/json" },
        }
      );
    }

    // Validate jti is a UUID
    if (!validator.isUUID(payload.jti)) {
      console.log("Invalid jti:", payload.jti);
      return new Response(
        JSON.stringify({ error: "Invalid token ID (jti) - not a valid UUID" }),
        {
          status: 401,
          headers: { "content-type": "application/json" },
        }
      );
    }

    // Validate sub is a UUID
    if (!validator.isUUID(payload.sub)) {
      console.log("Invalid sub:", payload.sub);
      return new Response(
        JSON.stringify({ error: "Invalid subject (sub) - not a valid UUID" }),
        {
          status: 401,
          headers: { "content-type": "application/json" },
        }
      );
    }

    // Validate aud is a UUID
    if (!validator.isUUID(payload.aud)) {
      console.log("Invalid aud:", payload.aud);
      return new Response(
        JSON.stringify({ error: "Invalid audience (aud) - not a valid UUID" }),
        {
          status: 401,
          headers: { "content-type": "application/json" },
        }
      );
    }
    }

    return fetch(request);
  },
};
