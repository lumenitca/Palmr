import { prisma } from "../../shared/prisma";
import { ConfigService } from "../config/service";
import crypto from "node:crypto";

interface PendingState {
  codeVerifier: string;
  redirectUrl: string;
  expiresAt: number;
}

export class OIDCService {
  private configService = new ConfigService();
  private initialized = false;
  private pendingStates = new Map<string, PendingState>();

  async isEnabled() {
    const oidcEnabled = await this.configService.getValue("oidcEnabled");
    return oidcEnabled === "true";
  }

  async getConfiguration() {
    const oidcIssuerUrl = await this.configService.getValue("oidcIssuerUrl");
    const oidcClientId = await this.configService.getValue("oidcClientId");
    const oidcScope = await this.configService.getValue("oidcScope");
    const oidcRedirectUri = await this.configService.getValue("oidcRedirectUri");

    if (!oidcIssuerUrl || !oidcClientId || !oidcRedirectUri) {
      return {
        enabled: false,
        authUrl: null,
      };
    }

    const { randomPKCECodeVerifier, calculatePKCECodeChallenge } = await import("openid-client");

    const finalRedirectUri = oidcRedirectUri.replace("localhost:3333", "localhost:3000");
    const finalState = crypto.randomUUID();
    const codeVerifier = randomPKCECodeVerifier();
    const codeChallenge = await calculatePKCECodeChallenge(codeVerifier);

    const pendingState: PendingState = {
      codeVerifier,
      redirectUrl: "/dashboard",
      expiresAt: Date.now() + 10 * 60 * 1000,
    };
    this.pendingStates.set(finalState, pendingState);

    const authBaseUrl = `${oidcIssuerUrl.replace(/\/$/, "")}/authorize`;
    const params = new URLSearchParams({
      client_id: oidcClientId,
      response_type: "code",
      scope: oidcScope || "openid profile email",
      redirect_uri: finalRedirectUri,
      state: finalState,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    const authUrl = `${authBaseUrl}?${params.toString()}`;

    return {
      enabled: true,
      authUrl,
    };
  }

  async handleCallback(code: string, state: string, callbackUrl: string) {
    const pendingState = this.pendingStates.get(state);
    if (!pendingState) {
      throw new Error("Invalid or expired state parameter");
    }

    if (Date.now() > pendingState.expiresAt) {
      this.pendingStates.delete(state);
      throw new Error("State expired");
    }

    const oidcIssuerUrl = await this.configService.getValue("oidcIssuerUrl");
    const oidcClientId = await this.configService.getValue("oidcClientId");
    const oidcClientSecret = await this.configService.getValue("oidcClientSecret");

    if (!oidcIssuerUrl || !oidcClientId || !oidcClientSecret) {
      throw new Error("OIDC configuration is incomplete");
    }

    try {
      const { discovery, authorizationCodeGrant, fetchUserInfo } = await import("openid-client");

      const config = await discovery(new URL(oidcIssuerUrl), oidcClientId, oidcClientSecret);

      const tokens = await authorizationCodeGrant(config, new URL(callbackUrl), {
        pkceCodeVerifier: pendingState.codeVerifier,
        expectedState: state,
      });

      const claims = tokens.claims();

      let userInfo;
      try {
        if (tokens.access_token && claims?.sub) {
          userInfo = await fetchUserInfo(config, tokens.access_token, claims.sub);
        }
      } catch (userInfoError) {
        console.warn("Failed to fetch UserInfo, using ID token claims:", userInfoError);
        userInfo = claims;
      }

      const finalUserInfo = userInfo || claims;

      if (!finalUserInfo?.email) {
        throw new Error("No email found in OIDC response");
      }

      const user = await this.findOrCreateUser(finalUserInfo);
      this.pendingStates.delete(state);

      return {
        user,
        redirectUrl: pendingState.redirectUrl,
      };
    } catch (error) {
      this.pendingStates.delete(state);
      console.error("OIDC Callback Error:", error);
      throw error;
    }
  }

  private async findOrCreateUser(userInfo: any) {
    const email = userInfo.email;
    const name = userInfo.name || userInfo.given_name || userInfo.preferred_username || email;
    const oidcSubject = userInfo.sub;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      const existingProvider = await prisma.userAuthProvider.findFirst({
        where: {
          userId: user.id,
          provider: "oidc",
          providerId: oidcSubject,
        },
      });

      if (!existingProvider) {
        await prisma.userAuthProvider.create({
          data: {
            userId: user.id,
            provider: "oidc",
            providerId: oidcSubject,
            metadata: JSON.stringify({
              email: userInfo.email,
              name,
              lastLogin: new Date().toISOString(),
            }),
          },
        });
      } else {
        await prisma.userAuthProvider.updateMany({
          where: {
            userId: user.id,
            provider: "oidc",
            providerId: oidcSubject,
          },
          data: {
            metadata: JSON.stringify({
              email: userInfo.email,
              name,
              lastLogin: new Date().toISOString(),
            }),
          },
        });
      }

      return user;
    }

    const oidcAdminEmailDomains = await this.configService.getValue("oidcAdminEmailDomains");
    const isAdmin = this.isAdminEmail(email, oidcAdminEmailDomains);

    const newUser = await prisma.user.create({
      data: {
        email,
        firstName: name.split(" ")[0] || name,
        lastName: name.split(" ").slice(1).join(" ") || "",
        username: email,
        password: null,
        isAdmin,
        isActive: true,
      },
    });

    await prisma.userAuthProvider.create({
      data: {
        userId: newUser.id,
        provider: "oidc",
        providerId: oidcSubject,
        metadata: JSON.stringify({
          email: userInfo.email,
          name,
          lastLogin: new Date().toISOString(),
        }),
      },
    });

    return newUser;
  }

  private isAdminEmail(email: string, adminDomains: string | null): boolean {
    if (!adminDomains) return false;

    const domains = adminDomains.split(",").map((domain) => domain.trim().toLowerCase());
    const emailDomain = email.split("@")[1]?.toLowerCase();

    return domains.includes(emailDomain);
  }
}
