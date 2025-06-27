export interface AuthProvider {
  id: string;
  name: string;
  displayName: string;
  type: string;
  icon?: string;
  enabled: boolean;
  issuerUrl?: string;
  clientId?: string;
  clientSecret?: string;
  scope?: string;
  autoRegister: boolean;
  adminEmailDomains?: string;
  sortOrder: number;
  isOfficial?: boolean;
  authorizationEndpoint?: string;
  tokenEndpoint?: string;
  userInfoEndpoint?: string;
}

export interface NewProvider {
  name: string;
  displayName: string;
  type: "oidc" | "oauth2";
  icon: string;
  clientId: string;
  clientSecret: string;
  issuerUrl: string;
  scope: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  userInfoEndpoint: string;
}
