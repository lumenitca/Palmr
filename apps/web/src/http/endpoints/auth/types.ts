import type { AxiosResponse } from "axios";

import type {
  GetCurrentUser200,
  Login200,
  LoginBody,
  Logout200,
  OidcConfig200,
  RequestPasswordReset200,
  RequestPasswordResetBody,
  ResetPassword200,
  ResetPasswordBody,
} from "../../models";

export type LoginResult = AxiosResponse<Login200>;
export type LogoutResult = AxiosResponse<Logout200>;
export type RequestPasswordResetResult = AxiosResponse<RequestPasswordReset200>;
export type ResetPasswordResult = AxiosResponse<ResetPassword200>;
export type GetCurrentUserResult = AxiosResponse<GetCurrentUser200>;

export type { LoginBody, RequestPasswordResetBody, ResetPasswordBody };

export type OIDCConfigResult = AxiosResponse<OidcConfig200>;
export type OIDCConfigData = OidcConfig200;

// Auth Providers Types
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

// Simplified auth provider for login page (only enabled providers)
export interface EnabledAuthProvider {
  id: string;
  name: string;
  displayName: string;
  type: string;
  icon?: string;
  authUrl?: string;
}

export interface NewProvider {
  name: string;
  displayName: string;
  type: "oidc" | "oauth2";
  icon: string;
  clientId: string;
  clientSecret: string;
  issuerUrl?: string;
  scope?: string;
  authorizationEndpoint?: string;
  tokenEndpoint?: string;
  userInfoEndpoint?: string;
}

export interface AuthProvidersResponse {
  success: boolean;
  data: AuthProvider[];
}

export interface EnabledProvidersResponse {
  success: boolean;
  data: EnabledAuthProvider[];
}

export interface AuthProviderResponse {
  success: boolean;
  data: AuthProvider;
}

export interface UpdateProvidersOrderBody {
  providers: Array<{
    id: string;
    sortOrder: number;
  }>;
}

export interface AuthProviderOrderResponse {
  success: boolean;
  message: string;
}

export type GetEnabledProvidersResult = AxiosResponse<EnabledProvidersResponse>;
export type GetAllProvidersResult = AxiosResponse<AuthProvidersResponse>;
export type CreateProviderResult = AxiosResponse<AuthProviderResponse>;
export type UpdateProviderResult = AxiosResponse<AuthProviderResponse>;
export type DeleteProviderResult = AxiosResponse<{ success: boolean; message: string }>;
export type UpdateProvidersOrderResult = AxiosResponse<AuthProviderOrderResponse>;
