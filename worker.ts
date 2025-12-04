/// <reference types="@cloudflare/workers-types" />

import {
  jwtVerify,
  createRemoteJWKSet,
  JWTHeaderParameters,
  errors as joseErrors,
} from "jose";
import { jwtDecode } from "jwt-decode";

type Env = {
  BACKEND_API_URL: string;
  OFFICIAL_SKYFIRE_AGENT_ID: string;
  OFFICIAL_SKYFIRE_JWT_ALGORITHM: string;
  OFFICIAL_SKYFIRE_AMOUNT_TO_CHARGE: number; // or string
  OFFICIAL_SKYFIRE_SELLER_SKYFIRE_API_KEY: string;
  OFFICIAL_SKYFIRE_SERVICE_URL: string;
  OFFICIAL_SKYFIRE_JWT_ISSUER: string;
  OFFICIAL_SKYFIRE_EXPECTED_SSI: string;
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
    const JWT_AUDIENCE = env.OFFICIAL_SKYFIRE_AGENT_ID;
    const JWT_ALGORITHM = env.OFFICIAL_SKYFIRE_JWT_ALGORITHM;
    const AMOUNT_TO_CHARGE = env.OFFICIAL_SKYFIRE_AMOUNT_TO_CHARGE;
    const SELLER_SKYFIRE_API_KEY = env.OFFICIAL_SKYFIRE_SELLER_SKYFIRE_API_KEY;
    const SELLER_SERVICE_API_URL = env.OFFICIAL_SKYFIRE_SERVICE_URL;
    const JWKS_URL = `${BACKEND_API_URL}/.well-known/jwks.json`;
    const JWT_ISSUER = env.OFFICIAL_SKYFIRE_JWT_ISSUER;
    const JWT_SSI = env.OFFICIAL_SKYFIRE_EXPECTED_SSI; 

    // Authentication with skyfire-pay-id header
    const skyfireToken = request.headers.get("skyfire-pay-id") || "";
    if (!skyfireToken) {
      return withCorsHeaders(
        new Response(
          JSON.stringify({ error: "Missing or invalid skyfire-pay-id header" }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          }
        )
      );
    }

    const responseMessage: string[] = [];
    let decodedHeader: JWTHeaderParameters | null = null;

    // JWT verification
    const JWKS = createRemoteJWKSet(new URL(JWKS_URL));
    
    try {
      const { protectedHeader, payload } = await jwtVerify(skyfireToken, JWKS, {
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
        algorithms: [JWT_ALGORITHM],
      });
      if (payload.ssi !== JWT_SSI) {
        throw new Error("Invalid SSI");
      }

      decodedHeader = protectedHeader;
    } catch (err: unknown) {
      console.error("Error while verifying token: ", err);
      if (err instanceof joseErrors.JOSEError) {
        return withCorsHeaders(
          new Response(
            JSON.stringify({
              error: `Your JWT token is invalid`,
              errorCode: err.code,
              message: err.message,
            }),
            {
              status: 401,
              headers: { "Content-Type": "application/json" },
            }
          )
        );
      }
      return withCorsHeaders(
        new Response(
          JSON.stringify({
            error: `Something went wrong while verifying your JWT token`,
          }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          }
        )
      );
    }

    // Post Authentication
    responseMessage.push(
      `Your ${getTokenType(skyfireToken)} token is valid! :)`
    );

    const responseObj = { response: responseMessage };

    return withCorsHeaders(
      new Response(JSON.stringify(responseObj), {
        headers: { "Content-Type": "application/json" },
      })
    );
  },
};

function getTokenType(skyfireToken: string) {
  try {
    const header = jwtDecode(skyfireToken, { header: true });
    const tokenType = header.typ
      ? header.typ?.substring(0, header.typ.indexOf("+JWT"))
      : "";
    return tokenType;
  } catch (err) {
    console.error("Error while decoding token: " + err);
    return "";
  }
}

function withCorsHeaders(response: Response): Response {
  const newHeaders = new Headers(response.headers);
  newHeaders.set("Access-Control-Allow-Origin", "*"); // Or specify your domain instead of "*"
  newHeaders.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  newHeaders.set(
    "Access-Control-Allow-Headers",
    "Content-Type, skyfire-pay-id"
  );
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}