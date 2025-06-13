import { prisma } from "../../shared/prisma";
import { ConfigService } from "../config/service";
import { OIDCUserInfo } from "./dto";
import crypto from "node:crypto";

if (typeof globalThis.crypto === "undefined") {
  console.log("🔧 Setting up crypto polyfill for openid-client...");
  globalThis.crypto = crypto.webcrypto as any;
}

export class OIDCService {
  private client: any = null;
  private issuer: any = null;
  private config: any = null;
  private initialized = false;
  private openidClient: any = null;
  private configService: ConfigService;

  constructor() {
    this.configService = new ConfigService();
    this.initializeClient();
  }

  private async initializeClient() {
    try {
      const oidcEnabled = await this.configService.getValue("oidcEnabled");
      if (!oidcEnabled || oidcEnabled === "false") {
        return;
      }

      const oidcIssuerUrl = await this.configService.getValue("oidcIssuerUrl");
      const oidcClientId = await this.configService.getValue("oidcClientId");
      const oidcClientSecret = await this.configService.getValue("oidcClientSecret");

      if (!oidcIssuerUrl || !oidcClientId || !oidcClientSecret) {
        return;
      }

      this.openidClient = await import("openid-client");

      const issuerUrl = new URL(oidcIssuerUrl);
      this.config = await this.openidClient.discovery(issuerUrl, oidcClientId, oidcClientSecret);
      this.issuer = this.config;

      this.client = this.issuer;

      this.initialized = true;
    } catch (error) {
      console.error("Error initializing OIDC client:", error);
    }
  }

  private async getRedirectUri(requestContext?: { protocol: string; host: string; headers: any }): Promise<string> {
    try {
      const oidcRedirectUri = await this.configService.getValue("oidcRedirectUri");
      if (oidcRedirectUri) {
        return oidcRedirectUri;
      }
    } catch (error) {
      console.error("Error getting redirect URI:", error);
    }

    if (!requestContext) {
      throw new Error("Request context is required for OIDC redirect URI auto-detection");
    }

    const headers = requestContext.headers || {};

    let protocol = requestContext.protocol;
    if (headers["x-forwarded-proto"]) {
      protocol = headers["x-forwarded-proto"];
    }

    let host = requestContext.host;
    if (headers["x-forwarded-host"]) {
      host = headers["x-forwarded-host"];
    }

    const frontendUrl = `${protocol}://${host}`;
    const redirectUri = `${frontendUrl}/api/auth/oidc/callback`;

    return redirectUri;
  }

  public async isEnabled(): Promise<boolean> {
    try {
      const oidcEnabled = await this.configService.getValue("oidcEnabled");
      if (oidcEnabled !== "true") {
        return false;
      }

      const oidcIssuerUrl = await this.configService.getValue("oidcIssuerUrl");
      const oidcClientId = await this.configService.getValue("oidcClientId");
      const oidcClientSecret = await this.configService.getValue("oidcClientSecret");

      return !!(oidcIssuerUrl && oidcClientId && oidcClientSecret);
    } catch (error) {
      console.error("Error checking if OIDC is enabled:", error);
      return false;
    }
  }

  public async reinitialize(): Promise<void> {
    this.initialized = false;
    this.client = null;
    this.issuer = null;
    await this.initializeClient();
  }

  public async getDebugStatus(): Promise<any> {
    try {
      const oidcEnabled = await this.configService.getValue("oidcEnabled");
      const oidcIssuerUrl = await this.configService.getValue("oidcIssuerUrl");
      const oidcClientId = await this.configService.getValue("oidcClientId");
      const oidcClientSecret = await this.configService.getValue("oidcClientSecret");

      let initError = null;
      if (!this.initialized) {
        try {
          const openidClient = await import("openid-client");

          const issuerUrl = new URL(oidcIssuerUrl);
          await openidClient.discovery(issuerUrl, oidcClientId, oidcClientSecret);
        } catch (err) {
          initError = err instanceof Error ? err.message : String(err);
        }
      }

      return {
        initialized: this.initialized,
        clientExists: !!this.client,
        issuerExists: !!this.issuer,
        initError: initError,
        config: {
          enabled: oidcEnabled,
          issuerUrl: oidcIssuerUrl,
          clientId: oidcClientId ? "[SET]" : "[NOT SET]",
          clientSecret: oidcClientSecret ? "[SET]" : "[NOT SET]",
        },
        issuerMetadata: this.issuer?.metadata || null,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
        initialized: this.initialized,
        clientExists: !!this.client,
        issuerExists: !!this.issuer,
      };
    }
  }

  public async getAuthorizationUrl(
    state?: string,
    redirectUri?: string,
    requestContext?: { protocol: string; host: string; headers: any }
  ): Promise<string> {
    if (!this.initialized) {
      throw new Error("OIDC client not initialized");
    }

    try {
      const codeVerifier = this.openidClient.randomPKCECodeVerifier();
      const codeChallenge = await this.openidClient.calculatePKCECodeChallenge(codeVerifier);

      const sessionId = state || crypto.randomBytes(32).toString("hex");
      this.storeCodeVerifier(sessionId, codeVerifier);

      const oidcScope = await this.configService.getValue("oidcScope");
      const defaultRedirectUri = await this.getRedirectUri(requestContext);
      const finalRedirectUri = redirectUri || defaultRedirectUri;
      const finalState = sessionId;

      const oidcClientId = await this.configService.getValue("oidcClientId");
      const oidcIssuerUrl = await this.configService.getValue("oidcIssuerUrl");

      const authBaseUrl = this.config?.authorization_endpoint || `${oidcIssuerUrl.replace(/\/$/, "")}/authorize`;

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
      return authUrl;
    } catch (error) {
      console.error("Error in getAuthorizationUrl:", error);
      throw error;
    }
  }

  public async handleCallback(
    code: string,
    state?: string,
    currentUrl?: string
  ): Promise<{
    userInfo: OIDCUserInfo;
    tokenSet: any;
  }> {
    console.log("🔄 OIDC Service: handleCallback started");
    console.log("📝 Input params:", {
      code: code?.substring(0, 20) + "...",
      state,
      currentUrl,
    });

    if (!this.initialized) {
      console.log("❌ OIDC client not initialized");
      throw new Error("OIDC client not initialized");
    }

    try {
      console.log("🔐 Getting code verifier for state:", state);
      const codeVerifier = this.getCodeVerifier(state);
      console.log("✅ Code verifier retrieved");

      if (!currentUrl) {
        throw new Error("Current URL is required for OIDC callback handling");
      }

      const mappedUrl = currentUrl.replace("/auth/oidc/callback", "/api/auth/oidc/callback");
      const callbackUrl = new URL(mappedUrl);
      console.log("📍 Callback URL constructed:", callbackUrl.toString());

      const oidcClientId = await this.configService.getValue("oidcClientId");
      const oidcClientSecret = await this.configService.getValue("oidcClientSecret");
      console.log("🔑 OIDC credentials:", {
        clientId: oidcClientId?.substring(0, 10) + "...",
        hasSecret: !!oidcClientSecret,
      });

      if (!this.config) {
        console.log("❌ OIDC configuration not initialized");
        throw new Error("OIDC configuration not initialized");
      }
      console.log("✅ OIDC config available");

      try {
        console.log("🔄 Exchanging authorization code for tokens...");
        const tokenSet = await this.openidClient.authorizationCodeGrant(this.config, callbackUrl, {
          client_id: oidcClientId,
          client_secret: oidcClientSecret,
          pkceCodeVerifier: codeVerifier,
          expectedState: state,
        });
        console.log("✅ Token exchange successful");
        console.log("🎫 Token set received:", {
          hasAccessToken: !!tokenSet.access_token,
          hasIdToken: !!tokenSet.id_token,
          hasRefreshToken: !!tokenSet.refresh_token,
        });

        let userInfo: any;
        try {
          let subject: string;

          if (tokenSet.id_token) {
            console.log("🔍 Parsing ID token...");
            const idTokenPayload = JSON.parse(Buffer.from(tokenSet.id_token.split(".")[1], "base64").toString());
            subject = idTokenPayload.sub;
            console.log("✅ Subject from ID token:", subject);
          } else {
            console.log("❌ ID token not present in response");
            throw new Error("ID token not present in response");
          }

          console.log("🔄 Fetching user info...");
          userInfo = await this.openidClient.fetchUserInfo(this.config, tokenSet.access_token, subject);
          console.log("✅ User info fetched successfully:", {
            sub: userInfo.sub,
            email: userInfo.email,
            name: userInfo.name,
          });
        } catch (userInfoError: any) {
          console.error("❌ Failed to fetch user info:", userInfoError);
          throw new Error(`Failed to fetch user info: ${userInfoError.message}`);
        }

        this.removeCodeVerifier(state);
        console.log("🧹 Code verifier cleaned up");
        console.log("✅ OIDC Service: handleCallback completed successfully");
        return { userInfo, tokenSet };
      } catch (tokenError: any) {
        console.error("❌ Token exchange error:", tokenError);
        console.error("❌ Token error details:", {
          message: tokenError.message,
          stack: tokenError.stack,
          response: tokenError.response,
          status: tokenError.status,
          statusText: tokenError.statusText,
          data: tokenError.data,
        });
        throw new Error(`Failed to exchange authorization code: ${tokenError.message}`);
      }
    } catch (error: any) {
      console.log("❌ OIDC Service: handleCallback failed");
      console.error("Error details:", error);
      this.removeCodeVerifier(state);
      throw error;
    }
  }

  public async findOrCreateUser(userInfo: OIDCUserInfo): Promise<any> {
    if (!userInfo.email) {
      throw new Error("Email is required from OIDC provider");
    }

    let user = await prisma.user.findUnique({
      where: { email: userInfo.email },
      include: { authProviders: true },
    });

    if (user) {
      const hasOidcProvider = user.authProviders.some((provider) => provider.provider === "oidc");

      if (!hasOidcProvider) {
        await prisma.userAuthProvider.create({
          data: {
            userId: user.id,
            provider: "oidc",
            providerId: userInfo.sub,
            metadata: JSON.stringify({
              issuer: await this.configService.getValue("oidcIssuerUrl"),
              email: userInfo.email,
              name: userInfo.name,
              picture: userInfo.picture,
            }),
          },
        });
      }

      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: user.firstName || userInfo.given_name,
          lastName: user.lastName || userInfo.family_name,
          image: user.image || userInfo.picture,
        },
        include: { authProviders: true },
      });
    } else {
      const oidcAutoRegister = await this.configService.getValue("oidcAutoRegister");
      if (oidcAutoRegister === "false") {
        throw new Error("User registration via OIDC is disabled and no existing user found");
      }

      const isAdmin = await this.isAdminEmail(userInfo.email);

      user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email: userInfo.email!,
            firstName: userInfo.given_name || userInfo.name?.split(" ")[0] || "Unknown",
            lastName: userInfo.family_name || userInfo.name?.split(" ").slice(1).join(" ") || "User",
            username: userInfo.preferred_username || userInfo.email!.split("@")[0],
            isAdmin,
            isActive: true,
            image: userInfo.picture || null,
            password: null,
          },
          include: { authProviders: true },
        });

        await tx.userAuthProvider.create({
          data: {
            userId: newUser.id,
            provider: "oidc",
            providerId: userInfo.sub,
            metadata: JSON.stringify({
              issuer: await this.configService.getValue("oidcIssuerUrl"),
              email: userInfo.email,
              name: userInfo.name,
              picture: userInfo.picture,
            }),
          },
        });

        return newUser;
      });
    }

    return user;
  }

  private async isAdminEmail(email: string): Promise<boolean> {
    try {
      const oidcAdminEmailDomains = await this.configService.getValue("oidcAdminEmailDomains");
      if (!oidcAdminEmailDomains) {
        return false;
      }

      const adminDomains = oidcAdminEmailDomains.split(",").map((d) => d.trim());
      const emailDomain = email.split("@")[1];

      return adminDomains.includes(emailDomain);
    } catch (error) {
      console.error("Error checking admin email:", error);
      return false;
    }
  }

  public async getConfiguration(requestContext?: { protocol: string; host: string; headers: any }) {
    try {
      if (!requestContext) {
        throw new Error("Request context is required for OIDC configuration");
      }

      const enabled = await this.isEnabled();
      const oidcIssuerUrl = await this.configService.getValue("oidcIssuerUrl");
      const oidcScope = await this.configService.getValue("oidcScope");

      let authUrl: string | undefined;
      if (enabled) {
        try {
          if (this.initialized && this.client) {
            authUrl = await this.getAuthorizationUrl(undefined, undefined, requestContext);
          } else {
            const { protocol, host } = requestContext;
            const baseUrl = `${protocol}://${host}`;
            authUrl = `${baseUrl}/api/auth/oidc/authorize`;
          }
        } catch (error) {
          console.error("Error generating authorization URL:", error);
          const { protocol, host } = requestContext;
          const baseUrl = `${protocol}://${host}`;
          authUrl = `${baseUrl}/api/auth/oidc/authorize`;
        }
      }

      return {
        enabled,
        issuer: oidcIssuerUrl,
        authUrl,
        scopes: oidcScope?.split(" ") || [],
      };
    } catch (error) {
      console.error("Error getting configuration:", error);
      return {
        enabled: false,
        issuer: undefined,
        authUrl: undefined,
        scopes: [],
      };
    }
  }

  private codeVerifiers = new Map<string, { verifier: string; timestamp: number }>();

  private storeCodeVerifier(sessionId: string, verifier: string) {
    this.codeVerifiers.set(sessionId, {
      verifier,
      timestamp: Date.now(),
    });

    setTimeout(
      () => {
        const entry = this.codeVerifiers.get(sessionId);
        if (entry && Date.now() - entry.timestamp > 10 * 60 * 1000) {
          this.codeVerifiers.delete(sessionId);
        }
      },
      10 * 60 * 1000
    );
  }

  private getCodeVerifier(sessionId?: string): string {
    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    const entry = this.codeVerifiers.get(sessionId);
    if (!entry) {
      const newVerifier = this.openidClient.randomPKCECodeVerifier();
      this.storeCodeVerifier(sessionId, newVerifier);
      return newVerifier;
    }

    return entry.verifier;
  }

  private removeCodeVerifier(sessionId?: string) {
    if (sessionId) {
      this.codeVerifiers.delete(sessionId);
    }
  }
}
