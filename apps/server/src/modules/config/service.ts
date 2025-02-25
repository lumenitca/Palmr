import { prisma } from "../../shared/prisma";

export class ConfigService {
  async getValue(key: string): Promise<string> {
    const config = await prisma.appConfig.findUnique({
      where: { key },
    });

    if (!config) {
      throw new Error(`Configuration ${key} not found`);
    }

    return config.value;
  }

  async getGroupConfigs(group: string) {
    const configs = await prisma.appConfig.findMany({
      where: { group },
    });

    return configs.reduce((acc, curr) => {
      let value: any = curr.value;

      switch (curr.type) {
        case "number":
          value = Number(value);
          break;
        case "boolean":
          value = value === "true";
          break;
        case "json":
          value = JSON.parse(value);
          break;
        case "bigint":
          value = BigInt(value);
          break;
      }

      return { ...acc, [curr.key]: value };
    }, {});
  }
}
