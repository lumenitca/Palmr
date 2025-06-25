import { ProviderConfig, ProvidersConfigFile } from "./types";

/**
 * Configuração técnica oficial do GitHub
 * OAuth2 com busca separada de email
 */
const githubConfig: ProviderConfig = {
  name: "GitHub",
  authorizationEndpoint: "https://github.com/login/oauth/authorize",
  tokenEndpoint: "https://github.com/login/oauth/access_token",
  userInfoEndpoint: "https://api.github.com/user",
  supportsDiscovery: false,
  authMethod: "body",
  specialHandling: {
    emailEndpoint: "https://api.github.com/user/emails",
    emailFetchRequired: true,
    responseFormat: "json",
  },
  fieldMappings: {
    id: ["id", "login"],
    email: ["email"],
    name: ["name", "login"],
    firstName: ["name"],
    lastName: [],
    avatar: ["avatar_url"],
  },
};

/**
 * Configuração técnica oficial do Auth0
 * OIDC com discovery automático
 */
const auth0Config: ProviderConfig = {
  name: "Auth0",
  supportsDiscovery: true,
  discoveryEndpoint: "/.well-known/openid_configuration",
  fallbackEndpoints: {
    authorizationEndpoint: "/authorize",
    tokenEndpoint: "/oauth/token",
    userInfoEndpoint: "/userinfo",
  },
  authMethod: "body",
  fieldMappings: {
    id: ["sub"],
    email: ["email"],
    name: ["name"],
    firstName: ["given_name"],
    lastName: ["family_name"],
    avatar: ["picture"],
  },
};

/**
 * Configuração técnica oficial do Kinde
 * OIDC com mapeamentos de campo customizados
 */
const kindeConfig: ProviderConfig = {
  name: "Kinde",
  supportsDiscovery: true,
  discoveryEndpoint: "/.well-known/openid_configuration",
  fallbackEndpoints: {
    authorizationEndpoint: "/oauth2/auth",
    tokenEndpoint: "/oauth2/token",
    userInfoEndpoint: "/oauth2/user_profile",
  },
  authMethod: "body",
  fieldMappings: {
    id: ["id"],
    email: ["preferred_email"],
    name: ["first_name", "last_name"],
    firstName: ["first_name"],
    lastName: ["last_name"],
    avatar: ["picture"],
  },
};

/**
 * Configuração técnica oficial do Zitadel
 * OIDC com Basic Auth e limpeza de URL
 */
const zitadelConfig: ProviderConfig = {
  name: "Zitadel",
  supportsDiscovery: true,
  discoveryEndpoint: "/.well-known/openid_configuration",
  fallbackEndpoints: {
    authorizationEndpoint: "/oauth/v2/authorize",
    tokenEndpoint: "/oauth/v2/token",
    userInfoEndpoint: "/oidc/v1/userinfo",
  },
  authMethod: "basic",
  specialHandling: {
    urlCleaning: {
      removeFromEnd: ["/oauth/v2/authorize", "/oauth/v2", "/authorize"],
    },
  },
  fieldMappings: {
    id: ["sub"],
    email: ["email"],
    name: ["name"],
    firstName: ["given_name"],
    lastName: ["family_name"],
    avatar: ["picture"],
  },
};

/**
 * Configuração técnica oficial do Authentik
 * OIDC self-hosted com discovery e limpeza de URL
 */
const authentikConfig: ProviderConfig = {
  name: "Authentik",
  supportsDiscovery: true,
  discoveryEndpoint: "/.well-known/openid_configuration",
  fallbackEndpoints: {
    authorizationEndpoint: "/application/o/authorize",
    tokenEndpoint: "/application/o/token",
    userInfoEndpoint: "/application/o/userinfo",
  },
  authMethod: "body",
  specialHandling: {
    urlCleaning: {
      removeFromEnd: ["/.well-known/openid-configuration", "/.well-known/openid_configuration"],
    },
  },
  fieldMappings: {
    id: ["sub"],
    email: ["email"],
    name: ["name"],
    firstName: ["given_name"],
    lastName: ["family_name"],
    avatar: ["picture"],
  },
};

/**
 * Template genérico para providers customizados
 * Configuração técnica padrão OIDC que funciona com a maioria dos providers
 */
const genericProviderTemplate: ProviderConfig = {
  name: "",
  supportsDiscovery: true,
  discoveryEndpoint: "/.well-known/openid_configuration",
  fallbackEndpoints: {
    authorizationEndpoint: "/auth",
    tokenEndpoint: "/token",
    userInfoEndpoint: "/userinfo",
  },
  authMethod: "body",
  fieldMappings: {
    id: ["sub", "id"],
    email: ["email"],
    name: ["name"],
    firstName: ["given_name", "first_name"],
    lastName: ["family_name", "last_name"],
    avatar: ["picture", "avatar_url"],
  },
};

/**
 * Configuração completa dos providers
 * Exporta todos os providers oficiais e o template genérico
 */
export const providersConfig: ProvidersConfigFile = {
  officialProviders: {
    github: githubConfig,
    auth0: auth0Config,
    kinde: kindeConfig,
    zitadel: zitadelConfig,
    authentik: authentikConfig,
  },
  genericProviderTemplate,
};

/**
 * Exportações individuais para facilitar importação
 */
export { githubConfig, auth0Config, kindeConfig, zitadelConfig, authentikConfig, genericProviderTemplate };
