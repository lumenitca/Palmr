import { prisma } from "../../shared/prisma";
import { ConfigService } from "../config/service";

export class AppService {
  private configService = new ConfigService();

  async getAppInfo() {
    const [appName, appDescription, appLogo] = await Promise.all([
      this.configService.getValue("appName"),
      this.configService.getValue("appDescription"),
      this.configService.getValue("appLogo"),
    ]);

    return {
      appName,
      appDescription,
      appLogo,
    };
  }

  async getAllConfigs() {
    return prisma.appConfig.findMany({
      where: {
        key: {
          not: "jwtSecret",
        },
      },
      orderBy: {
        group: "asc",
      },
    });
  }

  async updateConfig(key: string, value: string) {
    if (key === "jwtSecret") {
      throw new Error("JWT Secret cannot be updated through this endpoint");
    }

    const config = await prisma.appConfig.findUnique({
      where: { key },
    });

    if (!config) {
      throw new Error("Configuration not found");
    }

    return prisma.appConfig.update({
      where: { key },
      data: { value },
    });
  }

  async bulkUpdateConfigs(updates: Array<{ key: string; value: string }>) {
    if (updates.some((update) => update.key === "jwtSecret")) {
      throw new Error("JWT Secret cannot be updated through this endpoint");
    }

    const keys = updates.map((update) => update.key);
    const existingConfigs = await prisma.appConfig.findMany({
      where: { key: { in: keys } },
    });

    if (existingConfigs.length !== keys.length) {
      const existingKeys = existingConfigs.map((config) => config.key);
      const missingKeys = keys.filter((key) => !existingKeys.includes(key));
      throw new Error(`Configurations not found: ${missingKeys.join(", ")}`);
    }

    return prisma.$transaction(
      updates.map((update) =>
        prisma.appConfig.update({
          where: { key: update.key },
          data: { value: update.value },
        })
      )
    );
  }
}
