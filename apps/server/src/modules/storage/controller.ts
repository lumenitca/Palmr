import { StorageService } from "./service";
import { FastifyRequest, FastifyReply } from "fastify";

export class StorageController {
  private storageService = new StorageService();

  async getDiskSpace(request: FastifyRequest, reply: FastifyReply) {
    try {
      let userId: string | undefined;
      let isAdmin = false;

      try {
        await request.jwtVerify();
        userId = (request as any).user?.userId;
        isAdmin = (request as any).user?.isAdmin || false;
      } catch (err) {
        return reply.status(401).send({
          error: "Unauthorized: a valid token is required to access this resource.",
        });
      }

      const diskSpace = await this.storageService.getDiskSpace(userId, isAdmin);
      return reply.send(diskSpace);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  async checkUploadAllowed(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { fileSize } = request.query as { fileSize: string };
      let userId: string | undefined;

      try {
        await request.jwtVerify();
        userId = (request as any).user?.userId;
      } catch (err) {
        return reply.status(401).send({
          error: "Unauthorized: a valid token is required to access this resource.",
        });
      }

      if (!fileSize) {
        return reply.status(400).send({
          error: "File size parameter is required (in bytes)",
        });
      }

      const result = await this.storageService.checkUploadAllowed(Number(fileSize), userId);
      return reply.send(result);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  }
}
