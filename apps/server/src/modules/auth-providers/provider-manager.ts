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
   * Obtém a configuração de um provider (oficial ou genérico)
   * Usa apenas o nome do provider para determinar a configuração
   */
  getProviderConfig(providerName: string, issuerUrl?: string): ProviderConfig | null {
    console.log(`[ProviderManager] getProviderConfig called for: ${providerName}`);

    // Detecção baseada apenas no nome do provider
    const normalizedName = this.normalizeProviderName(providerName);
    console.log(`[ProviderManager] Normalized name: ${normalizedName}`);

    if (this.isOfficialProvider(normalizedName)) {
      console.log(`[ProviderManager] Using official provider config: ${normalizedName}`);
      return this.config.officialProviders[normalizedName];
    }

    // Retorna template genérico para providers customizados
    console.log(`[ProviderManager] Using generic template for: ${providerName}`);
    return {
      ...this.config.genericProviderTemplate,
      name: providerName,
    };
  }

  /**
   * Obtém todos os providers oficiais disponíveis
   */
  getOfficialProviders(): Record<string, ProviderConfig> {
    return this.config.officialProviders;
  }

  /**
   * Resolve endpoints para um provider com base na configuração
   * PRIORIZA dados do usuário sobre configuração interna
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
      return {
        authorizationEndpoint: provider.authorizationEndpoint,
        tokenEndpoint: provider.tokenEndpoint,
        userInfoEndpoint: provider.userInfoEndpoint,
      };
    }

    // SEGUNDO: Tenta discovery automático se suportado
    let endpoints: ProviderEndpoints = {
      authorizationEndpoint: "",
      tokenEndpoint: "",
      userInfoEndpoint: "",
    };

    if (config.supportsDiscovery && provider.issuerUrl) {
      console.log(`[ProviderManager] Attempting discovery for ${provider.issuerUrl}`);
      const discoveredEndpoints = await this.attemptDiscovery(
        provider.issuerUrl,
        config.discoveryEndpoint || "/.well-known/openid_configuration"
      );

      if (discoveredEndpoints) {
        console.log(`[ProviderManager] Discovery successful:`, discoveredEndpoints);
        endpoints = discoveredEndpoints;
      } else {
        console.log(`[ProviderManager] Discovery failed, using fallbacks`);
      }
    }

    // TERCEIRO: Se não conseguiu descobrir, usa fallbacks da configuração
    if (!endpoints.tokenEndpoint) {
      console.log(`[ProviderManager] Building fallback endpoints`);
      endpoints = this.buildFallbackEndpoints(provider, config);
    }

    // QUARTO: Aplica limpeza de URL se necessário
    if (config.specialHandling?.urlCleaning) {
      console.log(`[ProviderManager] Applying URL cleaning for ${config.name}`);
      endpoints = this.cleanUrls(endpoints, provider.issuerUrl, config);
    }

    console.log(`[ProviderManager] Final endpoints:`, endpoints);
    return endpoints;
  }

  /**
   * Tenta descoberta automática de endpoints
   */
  private async attemptDiscovery(issuerUrl: string, discoveryPath: string): Promise<ProviderEndpoints | null> {
    try {
      // Remove trailing slash do issuerUrl se existir
      const cleanIssuerUrl = issuerUrl.replace(/\/$/, "");
      const wellKnownUrl = `${cleanIssuerUrl}${discoveryPath}`;
      console.log(`[ProviderManager] Attempting discovery at: ${wellKnownUrl}`);

      const response = await fetch(wellKnownUrl);

      if (response.ok) {
        const discoveryData: any = await response.json();
        console.log(`[ProviderManager] Discovery successful for ${issuerUrl}:`, {
          authorization_endpoint: discoveryData.authorization_endpoint,
          token_endpoint: discoveryData.token_endpoint,
          userinfo_endpoint: discoveryData.userinfo_endpoint,
        });
        console.log(`[ProviderManager] Full discovery data:`, discoveryData);

        return {
          authorizationEndpoint: discoveryData.authorization_endpoint,
          tokenEndpoint: discoveryData.token_endpoint,
          userInfoEndpoint: discoveryData.userinfo_endpoint,
        };
      } else {
        console.log(`[ProviderManager] Discovery failed for ${issuerUrl}: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.warn(`[ProviderManager] Discovery failed for ${issuerUrl}:`, error);
    }

    return null;
  }

  /**
   * Constrói endpoints usando fallbacks da configuração
   */
  private buildFallbackEndpoints(provider: any, config: ProviderConfig): ProviderEndpoints {
    const baseUrl = provider.issuerUrl || "";

    // Se tem endpoints absolutos na config, usa eles
    if (config.authorizationEndpoint?.startsWith("http")) {
      return {
        authorizationEndpoint: config.authorizationEndpoint,
        tokenEndpoint: config.tokenEndpoint || "",
        userInfoEndpoint: config.userInfoEndpoint || "",
      };
    }

    // Senão, constrói com base no issuerUrl
    const fallbacks = config.fallbackEndpoints;
    return {
      authorizationEndpoint: `${baseUrl}${fallbacks?.authorizationEndpoint || "/auth"}`,
      tokenEndpoint: `${baseUrl}${fallbacks?.tokenEndpoint || "/token"}`,
      userInfoEndpoint: `${baseUrl}${fallbacks?.userInfoEndpoint || "/userinfo"}`,
    };
  }

  /**
   * Aplica limpeza de URLs conforme configuração
   */
  private cleanUrls(endpoints: ProviderEndpoints, issuerUrl: string, config: ProviderConfig): ProviderEndpoints {
    const cleaning = config.specialHandling?.urlCleaning;
    if (!cleaning || !issuerUrl) return endpoints;

    console.log(`[ProviderManager] Cleaning URLs for ${config.name}`);
    console.log(`[ProviderManager] Original issuerUrl: ${issuerUrl}`);
    console.log(`[ProviderManager] Cleaning rules:`, cleaning);

    let cleanBaseUrl = issuerUrl;

    // Remove sufixos especificados (mais robusto)
    for (const suffix of cleaning.removeFromEnd) {
      if (cleanBaseUrl.endsWith(suffix)) {
        console.log(`[ProviderManager] Removing suffix: ${suffix}`);
        cleanBaseUrl = cleanBaseUrl.replace(suffix, "");
        break;
      }
    }

    // Remove trailing slash se existir
    cleanBaseUrl = cleanBaseUrl.replace(/\/$/, "");

    console.log(`[ProviderManager] Cleaned base URL: ${cleanBaseUrl}`);

    // Reconstrói endpoints com URL limpa
    const fallbacks = config.fallbackEndpoints;

    // Caso especial para Authentik - extrai o nome da aplicação da URL
    if (config.name === "Authentik") {
      // Remove o discovery endpoint se estiver presente
      let cleanUrl = cleanBaseUrl;
      if (cleanUrl.includes("/.well-known/openid-configuration")) {
        cleanUrl = cleanUrl.replace("/.well-known/openid-configuration", "");
      }
      if (cleanUrl.includes("/.well-known/openid_configuration")) {
        cleanUrl = cleanUrl.replace("/.well-known/openid_configuration", "");
      }

      // Para Authentik, os endpoints são globais, não específicos por aplicação
      const baseUrl = cleanUrl.replace(/\/application\/o\/[^/]+.*$/, "");

      const cleanedEndpoints = {
        authorizationEndpoint: `${baseUrl}/application/o/authorize/`,
        tokenEndpoint: `${baseUrl}/application/o/token/`,
        userInfoEndpoint: `${baseUrl}/application/o/userinfo/`,
      };

      console.log(`[ProviderManager] Authentik cleaned endpoints:`, cleanedEndpoints);
      return cleanedEndpoints;
    }

    const cleanedEndpoints = {
      authorizationEndpoint: `${cleanBaseUrl}${fallbacks?.authorizationEndpoint || "/auth"}`,
      tokenEndpoint: `${cleanBaseUrl}${fallbacks?.tokenEndpoint || "/token"}`,
      userInfoEndpoint: `${cleanBaseUrl}${fallbacks?.userInfoEndpoint || "/userinfo"}`,
    };

    console.log(`[ProviderManager] Cleaned endpoints:`, cleanedEndpoints);
    return cleanedEndpoints;
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
   * Extrai um campo específico usando lista de possíveis nomes
   */
  private extractField(obj: any, fieldNames: string[]): string | undefined {
    if (!obj || !fieldNames.length) return undefined;

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

    // Para campos normais
    for (const fieldName of fieldNames) {
      if (obj[fieldName] !== undefined && obj[fieldName] !== null) {
        return String(obj[fieldName]);
      }
    }

    return undefined;
  }

  /**
   * Determina o método de autenticação para token exchange
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
   * Obtém scopes padrão para um provider baseado no tipo do banco
   */
  getDefaultScopes(provider: any): string[] {
    // GitHub OAuth2 usa scopes específicos
    if (provider.type === "oauth2" && provider.name === "github") {
      return ["user:email"];
    }

    // OIDC padrão
    if (provider.type === "oidc") {
      return ["openid", "profile", "email"];
    }

    // OAuth2 genérico
    return ["profile", "email"];
  }
}
