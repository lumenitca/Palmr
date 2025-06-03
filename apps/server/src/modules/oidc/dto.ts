import { z } from "zod";

export const OIDCAuthRequestSchema = z.object({
  state: z.string().optional().describe("OAuth state parameter for CSRF protection"),
  redirect_uri: z.string().url().optional().describe("Redirect URI after authentication"),
});

export const OIDCCallbackSchema = z.object({
  code: z.string().describe("Authorization code from OIDC provider"),
  state: z.string().optional().describe("OAuth state parameter"),
});

export const OIDCConfigResponseSchema = z.object({
  enabled: z.boolean().describe("Whether OIDC is enabled"),
  issuer: z.string().optional().describe("OIDC issuer URL"),
  authUrl: z.string().optional().describe("Authorization URL"),
  scopes: z.array(z.string()).optional().describe("Available scopes"),
});

export const OIDCUserInfoSchema = z.object({
  sub: z.string().describe("Subject identifier"),
  email: z.string().email().optional().describe("User email"),
  email_verified: z.boolean().optional().describe("Email verification status"),
  name: z.string().optional().describe("Full name"),
  given_name: z.string().optional().describe("First name"),
  family_name: z.string().optional().describe("Last name"),
  preferred_username: z.string().optional().describe("Preferred username"),
  picture: z.string().url().optional().describe("Profile picture URL"),
  groups: z.array(z.string()).optional().describe("User groups"),
  roles: z.array(z.string()).optional().describe("User roles"),
});

export type OIDCAuthRequest = z.infer<typeof OIDCAuthRequestSchema>;
export type OIDCCallback = z.infer<typeof OIDCCallbackSchema>;
export type OIDCConfigResponse = z.infer<typeof OIDCConfigResponseSchema>;
export type OIDCUserInfo = z.infer<typeof OIDCUserInfoSchema>;
