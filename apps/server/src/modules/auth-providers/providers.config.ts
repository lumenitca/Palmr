import { ProviderConfig, ProvidersConfigFile } from "./types";

/**
 * Configuração técnica oficial do GitHub
 * OAuth2 com busca separada de email
 * Endpoints vêm do banco de dados
 */
const githubConfig: ProviderConfig = {
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
 * Endpoints vêm do banco de dados
 */
const auth0Config: ProviderConfig = {
  supportsDiscovery: true,
  discoveryEndpoint: "/.well-known/openid_configuration",
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
 * Endpoints vêm do banco de dados
 */
const kindeConfig: ProviderConfig = {
  supportsDiscovery: true,
  discoveryEndpoint: "/.well-known/openid_configuration",
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
 * OIDC com Basic Auth
 * Endpoints vêm do banco de dados
 */
const zitadelConfig: ProviderConfig = {
  supportsDiscovery: true,
  discoveryEndpoint: "/.well-known/openid_configuration",
  authMethod: "basic",
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
 * OIDC self-hosted com discovery
 * Endpoints vêm do banco de dados
 */
const authentikConfig: ProviderConfig = {
  supportsDiscovery: true,
  discoveryEndpoint: "/.well-known/openid_configuration",
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
 * Configuração técnica oficial do Frontegg
 * OIDC multi-tenant com discovery automático
 * Endpoints vêm do banco de dados
 */
const fronteggConfig: ProviderConfig = {
  supportsDiscovery: true,
  discoveryEndpoint: "/.well-known/openid-configuration",
  authMethod: "body",
  fieldMappings: {
    id: ["sub", "id", "user_id"],
    email: ["email", "preferred_username"],
    name: ["name", "preferred_username"],
    firstName: ["given_name", "name"],
    lastName: ["family_name"],
    avatar: ["picture"],
  },
};

/**
 * Template genérico ULTRA-INTELIGENTE para providers customizados
 * Detecta automaticamente padrões comuns e se adapta
 */
const genericProviderTemplate: ProviderConfig = {
  supportsDiscovery: true,
  discoveryEndpoint: "/.well-known/openid_configuration",
  fallbackEndpoints: {
    authorizationEndpoint: "/oauth2/authorize",
    tokenEndpoint: "/oauth2/token",
    userInfoEndpoint: "/oauth2/userinfo",
  },
  authMethod: "body",
  specialHandling: {
    emailEndpoint: "",
    emailFetchRequired: false,
    responseFormat: "json",
  },

  fieldMappings: {
    id: ["sub", "id", "user_id", "uid", "userid", "account_id"],
    email: ["email", "mail", "email_address", "preferred_email", "primary_email"],
    name: ["name", "display_name", "full_name", "username", "login", "first_name last_name", "given_name family_name"],
    firstName: ["given_name", "first_name", "firstname", "first", "name"],
    lastName: ["family_name", "last_name", "lastname", "last", "surname"],
    avatar: ["picture", "avatar", "avatar_url", "profile_picture", "photo", "image", "thumbnail"],
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
    frontegg: fronteggConfig,
  },
  genericProviderTemplate,
};

/**
 * Exportações individuais para facilitar importação
 */
export {
  githubConfig,
  auth0Config,
  kindeConfig,
  zitadelConfig,
  authentikConfig,
  fronteggConfig,
  genericProviderTemplate,
};
