import { UpdateAuthProviderSchema } from "./dto";
import { AuthProvidersService } from "./service";
import { FastifyRequest, FastifyReply } from "fastify";

export class AuthProvidersController {
  private authProvidersService: AuthProvidersService;

  constructor() {
    this.authProvidersService = new AuthProvidersService();
  }

  async getProviders(request: FastifyRequest, reply: FastifyReply) {
    try {
      const requestContext = {
        protocol: (request.headers["x-forwarded-proto"] as string) || request.protocol,
        host: (request.headers["x-forwarded-host"] as string) || (request.headers.host as string),
        headers: request.headers,
      };

      const providers = await this.authProvidersService.getEnabledProviders(requestContext);

      return reply.send({
        success: true,
        data: providers,
      });
    } catch (error) {
      console.error("Error getting auth providers:", error);
      return reply.status(500).send({
        success: false,
        error: "Failed to get auth providers",
      });
    }
  }

  async getAllProviders(request: FastifyRequest, reply: FastifyReply) {
    if (reply.sent) return;

    try {
      const providers = await this.authProvidersService.getAllProviders();

      return reply.send({
        success: true,
        data: providers,
      });
    } catch (error) {
      console.error("Error getting all providers:", error);
      return reply.status(500).send({
        success: false,
        error: "Failed to get providers",
      });
    }
  }

  async createProvider(request: FastifyRequest<{ Body: any }>, reply: FastifyReply) {
    if (reply.sent) return;

    try {
      const data = request.body as any;

      // Validação adicional: se modo manual, todos os 3 endpoints são obrigatórios
      const hasAnyCustomEndpoint = !!(data.authorizationEndpoint || data.tokenEndpoint || data.userInfoEndpoint);
      const hasAllCustomEndpoints = !!(data.authorizationEndpoint && data.tokenEndpoint && data.userInfoEndpoint);

      if (hasAnyCustomEndpoint && !hasAllCustomEndpoints) {
        return reply.status(400).send({
          success: false,
          error: "When using manual endpoints, all three endpoints (authorization, token, userInfo) are required",
        });
      }

      // Validação: deve ter ou issuerUrl ou endpoints customizados
      if (!data.issuerUrl && !hasAllCustomEndpoints) {
        return reply.status(400).send({
          success: false,
          error: "Either provide issuerUrl for automatic discovery OR all three custom endpoints",
        });
      }

      const provider = await this.authProvidersService.createProvider(data);

      return reply.send({
        success: true,
        data: provider,
      });
    } catch (error) {
      console.error("Error creating provider:", error);

      // Se é erro de validação do Zod
      if (error instanceof Error && error.message.includes("Either provide issuerUrl")) {
        return reply.status(400).send({
          success: false,
          error: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        error: "Failed to create provider",
      });
    }
  }

  async updateProvider(request: FastifyRequest<{ Params: { id: string }; Body: any }>, reply: FastifyReply) {
    if (reply.sent) return;

    try {
      const { id } = request.params;
      const data = request.body as any;

      // Buscar provider para verificar se é oficial
      const existingProvider = await this.authProvidersService.getProviderById(id);
      if (!existingProvider) {
        return reply.status(404).send({
          success: false,
          error: "Provider not found",
        });
      }

      const isOfficial = this.authProvidersService.isOfficialProvider(existingProvider.name);

      // Para providers oficiais, só permite alterar issuerUrl, clientId, clientSecret, enabled, autoRegister, icon
      if (isOfficial) {
        const allowedFields = [
          "issuerUrl",
          "clientId",
          "clientSecret",
          "enabled",
          "autoRegister",
          "adminEmailDomains",
          "icon",
        ];
        const sanitizedData: any = {};

        for (const field of allowedFields) {
          if (data[field] !== undefined) {
            sanitizedData[field] = data[field];
          }
        }

        console.log(
          `[Controller] Official provider ${existingProvider.name} - only allowing fields:`,
          Object.keys(sanitizedData)
        );
        console.log(`[Controller] Sanitized data:`, sanitizedData);

        // Validação adicional para issuerUrl se fornecida
        if (sanitizedData.issuerUrl && typeof sanitizedData.issuerUrl === "string") {
          try {
            new URL(sanitizedData.issuerUrl);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (e) {
            return reply.status(400).send({
              success: false,
              error: "Invalid Provider URL format",
            });
          }
        }

        const provider = await this.authProvidersService.updateProvider(id, sanitizedData);
        console.log(`[Controller] Provider updated successfully:`, provider?.id);
        return reply.send({
          success: true,
          data: provider,
        });
      }

      // Para providers customizados, aplica validação normal
      try {
        console.log(`[Controller] Updating custom provider with data:`, data);

        // Valida usando o schema do Zod
        const validatedData = UpdateAuthProviderSchema.parse(data);
        console.log(`[Controller] Validation passed, validated data:`, validatedData);

        const provider = await this.authProvidersService.updateProvider(id, validatedData);

        return reply.send({
          success: true,
          data: provider,
        });
      } catch (validationError) {
        console.error("Validation error for custom provider:", validationError);
        console.error("Raw data that failed validation:", data);
        return reply.status(400).send({
          success: false,
          error: "Invalid data provided",
        });
      }
    } catch (error) {
      console.error("Error updating provider:", error);

      // Se é erro de validação do Zod
      if (error instanceof Error && error.message.includes("Either provide issuerUrl")) {
        return reply.status(400).send({
          success: false,
          error: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        error: "Failed to update provider",
      });
    }
  }

  async updateProvidersOrder(
    request: FastifyRequest<{ Body: { providers: { id: string; sortOrder: number }[] } }>,
    reply: FastifyReply
  ) {
    if (reply.sent) return;

    try {
      const { providers } = request.body;

      if (!Array.isArray(providers)) {
        return reply.status(400).send({
          success: false,
          error: "Invalid providers array",
        });
      }

      await this.authProvidersService.updateProvidersOrder(providers);

      return reply.send({
        success: true,
        message: "Providers order updated successfully",
      });
    } catch (error) {
      console.error("Error updating providers order:", error);
      return reply.status(500).send({
        success: false,
        error: "Failed to update providers order",
      });
    }
  }

  async deleteProvider(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    if (reply.sent) return;

    try {
      const { id } = request.params;

      const provider = await this.authProvidersService.getProviderById(id);
      if (!provider) {
        return reply.status(404).send({
          success: false,
          error: "Provider not found",
        });
      }

      const isOfficial = this.authProvidersService.isOfficialProvider(provider.name);
      if (isOfficial) {
        return reply.status(400).send({
          success: false,
          error: "Official providers cannot be deleted",
        });
      }

      await this.authProvidersService.deleteProvider(id);

      return reply.send({
        success: true,
        message: "Provider deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting provider:", error);
      return reply.status(500).send({
        success: false,
        error: "Failed to delete provider",
      });
    }
  }

  async authorize(request: FastifyRequest<{ Params: { provider: string }; Querystring: any }>, reply: FastifyReply) {
    try {
      const { provider: providerName } = request.params;
      const query = request.query as any;
      const { state, redirect_uri } = query;

      const requestContext = {
        protocol: (request.headers["x-forwarded-proto"] as string) || request.protocol,
        host: (request.headers["x-forwarded-host"] as string) || (request.headers.host as string),
        headers: request.headers,
      };

      const authUrl = await this.authProvidersService.getAuthorizationUrl(
        providerName,
        state,
        redirect_uri,
        requestContext
      );

      return reply.redirect(authUrl);
    } catch (error) {
      console.error("Error in authorize:", error);
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : "Authorization failed",
      });
    }
  }

  async callback(request: FastifyRequest<{ Params: { provider: string }; Querystring: any }>, reply: FastifyReply) {
    console.log(`[Controller] Callback called for provider: ${request.params.provider}`);
    console.log(`[Controller] Query params:`, request.query);
    console.log(`[Controller] Headers:`, {
      host: request.headers.host,
      "x-forwarded-proto": request.headers["x-forwarded-proto"],
      "x-forwarded-host": request.headers["x-forwarded-host"],
    });

    try {
      const { provider: providerName } = request.params;
      const query = request.query as any;
      const { code, state, error } = query;

      console.log(`[Controller] Extracted params:`, { providerName, code, state, error });
      console.log(`[Controller] All query params:`, query);

      const requestContext = {
        protocol: (request.headers["x-forwarded-proto"] as string) || request.protocol,
        host: (request.headers["x-forwarded-host"] as string) || (request.headers.host as string),
      };
      const baseUrl = `${requestContext.protocol}://${requestContext.host}`;

      console.log(`[Controller] Request context:`, requestContext);
      console.log(`[Controller] Base URL:`, baseUrl);

      if (error) {
        console.error(`OAuth error from ${providerName}:`, error);
        return reply.redirect(`${baseUrl}/login?error=oauth_error&provider=${providerName}`);
      }

      if (!code) {
        console.error(`Missing code parameter for ${providerName}`);
        return reply.redirect(`${baseUrl}/login?error=missing_code&provider=${providerName}`);
      }

      // Validação de parâmetros obrigatórios
      const requiredParams = { code: !!code, state: !!state };
      const missingParams = Object.entries(requiredParams)
        .filter(([, hasValue]) => !hasValue)
        .map(([param]) => param);

      if (missingParams.length > 0) {
        console.error(`Missing parameters for ${providerName}:`, missingParams);
        return reply.redirect(`${baseUrl}/login?error=missing_parameters&provider=${providerName}`);
      }

      console.log(`[Controller] Calling handleCallback for ${providerName}`);
      const result = await this.authProvidersService.handleCallback(providerName, code, state, requestContext);

      const jwt = await request.jwtSign({
        userId: result.user.id,
        isAdmin: result.user.isAdmin,
      });

      reply.setCookie("token", jwt, {
        httpOnly: true,
        secure: request.protocol === "https",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/",
      });

      const redirectUrl = result.redirectUrl || "/dashboard";
      const fullRedirectUrl = redirectUrl.startsWith("http") ? redirectUrl : `${baseUrl}${redirectUrl}`;
      console.log(`[Controller] Redirecting to:`, fullRedirectUrl);
      return reply.redirect(fullRedirectUrl);
    } catch (error) {
      console.error(`Error in ${request.params.provider} callback:`, error);

      let errorType = "unknown_error";
      let errorMessage = "Authentication failed";

      if (error instanceof Error) {
        if (error.message.includes("registration via") && error.message.includes("disabled")) {
          errorType = "registration_disabled";
          errorMessage = `Registration via ${request.params.provider} is disabled. Contact your administrator.`;
        } else if (error.message.includes("not enabled")) {
          errorType = "provider_disabled";
          errorMessage = `${request.params.provider} authentication is currently disabled.`;
        } else if (error.message.includes("expired")) {
          errorType = "state_expired";
          errorMessage = "Authentication session expired. Please try again.";
        } else if (error.message.includes("No email found")) {
          errorType = "no_email";
          errorMessage = `No email address found in your ${request.params.provider} account.`;
        } else if (error.message.includes("Token exchange failed")) {
          errorType = "token_exchange_failed";
          errorMessage = `Failed to authenticate with ${request.params.provider}. Please try again.`;
        } else if (error.message.includes("Missing required user information")) {
          errorType = "missing_user_info";
          errorMessage = `Incomplete user information from ${request.params.provider}.`;
        }
      }

      const requestContext = {
        protocol: (request.headers["x-forwarded-proto"] as string) || request.protocol,
        host: (request.headers["x-forwarded-host"] as string) || (request.headers.host as string),
      };
      const baseUrl = `${requestContext.protocol}://${requestContext.host}`;
      const encodedMessage = encodeURIComponent(errorMessage);
      return reply.redirect(
        `${baseUrl}/login?error=${errorType}&provider=${request.params.provider}&message=${encodedMessage}`
      );
    }
  }
}
