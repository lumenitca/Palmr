import { OIDCAuthRequest, OIDCCallback } from "./dto";
import { OIDCService } from "./service";
import { FastifyRequest, FastifyReply } from "fastify";

export class OIDCController {
  private oidcService: OIDCService;

  constructor() {
    this.oidcService = new OIDCService();
  }

  async getConfig(request: FastifyRequest, reply: FastifyReply) {
    try {
      const protocol = (request.headers["x-forwarded-proto"] as string) || request.protocol;
      const host = (request.headers["x-forwarded-host"] as string) || request.headers.host!;

      const requestContext = {
        protocol,
        host,
        headers: request.headers,
      };

      const config = await this.oidcService.getConfiguration(requestContext);
      return reply.send(config);
    } catch (error) {
      console.error("Error getting OIDC configuration:", error);
      return reply.status(500).send({ error: "Failed to get OIDC configuration" });
    }
  }

  async authorize(request: FastifyRequest<{ Querystring: OIDCAuthRequest }>, reply: FastifyReply) {
    try {
      const isEnabled = await this.oidcService.isEnabled();
      if (!isEnabled) {
        return reply.status(400).send({ error: "OIDC is not enabled" });
      }

      const { state, redirect_uri } = request.query;

      const protocol = (request.headers["x-forwarded-proto"] as string) || request.protocol;
      const host = (request.headers["x-forwarded-host"] as string) || request.headers.host!;

      const requestContext = {
        protocol,
        host,
        headers: request.headers,
      };

      const authUrl = await this.oidcService.getAuthorizationUrl(state, redirect_uri, requestContext);
      return reply.redirect(authUrl);
    } catch (error) {
      console.error("Error in OIDC authorize:", error);
      return reply.status(500).send({ error: "Failed to authorize" });
    }
  }

  async callback(request: FastifyRequest<{ Querystring: OIDCCallback }>, reply: FastifyReply) {
    try {
      const isEnabled = await this.oidcService.isEnabled();
      if (!isEnabled) {
        return reply.status(400).send({ error: "OIDC is not enabled" });
      }

      const { code, state } = request.query;

      if (!code) {
        return reply.status(400).send({ error: "Authorization code is required" });
      }

      const protocol = (request.headers["x-forwarded-proto"] as string) || request.protocol;
      const host = (request.headers["x-forwarded-host"] as string) || request.headers.host!;
      const currentUrl = `${protocol}://${host}${request.url}`;

      const { userInfo } = await this.oidcService.handleCallback(code, state, currentUrl);
      const user = await this.oidcService.findOrCreateUser(userInfo);

      const referer = request.headers.referer;
      const origin = request.headers.origin;
      let frontendOrigin;

      if (referer) {
        const refererUrl = new URL(referer);
        frontendOrigin = `${refererUrl.protocol}//${refererUrl.host}`;
      } else if (origin) {
        frontendOrigin = origin;
      } else {
        frontendOrigin = `${protocol}://${host}`;
      }

      if (!user.isActive) {
        const loginUrl = `${frontendOrigin}/login?error=account_inactive`;
        return reply.redirect(loginUrl);
      }

      const token = await request.jwtSign({
        userId: user.id,
        isAdmin: user.isAdmin,
      });

      const redirectUrl = `${frontendOrigin}/auth/callback?token=${encodeURIComponent(token)}`;
      return reply.redirect(redirectUrl);
    } catch (error) {
      console.error("OIDC callback error:", error);

      const referer = request.headers.referer;
      const origin = request.headers.origin;

      const errorProtocol = (request.headers["x-forwarded-proto"] as string) || request.protocol;
      const errorHost = (request.headers["x-forwarded-host"] as string) || request.headers.host!;
      let frontendOrigin;

      if (referer) {
        const refererUrl = new URL(referer);
        frontendOrigin = `${refererUrl.protocol}//${refererUrl.host}`;
      } else if (origin) {
        frontendOrigin = origin;
      } else {
        frontendOrigin = `${errorProtocol}://${errorHost}`;
      }

      let errorCode = "auth_failed";

      if (error instanceof Error) {
        if (error.message.includes("registration via OIDC is disabled")) {
          errorCode = "registration_disabled";
        } else if (error.message.includes("Invalid or expired")) {
          errorCode = "token_expired";
        } else if (error.message.includes("OIDC configuration")) {
          errorCode = "config_error";
        }
      }

      const loginUrl = `${frontendOrigin}/login?error=${errorCode}`;
      return reply.redirect(loginUrl);
    }
  }
}
