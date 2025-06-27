import { prisma } from "../../shared/prisma";
import { ProviderManager } from "./provider-manager";
import { ProviderConfig, ProviderUserInfo, TokenResponse } from "./types";
import crypto from "crypto";

interface PendingState {
  codeVerifier: string;
  redirectUrl: string;
  expiresAt: number;
  providerId: string;
}

export class AuthProvidersService {
  private providerManager = new ProviderManager();
  private pendingStates = new Map<string, PendingState>();

  async getEnabledProviders(requestContext?: { protocol: string; host: string }) {
    const providers = await prisma.authProvider.findMany({
      where: { enabled: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        displayName: true,
        type: true,
        enabled: true,
        issuerUrl: true,
        icon: true,
        sortOrder: true,
      },
    });

    return providers.map((provider) => {
      const authUrl = this.generateAuthUrl(provider, requestContext);

      return {
        id: provider.id,
        name: provider.name,
        displayName: provider.displayName || provider.name,
        type: provider.type,
        icon: provider.icon || "generic",
        authUrl,
        isOfficial: this.providerManager.isOfficialProvider(provider.name),
        sortOrder: provider.sortOrder,
      };
    });
  }

  async getAllProviders() {
    const providers = await prisma.authProvider.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return providers.map((provider) => ({
      ...provider,
      isOfficial: this.providerManager.isOfficialProvider(provider.name),
    }));
  }

  async getProviderByName(name: string) {
    return await prisma.authProvider.findFirst({
      where: { name },
    });
  }

  async getProviderById(id: string) {
    return await prisma.authProvider.findUnique({
      where: { id },
    });
  }

  isOfficialProvider(providerName: string): boolean {
    return this.providerManager.isOfficialProvider(providerName);
  }

  async createProvider(data: any) {
    // A configuração é usada apenas internamente para autenticação
    // Não sobrescreve dados do usuário como nome, ícone, etc.
    return await prisma.authProvider.create({
      data: {
        ...data,
        // Se o usuário não especificar tipo, usa OIDC como padrão
        type: data.type || "oidc",
        displayName: data.displayName || data.name,
      },
    });
  }

  async updateProvider(id: string, data: any) {
    return await prisma.authProvider.update({
      where: { id },
      data,
    });
  }

  async deleteProvider(id: string) {
    return await prisma.authProvider.delete({
      where: { id },
    });
  }

  private generateAuthUrl(provider: any, requestContext?: { protocol: string; host: string }) {
    const baseUrl = requestContext ? `${requestContext.protocol}://${requestContext.host}` : "http://localhost:3000";

    return `${baseUrl}/api/auth/providers/${provider.name}/authorize`;
  }

  async getAuthorizationUrl(providerName: string, state?: string, redirectUri?: string, requestContext?: any) {
    console.log(`[AuthProvidersService] Getting authorization URL for provider: ${providerName}`);

    const provider = await this.getProviderByName(providerName);
    if (!provider || !provider.enabled) {
      throw new Error(`Provider ${providerName} not found or disabled`);
    }

    console.log(`[AuthProvidersService] Provider found:`, {
      name: provider.name,
      issuerUrl: provider.issuerUrl,
      enabled: provider.enabled,
    });

    const config = this.providerManager.getProviderConfig(provider);
    if (!config) {
      throw new Error(`Configuration not found for provider ${providerName}`);
    }

    console.log(`[AuthProvidersService] Config found:`, {
      name: config.name,
      supportsDiscovery: config.supportsDiscovery,
    });

    const finalState = state || crypto.randomBytes(32).toString("hex");
    const baseUrl = requestContext ? `${requestContext.protocol}://${requestContext.host}` : "http://localhost:3000";

    const callbackUrl = redirectUri || `${baseUrl}/api/auth/providers/${providerName}/callback`;

    // Determina se precisa de PKCE
    const needsPkce = provider.type === "oidc";
    let codeVerifier: string | undefined;
    let codeChallenge: string | undefined;

    if (needsPkce) {
      codeVerifier = crypto.randomBytes(32).toString("base64url");
      codeChallenge = this.generateCodeChallenge(codeVerifier);
    }

    // Salva estado
    this.pendingStates.set(finalState, {
      codeVerifier: codeVerifier || "",
      redirectUrl: redirectUri || `${baseUrl}/dashboard`,
      expiresAt: Date.now() + 600000, // 10 minutes
      providerId: provider.id,
    });

    // Resolve endpoints
    const endpoints = await this.providerManager.resolveEndpoints(provider, config);

    console.log(`[AuthProvidersService] Resolved endpoints:`, endpoints);

    // Constrói URL de autorização
    const authUrl = new URL(endpoints.authorizationEndpoint);

    // Usa scopes do usuário, ou fallback baseado no tipo do provider
    let scopes: string[];
    if (provider.scope) {
      scopes = provider.scope.split(" ").filter((s: string) => s.trim());
    } else {
      scopes = this.providerManager.getScopes(provider);
    }

    console.log(`[AuthProvidersService] Using scopes:`, scopes);

    if (!provider.clientId) {
      throw new Error(`Client ID not configured for provider ${providerName}`);
    }

    authUrl.searchParams.set("client_id", provider.clientId);
    authUrl.searchParams.set("redirect_uri", callbackUrl);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", scopes.join(" "));
    authUrl.searchParams.set("state", finalState);

    if (codeChallenge) {
      authUrl.searchParams.set("code_challenge", codeChallenge);
      authUrl.searchParams.set("code_challenge_method", "S256");
    }

    const finalAuthUrl = authUrl.toString();
    console.log(`[AuthProvidersService] Final authorization URL: ${finalAuthUrl}`);

    return finalAuthUrl;
  }

  async handleCallback(providerName: string, code: string, state: string, requestContext?: any) {
    console.log(`[AuthProvidersService] Handling callback for provider: ${providerName}`);
    console.log(`[AuthProvidersService] State received: ${state}`);

    const pendingState = this.pendingStates.get(state);

    if (!pendingState) {
      console.error(`[AuthProvidersService] No valid pending state found for ${providerName}`);
      throw new Error("Invalid or expired state");
    }

    console.log(`[AuthProvidersService] Using pending state for ${providerName}`);

    const provider = await this.getProviderByName(providerName);
    if (!provider) {
      throw new Error(`Provider ${providerName} not found`);
    }

    console.log(`[AuthProvidersService] Provider found in callback:`, {
      name: provider.name,
      issuerUrl: provider.issuerUrl,
    });

    const config = this.providerManager.getProviderConfig(provider);
    if (!config) {
      throw new Error(`Configuration not found for provider ${providerName}`);
    }

    console.log(`[AuthProvidersService] Config found in callback:`, {
      name: config.name,
    });

    try {
      // Executa token exchange
      console.log(`[AuthProvidersService] Starting token exchange for ${providerName}`);
      const authResult = await this.performTokenExchange(
        provider,
        config,
        code,
        pendingState.codeVerifier,
        requestContext
      );

      console.log(`[AuthProvidersService] Token exchange successful for ${providerName}`);

      // Processa user info
      console.log(`[AuthProvidersService] Processing user info for ${providerName}`);
      const userInfo = await this.processUserInfo(authResult.userInfo, authResult.tokens, config);

      console.log(`[AuthProvidersService] User info processed:`, {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
      });

      // Encontra ou cria usuário
      const user = await this.findOrCreateUser(userInfo, provider);

      console.log(`[AuthProvidersService] User found/created:`, {
        id: user.id,
        email: user.email,
      });

      return {
        user,
        isNewUser: false,
        redirectUrl: pendingState.redirectUrl,
      };
    } catch (error) {
      console.error(`[AuthProvidersService] Error in ${providerName} callback:`, error);
      throw error;
    }
  }

  private async performTokenExchange(
    provider: any,
    config: ProviderConfig,
    code: string,
    codeVerifier: string,
    requestContext?: any
  ) {
    console.log(`[AuthProvidersService] Starting token exchange for ${provider.name}`);
    console.log(`[AuthProvidersService] Config:`, {
      name: config.name,
      authMethod: config.authMethod,
    });

    const endpoints = await this.providerManager.resolveEndpoints(provider, config);
    const authMethod = this.providerManager.getAuthMethod(config);

    console.log(`[AuthProvidersService] Resolved endpoints:`, endpoints);
    console.log(`[AuthProvidersService] Auth method:`, authMethod);

    const baseUrl = requestContext ? `${requestContext.protocol}://${requestContext.host}` : "http://localhost:3000";

    const callbackUrl = provider.redirectUri || `${baseUrl}/api/auth/providers/${provider.name}/callback`;

    // Constrói body para token exchange
    const body = new URLSearchParams();
    body.append("client_id", provider.clientId);
    body.append("code", code);
    body.append("redirect_uri", callbackUrl);
    body.append("grant_type", "authorization_code");

    // Adiciona client_secret se necessário
    if (authMethod === "body" && provider.clientSecret) {
      body.append("client_secret", provider.clientSecret);
    }

    // Adiciona code_verifier se disponível (PKCE)
    if (codeVerifier) {
      body.append("code_verifier", codeVerifier);
    }

    // Prepara headers
    const headers: Record<string, string> = {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    };

    // Configura autenticação basic se necessário
    if (authMethod === "basic" && provider.clientSecret) {
      const auth = Buffer.from(`${provider.clientId}:${provider.clientSecret}`).toString("base64");
      headers["Authorization"] = `Basic ${auth}`;
    }

    console.log(`[AuthProvidersService] Token exchange request:`, {
      url: endpoints.tokenEndpoint,
      method: "POST",
      headers: Object.keys(headers),
      bodyParams: Array.from(body.entries()).map(([key]) => key),
    });

    // Executa token exchange
    const tokenResponse = await fetch(endpoints.tokenEndpoint, {
      method: "POST",
      headers,
      body,
    });

    console.log(`[AuthProvidersService] Token response status:`, tokenResponse.status);

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error(`[AuthProvidersService] Token exchange failed:`, {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText,
      });

      throw new Error(`Token exchange failed: ${tokenResponse.status} - ${errorText}`);
    }

    const tokens = (await tokenResponse.json()) as TokenResponse;

    console.log(`[AuthProvidersService] Token exchange successful:`, {
      hasAccessToken: !!tokens.access_token,
      hasIdToken: !!tokens.id_token,
      tokenType: tokens.token_type,
    });

    if (!tokens.access_token) {
      throw new Error("No access token received");
    }

    // Busca user info
    console.log(`[AuthProvidersService] Fetching user info from:`, endpoints.userInfoEndpoint);

    const userInfoResponse = await fetch(endpoints.userInfoEndpoint, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        Accept: "application/json",
      },
    });

    console.log(`[AuthProvidersService] User info response status:`, userInfoResponse.status);

    if (!userInfoResponse.ok) {
      const errorText = await userInfoResponse.text();
      console.error(`[AuthProvidersService] UserInfo request failed:`, {
        status: userInfoResponse.status,
        statusText: userInfoResponse.statusText,
        url: endpoints.userInfoEndpoint,
        error: errorText.substring(0, 500), // Limita o tamanho do log
      });
      throw new Error(`UserInfo request failed: ${userInfoResponse.status} - ${errorText.substring(0, 200)}`);
    }

    let rawUserInfo: any;
    try {
      rawUserInfo = (await userInfoResponse.json()) as any;
    } catch (parseError) {
      const responseText = await userInfoResponse.text();
      console.error(`[AuthProvidersService] Failed to parse userinfo response:`, {
        error: parseError,
        responseText: responseText.substring(0, 500),
        contentType: userInfoResponse.headers.get("content-type"),
      });
      throw new Error(`Invalid JSON response from userinfo endpoint: ${parseError}`);
    }

    console.log(`[AuthProvidersService] User info received:`, {
      hasId: !!(rawUserInfo as any).sub,
      hasEmail: !!(rawUserInfo as any).email,
      hasName: !!(rawUserInfo as any).name,
    });
    console.log(`[AuthProvidersService] Raw user info from Kinde:`, rawUserInfo);

    return {
      userInfo: rawUserInfo,
      tokens,
    };
  }

  private async processUserInfo(
    rawUserInfo: any,
    tokens: TokenResponse,
    config: ProviderConfig
  ): Promise<ProviderUserInfo> {
    console.log(`[AuthProvidersService] Processing user info for ${config.name}`);
    console.log(`[AuthProvidersService] Raw user info:`, rawUserInfo);
    console.log(`[AuthProvidersService] Config field mappings:`, config.fieldMappings);

    // Extrai informações usando mapeamento da configuração
    const userInfo = this.providerManager.extractUserInfo(rawUserInfo, config);

    console.log(`[AuthProvidersService] Extracted user info:`, userInfo);

    // Verifica se precisa buscar email separadamente
    if (!userInfo.email && this.providerManager.requiresEmailFetch(config)) {
      const emailEndpoint = this.providerManager.getEmailEndpoint(config);
      if (emailEndpoint) {
        const email = await this.fetchEmailFromEndpoint(emailEndpoint, tokens.access_token);
        if (email) {
          userInfo.email = email;
        }
      }
    }

    if (!userInfo.email) {
      throw new Error(`No email address found in ${config.name} account`);
    }

    return userInfo;
  }

  private async fetchEmailFromEndpoint(endpoint: string, accessToken: string): Promise<string | null> {
    try {
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const data: any = await response.json();

        // Para GitHub (array de emails)
        if (Array.isArray(data)) {
          const primaryEmail = data.find((e: any) => e.primary && e.verified);
          if (primaryEmail) return primaryEmail.email;

          const verifiedEmail = data.find((e: any) => e.verified);
          if (verifiedEmail) return verifiedEmail.email;

          if (data.length > 0) return data[0].email;
        }

        // Para outros providers
        if (data.email) return data.email;
      }
    } catch (error) {
      console.warn("Failed to fetch email:", error);
    }

    return null;
  }

  private async findOrCreateUser(userInfo: ProviderUserInfo, provider: any) {
    const externalId = userInfo.id;

    if (!userInfo.email || !externalId) {
      throw new Error("Missing required user information (email or external ID)");
    }

    // Verifica se usuário já existe com este provider
    const existingAuthProvider = await prisma.userAuthProvider.findUnique({
      where: {
        providerId_externalId: {
          providerId: provider.id,
          externalId: String(externalId),
        },
      },
      include: {
        user: true,
      },
    });

    if (existingAuthProvider) {
      // Atualiza informações do usuário apenas se estiverem vazias
      const updateData: any = {};

      // Só atualiza firstName se estiver vazio
      if (!existingAuthProvider.user.firstName && userInfo.firstName) {
        updateData.firstName = userInfo.firstName;
      }

      // Só atualiza lastName se estiver vazio
      if (!existingAuthProvider.user.lastName && userInfo.lastName) {
        updateData.lastName = userInfo.lastName;
      }

      // Só atualiza image se estiver vazia
      if (!existingAuthProvider.user.image && userInfo.avatar) {
        updateData.image = userInfo.avatar;
      }

      // Só faz update se houver dados para atualizar
      if (Object.keys(updateData).length > 0) {
        const updatedUser = await prisma.user.update({
          where: { id: existingAuthProvider.user.id },
          data: updateData,
        });
        return updatedUser;
      }

      return existingAuthProvider.user;
    }

    // Verifica se usuário existe por email
    const existingUser = await prisma.user.findUnique({
      where: { email: userInfo.email },
    });

    if (existingUser) {
      // Associa provider ao usuário existente
      await prisma.userAuthProvider.create({
        data: {
          userId: existingUser.id,
          providerId: provider.id,
          externalId: String(externalId),
        },
      });

      // Atualiza informações do usuário apenas se estiverem vazias
      const updateData: any = {};

      // Só atualiza firstName se estiver vazio
      if (!existingUser.firstName && userInfo.firstName) {
        updateData.firstName = userInfo.firstName;
      }

      // Só atualiza lastName se estiver vazio
      if (!existingUser.lastName && userInfo.lastName) {
        updateData.lastName = userInfo.lastName;
      }

      // Só atualiza image se estiver vazia
      if (!existingUser.image && userInfo.avatar) {
        updateData.image = userInfo.avatar;
      }

      // Só faz update se houver dados para atualizar
      if (Object.keys(updateData).length > 0) {
        const updatedUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: updateData,
        });
        return updatedUser;
      }

      return existingUser;
    }

    // Cria novo usuário
    const displayName = userInfo.name || userInfo.email.split("@")[0];
    const firstName = userInfo.firstName || displayName.split(" ")[0] || userInfo.email.split("@")[0];
    const lastName =
      userInfo.lastName || (displayName.split(" ").length > 1 ? displayName.split(" ").slice(1).join(" ") : "");

    const newUser = await prisma.user.create({
      data: {
        email: userInfo.email,
        username: userInfo.email.split("@")[0],
        firstName,
        lastName,
        image: userInfo.avatar || null,
        isAdmin: false,
        authProviders: {
          create: {
            providerId: provider.id,
            externalId: String(externalId),
          },
        },
      },
    });

    return newUser;
  }

  private generateCodeChallenge(codeVerifier: string): string {
    return crypto.createHash("sha256").update(codeVerifier).digest("base64url");
  }

  private cleanupExpiredStates() {
    const now = Date.now();
    for (const [state, data] of this.pendingStates.entries()) {
      if (data.expiresAt < now) {
        this.pendingStates.delete(state);
      }
    }
  }

  constructor() {
    // Limpa estados expirados a cada 5 minutos
    setInterval(() => this.cleanupExpiredStates(), 5 * 60 * 1000);
  }

  async updateProvidersOrder(providersOrder: { id: string; sortOrder: number }[]) {
    // Update all providers in a transaction
    const updatePromises = providersOrder.map((provider) =>
      prisma.authProvider.update({
        where: { id: provider.id },
        data: { sortOrder: provider.sortOrder },
      })
    );

    await prisma.$transaction(updatePromises);
    return { success: true };
  }
}
