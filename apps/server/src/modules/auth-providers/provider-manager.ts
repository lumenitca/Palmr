import { providersConfig } from "./providers.config";
import { ProviderConfig, ProvidersConfigFile, ProviderEndpoints, ProviderUserInfo } from "./types";

export class ProviderManager {
  private config!: ProvidersConfigFile;

  constructor() {
    this.loadConfiguration();
  }

  private loadConfiguration() {
    try {
      this.config = providersConfig;
    } catch (error) {
      console.error("Failed to load providers configuration:", error);
      throw new Error("Failed to load providers configuration");
    }
  }

  /**
   * Determina se um provider é oficialmente suportado
   */
  isOfficialProvider(providerName: string): boolean {
    const normalizedName = this.normalizeProviderName(providerName);
    return normalizedName in this.config.officialProviders;
  }

  /**
   * Obtém configuração para um provider de forma INTELIGENTE
   */
  getProviderConfig(provider: any): ProviderConfig {
    console.log(`[ProviderManager] Getting config for provider:`, provider);
    console.log(`[ProviderManager] Provider name: ${provider?.name}`);
    console.log(`[ProviderManager] Provider type from DB: ${provider?.type}`);
    console.log(`[ProviderManager] Provider issuerUrl: ${provider?.issuerUrl}`);

    if (!provider || !provider.name) {
      console.error(`[ProviderManager] Invalid provider object:`, provider);
      throw new Error("Invalid provider object: missing name");
    }

    // PRIMEIRO: Se é um provider oficial, usa a configuração específica
    const officialConfig = this.config.officialProviders[provider.name];
    if (officialConfig) {
      console.log(`[ProviderManager] Using official config for: ${provider.name}`);
      return officialConfig;
    }

    // SEGUNDO: Detecta automaticamente o tipo baseado na URL
    const detectedType = this.detectProviderType(provider.issuerUrl || "");
    console.log(`[ProviderManager] Auto-detected type: ${detectedType}`);

    // TERCEIRO: Se o provider tem um tipo definido no banco, usa ele
    const providerType = provider.type || detectedType;
    console.log(`[ProviderManager] Final provider type: ${providerType}`);

    // QUARTO: Cria configuração inteligente baseada no tipo detectado
    const intelligentConfig: ProviderConfig = {
      ...this.config.genericProviderTemplate,
      name: provider.name,

      // Ajusta configuração baseada no tipo detectado
      supportsDiscovery: this.shouldSupportDiscovery(providerType),
      discoveryEndpoint: this.getDiscoveryEndpoint(providerType),

      // Ajusta fallbacks baseado no tipo
      fallbackEndpoints: this.getFallbackEndpoints(providerType),

      // Ajusta método de autenticação baseado no tipo
      authMethod: this.getAuthMethod(providerType),

      // Ajusta field mappings baseado no tipo
      fieldMappings: this.getFieldMappings(providerType),

      // Ajusta special handling baseado no tipo
      specialHandling: this.getSpecialHandling(providerType),
    };

    console.log(`[ProviderManager] Generated intelligent config:`, intelligentConfig);
    return intelligentConfig;
  }

  /**
   * Obtém todos os providers oficiais disponíveis
   */
  getOfficialProviders(): Record<string, ProviderConfig> {
    return this.config.officialProviders;
  }

  /**
   * Resolve endpoints para um provider com base na configuração
   * ULTRA-INTELIGENTE com múltiplos fallbacks e detecção automática
   */
  async resolveEndpoints(provider: any, config: ProviderConfig): Promise<ProviderEndpoints> {
    console.log(`[ProviderManager] Resolving endpoints for provider: ${provider.name}, config: ${config.name}`);
    console.log(`[ProviderManager] Provider issuerUrl: ${provider.issuerUrl}`);
    console.log(`[ProviderManager] Provider custom endpoints:`, {
      auth: provider.authorizationEndpoint,
      token: provider.tokenEndpoint,
      userInfo: provider.userInfoEndpoint,
    });

    // PRIMEIRO: Verifica se o usuário especificou endpoints customizados
    if (provider.authorizationEndpoint && provider.tokenEndpoint && provider.userInfoEndpoint) {
      console.log(`[ProviderManager] Using custom endpoints from user config`);

      // Se endpoints são relativos, combina com issuerUrl
      const resolvedEndpoints = {
        authorizationEndpoint: this.resolveEndpointUrl(provider.authorizationEndpoint, provider.issuerUrl),
        tokenEndpoint: this.resolveEndpointUrl(provider.tokenEndpoint, provider.issuerUrl),
        userInfoEndpoint: this.resolveEndpointUrl(provider.userInfoEndpoint, provider.issuerUrl),
      };

      console.log(`[ProviderManager] Resolved custom endpoints:`, resolvedEndpoints);
      return resolvedEndpoints;
    }

    // SEGUNDO: Tenta discovery automático se suportado
    let endpoints: ProviderEndpoints = {
      authorizationEndpoint: "",
      tokenEndpoint: "",
      userInfoEndpoint: "",
    };

    if (config.supportsDiscovery && provider.issuerUrl) {
      console.log(`[ProviderManager] Attempting discovery for ${provider.issuerUrl}`);

      // Tenta múltiplos endpoints de discovery
      const discoveryEndpoints = [
        "/.well-known/openid_configuration",
        "/.well-known/openid-configuration",
        "/.well-known/oauth-authorization-server",
        "/.well-known/oauth2-authorization-server",
      ];

      for (const discoveryPath of discoveryEndpoints) {
        const discoveredEndpoints = await this.attemptDiscovery(provider.issuerUrl, discoveryPath);
        if (discoveredEndpoints) {
          console.log(`[ProviderManager] Discovery successful with ${discoveryPath}:`, discoveredEndpoints);
          endpoints = discoveredEndpoints;
          break;
        }
      }

      if (!endpoints.tokenEndpoint) {
        console.log(`[ProviderManager] All discovery attempts failed`);
      }
    }

    // TERCEIRO: Se não conseguiu descobrir, usa fallbacks simples
    if (!endpoints.tokenEndpoint) {
      console.log(`[ProviderManager] Building fallback endpoints`);
      endpoints = this.buildIntelligentFallbackEndpoints(provider, config);
    }

    console.log(`[ProviderManager] Final endpoints:`, endpoints);
    return endpoints;
  }

  /**
   * Resolve URL de endpoint - combina URLs relativas com issuerUrl
   */
  private resolveEndpointUrl(endpoint: string, issuerUrl?: string): string {
    // Se endpoint já é absoluto (contém http), retorna como está
    if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
      return endpoint;
    }

    // Se não tem issuerUrl, retorna endpoint como está
    if (!issuerUrl) {
      return endpoint;
    }

    // Remove trailing slash do issuerUrl
    const baseUrl = issuerUrl.replace(/\/$/, "");

    // Garante que endpoint comece com /
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

    return `${baseUrl}${path}`;
  }

  /**
   * Tenta descobrir endpoints via discovery de forma ROBUSTA
   */
  private async attemptDiscovery(issuerUrl: string, discoveryPath: string): Promise<ProviderEndpoints | null> {
    try {
      const discoveryUrl = `${issuerUrl}${discoveryPath}`;
      console.log(`[ProviderManager] Attempting discovery at: ${discoveryUrl}`);

      const response = await fetch(discoveryUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "Palmr/1.0",
        },
        // Timeout mais generoso para discovery
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        console.log(`[ProviderManager] Discovery failed with status: ${response.status}`);
        return null;
      }

      const discoveryData = (await response.json()) as any;
      console.log(`[ProviderManager] Discovery response:`, discoveryData);

      // Extrai endpoints com múltiplos fallbacks
      const endpoints: ProviderEndpoints = {
        authorizationEndpoint: "",
        tokenEndpoint: "",
        userInfoEndpoint: "",
      };

      // Authorization endpoint - tenta múltiplos campos
      const authEndpoints = [
        "authorization_endpoint",
        "authorizationEndpoint",
        "authorize_endpoint",
        "authorizeEndpoint",
        "auth_endpoint",
        "authEndpoint",
      ];

      for (const field of authEndpoints) {
        if (discoveryData[field]) {
          endpoints.authorizationEndpoint = discoveryData[field];
          break;
        }
      }

      // Token endpoint - tenta múltiplos campos
      const tokenEndpoints = ["token_endpoint", "tokenEndpoint", "access_token_endpoint", "accessTokenEndpoint"];

      for (const field of tokenEndpoints) {
        if (discoveryData[field]) {
          endpoints.tokenEndpoint = discoveryData[field];
          break;
        }
      }

      // UserInfo endpoint - tenta múltiplos campos
      const userInfoEndpoints = [
        "userinfo_endpoint",
        "userInfoEndpoint",
        "user_info_endpoint",
        "userInfo_endpoint",
        "profile_endpoint",
        "profileEndpoint",
      ];

      for (const field of userInfoEndpoints) {
        if (discoveryData[field]) {
          endpoints.userInfoEndpoint = discoveryData[field];
          break;
        }
      }

      // Valida se pelo menos os endpoints essenciais foram encontrados
      if (!endpoints.authorizationEndpoint || !endpoints.tokenEndpoint) {
        console.log(`[ProviderManager] Discovery incomplete - missing essential endpoints`);
        return null;
      }

      console.log(`[ProviderManager] Discovery successful:`, endpoints);
      return endpoints;
    } catch (error) {
      console.log(`[ProviderManager] Discovery error:`, error);
      return null;
    }
  }

  /**
   * Constrói endpoints usando fallbacks simples baseados no tipo
   */
  private buildIntelligentFallbackEndpoints(provider: any, config: ProviderConfig): ProviderEndpoints {
    const baseUrl = provider.issuerUrl?.replace(/\/$/, "") || "";
    console.log(`[ProviderManager] Building fallback endpoints for baseUrl: ${baseUrl}`);

    // Detecta tipo do provider para usar padrão apropriado
    const detectedType = this.detectProviderType(provider.issuerUrl || "");
    const fallbackPattern = this.getFallbackEndpoints(detectedType);

    return {
      authorizationEndpoint: `${baseUrl}${fallbackPattern.authorizationEndpoint}`,
      tokenEndpoint: `${baseUrl}${fallbackPattern.tokenEndpoint}`,
      userInfoEndpoint: `${baseUrl}${fallbackPattern.userInfoEndpoint}`,
    };
  }

  /**
   * Extrai informações do usuário com base no mapeamento de campos
   */
  extractUserInfo(rawUserInfo: any, config: ProviderConfig): ProviderUserInfo {
    console.log(`[ProviderManager] Extracting user info for ${config.name}`);
    console.log(`[ProviderManager] Raw user info:`, rawUserInfo);

    const userInfo: ProviderUserInfo = {
      id: "",
      email: "",
    };

    // Mapeia campos usando as configurações
    const mappings = config.fieldMappings;
    console.log(`[ProviderManager] Field mappings:`, mappings);

    userInfo.id = this.extractField(rawUserInfo, mappings.id) || "";
    userInfo.email = this.extractField(rawUserInfo, mappings.email) || "";
    userInfo.name = this.extractField(rawUserInfo, mappings.name);
    userInfo.firstName = this.extractField(rawUserInfo, mappings.firstName);
    userInfo.lastName = this.extractField(rawUserInfo, mappings.lastName);
    userInfo.avatar = this.extractField(rawUserInfo, mappings.avatar);

    console.log(`[ProviderManager] Extracted user info:`, userInfo);
    return userInfo;
  }

  /**
   * Extrai um campo específico usando lista de possíveis nomes de forma INTELIGENTE
   */
  private extractField(obj: any, fieldNames: string[]): string | undefined {
    if (!obj || !fieldNames.length) return undefined;

    console.log(`[ProviderManager] Extracting field from:`, fieldNames);
    console.log(`[ProviderManager] Available fields:`, Object.keys(obj));

    // Para campos especiais como nome completo que pode ser composto
    if (fieldNames.length > 1 && fieldNames.includes("first_name") && fieldNames.includes("last_name")) {
      const firstName = obj["first_name"];
      const lastName = obj["last_name"];
      if (firstName && lastName) {
        return `${firstName} ${lastName}`;
      } else if (firstName) {
        return firstName;
      } else if (lastName) {
        return lastName;
      }
    }

    // Para campos especiais como nome completo com given_name/family_name
    if (fieldNames.length > 1 && fieldNames.includes("given_name") && fieldNames.includes("family_name")) {
      const firstName = obj["given_name"];
      const lastName = obj["family_name"];
      if (firstName && lastName) {
        return `${firstName} ${lastName}`;
      } else if (firstName) {
        return firstName;
      } else if (lastName) {
        return lastName;
      }
    }

    // Para campos normais - tenta cada nome na lista
    for (const fieldName of fieldNames) {
      if (obj[fieldName] !== undefined && obj[fieldName] !== null) {
        console.log(`[ProviderManager] Found field: ${fieldName} = ${obj[fieldName]}`);
        return String(obj[fieldName]);
      }
    }

    // Tenta variações case-insensitive
    for (const fieldName of fieldNames) {
      const lowerFieldName = fieldName.toLowerCase();
      for (const key of Object.keys(obj)) {
        if (key.toLowerCase() === lowerFieldName && obj[key] !== undefined && obj[key] !== null) {
          console.log(`[ProviderManager] Found field (case-insensitive): ${key} = ${obj[key]}`);
          return String(obj[key]);
        }
      }
    }

    // Tenta variações com underscores vs camelCase
    for (const fieldName of fieldNames) {
      const variations = [
        fieldName,
        fieldName.replace(/_/g, ""),
        fieldName.replace(/([A-Z])/g, "_$1").toLowerCase(),
        fieldName.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()),
      ];

      for (const variation of variations) {
        if (obj[variation] !== undefined && obj[variation] !== null) {
          console.log(`[ProviderManager] Found field (variation): ${variation} = ${obj[variation]}`);
          return String(obj[variation]);
        }
      }
    }

    console.log(`[ProviderManager] Field not found for:`, fieldNames);
    return undefined;
  }

  /**
   * Obtém método de autenticação da configuração
   */
  getAuthMethod(config: ProviderConfig): "body" | "basic" | "header" {
    return config.authMethod || "body";
  }

  /**
   * Determina se precisa buscar email em endpoint separado
   */
  requiresEmailFetch(config: ProviderConfig): boolean {
    return config.specialHandling?.emailFetchRequired || false;
  }

  /**
   * Obtém endpoint específico para buscar email
   */
  getEmailEndpoint(config: ProviderConfig): string | null {
    return config.specialHandling?.emailEndpoint || null;
  }

  /**
   * Normaliza nome do provider para busca
   */
  private normalizeProviderName(name: string): string {
    return name.toLowerCase().trim();
  }

  /**
   * Obtém scopes para um provider de forma INTELIGENTE
   */
  getScopes(provider: any): string[] {
    console.log(`[ProviderManager] Getting scopes for provider: ${provider.name}`);
    console.log(`[ProviderManager] Provider type: ${provider.type}`);
    console.log(`[ProviderManager] Provider scope from DB: ${provider.scope}`);

    // PRIMEIRO: Se o provider tem scope definido no banco, usa ele
    if (provider.scope && provider.scope.trim()) {
      const scopes = provider.scope.split(" ").filter((s: string) => s.trim());
      console.log(`[ProviderManager] Using scope from database: ${scopes}`);
      return scopes;
    }

    // SEGUNDO: Detecta automaticamente baseado no tipo
    const detectedType = this.detectProviderType(provider.issuerUrl || "");
    console.log(`[ProviderManager] Auto-detected type: ${detectedType}`);

    // Scopes específicos por tipo de provider
    const typeScopes: Record<string, string[]> = {
      // Frontegg
      frontegg: ["openid", "profile", "email"],
      // Social providers
      discord: ["identify", "email"],
      github: ["read:user", "user:email"],
      gitlab: ["read_user", "read_api"],
      google: ["openid", "profile", "email"],
      microsoft: ["openid", "profile", "email", "User.Read"],
      facebook: ["public_profile", "email"],
      twitter: ["tweet.read", "users.read"],
      linkedin: ["r_liteprofile", "r_emailaddress"],

      // Enterprise providers
      authentik: ["openid", "profile", "email"],
      keycloak: ["openid", "profile", "email"],
      auth0: ["openid", "profile", "email"],
      okta: ["openid", "profile", "email"],
      onelogin: ["openid", "profile", "email"],
      ping: ["openid", "profile", "email"],
      azure: ["openid", "profile", "email", "User.Read"],
      aws: ["openid", "profile", "email"],

      // Communication
      slack: ["identity.basic", "identity.email", "identity.avatar"],
      teams: ["openid", "profile", "email", "User.Read"],

      // Development tools
      bitbucket: ["account", "repository"],
      atlassian: ["read:jira-user", "read:jira-work"],
      jira: ["read:jira-user", "read:jira-work"],
      confluence: ["read:confluence-content.summary"],

      // Business tools
      salesforce: ["api", "refresh_token"],
      zendesk: ["read"],
      shopify: ["read_products", "read_customers"],
      stripe: ["read"],
      twilio: ["read"],
      sendgrid: ["mail.send"],
      mailchimp: ["read"],
      hubspot: ["contacts", "crm.objects.contacts.read"],

      // Productivity
      zoom: ["user:read:admin"],
      notion: ["read"],
      figma: ["files:read"],
      dropbox: ["files.content.read"],
      box: ["root_readwrite"],
      trello: ["read"],
      asana: ["default"],
      monday: ["read"],
      clickup: ["read"],
      linear: ["read"],
    };

    // TERCEIRO: Se encontrou tipo específico, usa os scopes dele
    if (typeScopes[detectedType]) {
      console.log(`[ProviderManager] Using type-specific scopes for ${detectedType}: ${typeScopes[detectedType]}`);
      return typeScopes[detectedType];
    }

    // QUARTO: Se o provider tem um tipo definido no banco, tenta usar ele
    if (provider.type && typeScopes[provider.type]) {
      console.log(`[ProviderManager] Using database type scopes for ${provider.type}: ${typeScopes[provider.type]}`);
      return typeScopes[provider.type];
    }

    // QUINTO: Fallback para scopes OIDC padrão
    console.log(`[ProviderManager] Using default OIDC scopes: openid, profile, email`);
    return ["openid", "profile", "email"];
  }

  /**
   * Detecta automaticamente o tipo de provider baseado na URL
   */
  private detectProviderType(issuerUrl: string): string {
    const url = issuerUrl.toLowerCase();

    // Padrões conhecidos para detecção automática
    const patterns = [
      { pattern: "frontegg.com", type: "frontegg" },
      { pattern: "discord.com", type: "discord" },
      { pattern: "github.com", type: "github" },
      { pattern: "gitlab.com", type: "gitlab" },
      { pattern: "google.com", type: "google" },
      { pattern: "microsoft.com", type: "microsoft" },
      { pattern: "facebook.com", type: "facebook" },
      { pattern: "twitter.com", type: "twitter" },
      { pattern: "linkedin.com", type: "linkedin" },
      { pattern: "authentik", type: "authentik" },
      { pattern: "keycloak", type: "keycloak" },
      { pattern: "auth0.com", type: "auth0" },
      { pattern: "okta.com", type: "okta" },
      { pattern: "onelogin.com", type: "onelogin" },
      { pattern: "pingidentity.com", type: "ping" },
      { pattern: "azure.com", type: "azure" },
      { pattern: "aws.amazon.com", type: "aws" },
      { pattern: "slack.com", type: "slack" },
      { pattern: "bitbucket.org", type: "bitbucket" },
      { pattern: "atlassian.com", type: "atlassian" },
      { pattern: "salesforce.com", type: "salesforce" },
      { pattern: "zendesk.com", type: "zendesk" },
      { pattern: "shopify.com", type: "shopify" },
      { pattern: "stripe.com", type: "stripe" },
      { pattern: "twilio.com", type: "twilio" },
      { pattern: "sendgrid.com", type: "sendgrid" },
      { pattern: "mailchimp.com", type: "mailchimp" },
      { pattern: "hubspot.com", type: "hubspot" },
      { pattern: "zoom.us", type: "zoom" },
      { pattern: "teams.microsoft.com", type: "teams" },
      { pattern: "notion.so", type: "notion" },
      { pattern: "figma.com", type: "figma" },
      { pattern: "dropbox.com", type: "dropbox" },
      { pattern: "box.com", type: "box" },
      { pattern: "trello.com", type: "trello" },
      { pattern: "asana.com", type: "asana" },
      { pattern: "monday.com", type: "monday" },
      { pattern: "clickup.com", type: "clickup" },
      { pattern: "linear.app", type: "linear" },
      { pattern: "jira", type: "jira" },
      { pattern: "confluence", type: "confluence" },
      { pattern: "bamboo", type: "bamboo" },
      { pattern: "bitbucket", type: "bitbucket" },
      { pattern: "crowd", type: "crowd" },
      { pattern: "fisheye", type: "fisheye" },
      { pattern: "crucible", type: "crucible" },
      { pattern: "statuspage", type: "statuspage" },
      { pattern: "opsgenie", type: "opsgenie" },
      { pattern: "jira", type: "jira" },
      { pattern: "confluence", type: "confluence" },
      { pattern: "bamboo", type: "bamboo" },
      { pattern: "bitbucket", type: "bitbucket" },
      { pattern: "crowd", type: "crowd" },
      { pattern: "fisheye", type: "fisheye" },
      { pattern: "crucible", type: "crucible" },
      { pattern: "statuspage", type: "statuspage" },
      { pattern: "opsgenie", type: "opsgenie" },
    ];

    for (const { pattern, type } of patterns) {
      if (url.includes(pattern)) {
        console.log(`[ProviderManager] Auto-detected provider type: ${type} from URL: ${issuerUrl}`);
        return type;
      }
    }

    // Se não encontrou padrão conhecido, tenta extrair domínio
    try {
      const domain = new URL(issuerUrl).hostname.replace("www.", "");
      console.log(`[ProviderManager] No known pattern found, using domain: ${domain}`);
      return domain;
    } catch {
      console.log(`[ProviderManager] Could not parse URL, using 'custom'`);
      return "custom";
    }
  }

  /**
   * Determina se o provider deve suportar discovery baseado no tipo
   */
  private shouldSupportDiscovery(providerType: string): boolean {
    // Providers que geralmente suportam discovery
    const discoveryProviders = [
      "frontegg",
      "oidc",
      "authentik",
      "keycloak",
      "auth0",
      "okta",
      "onelogin",
      "ping",
      "azure",
      "aws",
      "google",
      "microsoft",
    ];

    return discoveryProviders.includes(providerType);
  }

  /**
   * Obtém o endpoint de discovery apropriado para o tipo
   */
  private getDiscoveryEndpoint(providerType: string): string {
    const discoveryEndpoints: Record<string, string> = {
      frontegg: "/.well-known/openid_configuration",
      oidc: "/.well-known/openid_configuration",
      authentik: "/.well-known/openid_configuration",
      keycloak: "/.well-known/openid_configuration",
      auth0: "/.well-known/openid_configuration",
      okta: "/.well-known/openid_configuration",
      onelogin: "/.well-known/openid_configuration",
      ping: "/.well-known/openid_configuration",
      azure: "/.well-known/openid_configuration",
      aws: "/.well-known/openid_configuration",
      google: "/.well-known/openid_configuration",
      microsoft: "/.well-known/openid_configuration",
    };

    return discoveryEndpoints[providerType] || "/.well-known/openid_configuration";
  }

  /**
   * Obtém fallback endpoints apropriados para o tipo
   */
  private getFallbackEndpoints(providerType: string): any {
    const fallbackPatterns: Record<string, any> = {
      // Frontegg
      frontegg: {
        authorizationEndpoint: "/oauth/authorize",
        tokenEndpoint: "/oauth/token",
        userInfoEndpoint: "/api/oauth/userinfo",
      },
      // OIDC padrão
      oidc: {
        authorizationEndpoint: "/oauth2/authorize",
        tokenEndpoint: "/oauth2/token",
        userInfoEndpoint: "/oauth2/userinfo",
      },
      // OAuth2 padrão
      oauth2: {
        authorizationEndpoint: "/oauth/authorize",
        tokenEndpoint: "/oauth/token",
        userInfoEndpoint: "/oauth/userinfo",
      },
      // GitHub
      github: {
        authorizationEndpoint: "/login/oauth/authorize",
        tokenEndpoint: "/login/oauth/access_token",
        userInfoEndpoint: "/user",
      },
      // GitLab
      gitlab: {
        authorizationEndpoint: "/oauth/authorize",
        tokenEndpoint: "/oauth/token",
        userInfoEndpoint: "/api/v4/user",
      },
      // Discord
      discord: {
        authorizationEndpoint: "/oauth2/authorize",
        tokenEndpoint: "/oauth2/token",
        userInfoEndpoint: "/users/@me",
      },
      // Slack
      slack: {
        authorizationEndpoint: "/oauth/authorize",
        tokenEndpoint: "/api/oauth.access",
        userInfoEndpoint: "/api/users.identity",
      },
    };

    return (
      fallbackPatterns[providerType] || {
        authorizationEndpoint: "/oauth2/authorize",
        tokenEndpoint: "/oauth2/token",
        userInfoEndpoint: "/oauth2/userinfo",
      }
    );
  }

  /**
   * Obtém field mappings apropriados para o tipo
   */
  private getFieldMappings(providerType: string): any {
    const fieldMappings: Record<string, any> = {
      // Frontegg
      frontegg: {
        id: ["sub", "id", "user_id"],
        email: ["email", "preferred_username"],
        name: ["name", "preferred_username"],
        firstName: ["given_name", "name"],
        lastName: ["family_name"],
        avatar: ["picture"],
      },
      // GitHub
      github: {
        id: ["id"],
        email: ["email"],
        name: ["name", "login"],
        firstName: ["name"],
        lastName: [""],
        avatar: ["avatar_url"],
      },
      // GitLab
      gitlab: {
        id: ["id"],
        email: ["email"],
        name: ["name", "username"],
        firstName: ["name"],
        lastName: [""],
        avatar: ["avatar_url"],
      },
      // Discord
      discord: {
        id: ["id"],
        email: ["email"],
        name: ["username", "global_name"],
        firstName: ["username"],
        lastName: [""],
        avatar: ["avatar"],
      },
      // Slack
      slack: {
        id: ["id"],
        email: ["email"],
        name: ["name", "real_name"],
        firstName: ["name"],
        lastName: [""],
        avatar: ["image_192"],
      },
    };

    return fieldMappings[providerType] || this.config.genericProviderTemplate.fieldMappings;
  }

  /**
   * Obtém special handling apropriado para o tipo
   */
  private getSpecialHandling(providerType: string): any {
    const specialHandling: Record<string, any> = {
      // Frontegg - usa OAuth2 padrão
      frontegg: {
        emailEndpoint: "",
        emailFetchRequired: false,
        responseFormat: "json",
        urlCleaning: {
          removeFromEnd: [],
        },
      },
      // GitHub - precisa de endpoint adicional para email
      github: {
        emailEndpoint: "/user/emails",
        emailFetchRequired: true,
        responseFormat: "json",
      },
      // GitLab - OAuth2 padrão
      gitlab: {
        emailEndpoint: "",
        emailFetchRequired: false,
        responseFormat: "json",
      },
      // Discord - OAuth2 padrão
      discord: {
        emailEndpoint: "",
        emailFetchRequired: false,
        responseFormat: "json",
      },
    };

    return (
      specialHandling[providerType] || {
        emailEndpoint: "",
        emailFetchRequired: false,
        responseFormat: "json",
      }
    );
  }
}
