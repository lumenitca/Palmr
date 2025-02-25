import { LogoService } from "./logo.service";
import { AppService } from "./service";
import { MultipartFile } from "@fastify/multipart";
import { FastifyReply, FastifyRequest } from "fastify";

export class AppController {
  private appService = new AppService();
  private logoService = new LogoService();

  async getAppInfo(request: FastifyRequest, reply: FastifyReply) {
    try {
      const appInfo = await this.appService.getAppInfo();
      return reply.send(appInfo);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }

  async getAllConfigs(request: FastifyRequest, reply: FastifyReply) {
    try {
      const configs = await this.appService.getAllConfigs();
      return reply.send({ configs });
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }

  async updateConfig(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { key } = request.params as { key: string };
      const { value } = request.body as { value: string };

      const config = await this.appService.updateConfig(key, value);
      return reply.send({ config });
    } catch (error: any) {
      if (error.message === "Configuration not found") {
        return reply.status(404).send({ error: error.message });
      }
      return reply.status(400).send({ error: error.message });
    }
  }

  async bulkUpdateConfigs(request: FastifyRequest, reply: FastifyReply) {
    try {
      const updates = request.body as Array<{ key: string; value: string }>;
      const configs = await this.appService.bulkUpdateConfigs(updates);
      return reply.send({ configs });
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }

  async uploadLogo(request: FastifyRequest, reply: FastifyReply) {
    try {
      const file = (request.body as any).file as MultipartFile;
      if (!file) {
        return reply.status(400).send({ error: "No file uploaded" });
      }

      const buffer = await file.toBuffer();
      const imageUrl = await this.logoService.uploadLogo(buffer);

      // Get current logo URL to delete it
      const currentLogo = await this.appService.updateConfig("appLogo", imageUrl);
      if (currentLogo && currentLogo.value !== imageUrl) {
        await this.logoService.deleteLogo(currentLogo.value);
      }

      return reply.send({ logo: imageUrl });
    } catch (error: any) {
      console.error("Upload error:", error);
      return reply.status(400).send({ error: error.message });
    }
  }

  async removeLogo(request: FastifyRequest, reply: FastifyReply) {
    try {
      const currentLogo = await this.appService.updateConfig("appLogo", "");
      if (currentLogo && currentLogo.value) {
        await this.logoService.deleteLogo(currentLogo.value);
      }
      return reply.send({ message: "Logo removed successfully" });
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }
}
