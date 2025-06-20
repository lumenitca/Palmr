import { OIDCController } from "./controller";
import { OIDCAuthRequestSchema, OIDCCallbackSchema, OIDCConfigResponseSchema } from "./dto";
import { FastifyInstance } from "fastify";
import { z } from "zod";

export async function oidcRoutes(fastify: FastifyInstance) {
  const oidcController = new OIDCController();

  fastify.get(
    "/config",
    {
      schema: {
        tags: ["OIDC"],
        operationId: "getOIDCConfig",
        summary: "Get OIDC Configuration",
        description:
          "Retrieve OpenID Connect configuration including provider settings, authorization URL, and enabled status. This endpoint provides the necessary information for frontend applications to initiate OIDC authentication flows.",
        response: {
          200: OIDCConfigResponseSchema,
          500: z.object({
            error: z.string().describe("Error message"),
          }),
        },
      },
    },
    oidcController.getConfig.bind(oidcController)
  );

  fastify.get(
    "/authorize",
    {
      schema: {
        tags: ["OIDC"],
        operationId: "authorizeOIDC",
        summary: "Initiate OIDC Authorization",
        description:
          "Initiate the OpenID Connect authorization flow by redirecting to the configured identity provider. This endpoint starts the authentication process and redirects the user to the OIDC provider's authorization endpoint.",
        querystring: OIDCAuthRequestSchema,
        response: {
          302: z.object({
            message: z.string().describe("Redirect to OIDC provider"),
          }),
          400: z.object({
            error: z.string().describe("Error message"),
          }),
          500: z.object({
            error: z.string().describe("Error message"),
          }),
        },
      },
    },
    oidcController.authorize.bind(oidcController)
  );

  fastify.get(
    "/callback",
    {
      schema: {
        tags: ["OIDC"],
        operationId: "handleOIDCCallback",
        summary: "Handle OIDC Callback",
        description:
          "Handle the callback from the OpenID Connect provider after user authentication. This endpoint processes the authorization code, exchanges it for tokens, retrieves user information, and completes the authentication flow by creating a session and redirecting to the frontend.",
        querystring: OIDCCallbackSchema,
        response: {
          302: z.object({
            message: z.string().describe("Redirect to frontend with authentication token"),
          }),
          400: z.object({
            error: z.string().describe("Error message"),
          }),
          500: z.object({
            error: z.string().describe("Error message"),
          }),
        },
      },
    },
    oidcController.callback.bind(oidcController)
  );
}
