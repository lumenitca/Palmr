import { ProviderConfig, ProvidersConfigFile } from "./types";

/**
 * Configuração oficial do GitHub
 * OAuth2 com busca separada de email
 */
const githubConfig: ProviderConfig = {
  name: "GitHub",
  displayName: "GitHub",
  type: "oauth2",
  icon: "github",
  authorizationEndpoint: "https://github.com/login/oauth/authorize",
  tokenEndpoint: "https://github.com/login/oauth/access_token",
  userInfoEndpoint: "https://api.github.com/user",
  scopes: ["user:email"],
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
 * Configuração oficial do Auth0
 * OIDC com discovery automático
 */
const auth0Config: ProviderConfig = {
  name: "Auth0",
  displayName: "Auth0",
  type: "oidc",
  icon: "auth0",
  supportsDiscovery: true,
  discoveryEndpoint: "/.well-known/openid_configuration",
  fallbackEndpoints: {
    authorizationEndpoint: "/authorize",
    tokenEndpoint: "/oauth/token",
    userInfoEndpoint: "/userinfo",
  },
  scopes: ["openid", "profile", "email"],
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
 * Configuração oficial do Kinde
 * OIDC com mapeamentos de campo customizados
 */
const kindeConfig: ProviderConfig = {
  name: "Kinde",
  displayName: "Kinde",
  type: "oidc",
  icon: "kinde",
  supportsDiscovery: true,
  discoveryEndpoint: "/.well-known/openid_configuration",
  fallbackEndpoints: {
    authorizationEndpoint: "/oauth2/auth",
    tokenEndpoint: "/oauth2/token",
    userInfoEndpoint: "/oauth2/user_profile",
  },
  scopes: ["openid", "profile", "email"],
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
 * Configuração oficial do Zitadel
 * OIDC com Basic Auth e limpeza de URL
 */
const zitadelConfig: ProviderConfig = {
  name: "Zitadel",
  displayName: "Zitadel",
  type: "oidc",
  icon: "zitadel",
  supportsDiscovery: true,
  discoveryEndpoint: "/.well-known/openid_configuration",
  fallbackEndpoints: {
    authorizationEndpoint: "/oauth/v2/authorize",
    tokenEndpoint: "/oauth/v2/token",
    userInfoEndpoint: "/oidc/v1/userinfo",
  },
  scopes: ["openid", "profile", "email"],
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
 * Configuração oficial do Authentik
 * OIDC self-hosted com discovery e limpeza de URL
 */
const authentikConfig: ProviderConfig = {
  name: "Authentik",
  displayName: "Authentik",
  type: "oidc",
  icon: "authentik",
  supportsDiscovery: true,
  discoveryEndpoint: "/.well-known/openid_configuration",
  fallbackEndpoints: {
    authorizationEndpoint: "/application/o/authorize",
    tokenEndpoint: "/application/o/token",
    userInfoEndpoint: "/application/o/userinfo",
  },
  scopes: ["openid", "profile", "email"],
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
 * Configuração padrão OIDC que funciona com a maioria dos providers
 */
const genericProviderTemplate: ProviderConfig = {
  name: "",
  displayName: "",
  type: "oidc",
  icon: "generic",
  supportsDiscovery: true,
  discoveryEndpoint: "/.well-known/openid_configuration",
  fallbackEndpoints: {
    authorizationEndpoint: "/auth",
    tokenEndpoint: "/token",
    userInfoEndpoint: "/userinfo",
  },
  scopes: ["openid", "profile", "email"],
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
