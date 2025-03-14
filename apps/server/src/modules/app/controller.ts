import { LogoService } from "./logo.service";
import { AppService } from "./service";
import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../shared/prisma";
import multer from 'multer';
import path from 'path';
import { Request, Response } from 'express';
import fs from 'fs';

const uploadsDir = path.join(process.cwd(), 'uploads/logo');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  if (!file.mimetype.startsWith('image/')) {
    cb(new Error('Only images are allowed'));
    return;
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 
  }
}).single('file');

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
    if (!request.isMultipart()) {
      return reply.status(400).send({ error: "Request must be multipart/form-data" });
    }

    return new Promise((resolve) => {
      const rawRequest = request.raw;
      rawRequest.headers = request.headers;

      upload(rawRequest as Request, reply.raw as Response, async (err) => {
        if (err) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return resolve(reply.status(400).send({ error: "File size cannot be larger than 5MB" }));
          }
          return resolve(reply.status(400).send({ error: err.message }));
        }

        const file = (rawRequest as any).file;
        if (!file) {
          return resolve(reply.status(400).send({ error: "No file uploaded" }));
        }

        try {
          const imageUrl = await this.logoService.uploadLogo(file.path);
          
          const currentLogo = await this.appService.updateConfig("appLogo", imageUrl);
          if (currentLogo && currentLogo.value !== imageUrl) {
            await this.logoService.deleteLogo(currentLogo.value);
          }

          resolve(reply.send({ logo: imageUrl }));
        } catch (error: any) {
          try {
            if (fs.existsSync(file.path)) {
              await fs.promises.unlink(file.path);
            }
          } catch (cleanupError) {
            console.error("Error cleaning up temp file:", cleanupError);
          }
          console.error("Upload error:", error);
          resolve(reply.status(400).send({ error: error.message }));
        }
      });
    });
  }

  async removeLogo(request: FastifyRequest, reply: FastifyReply) {
    try {
      const currentConfig = await prisma.appConfig.findUnique({
        where: { key: "appLogo" }
      });
      
      if (currentConfig && currentConfig.value) {
        await this.logoService.deleteLogo(currentConfig.value);

        await this.appService.updateConfig("appLogo", "");
      } else {
        console.error("No logo found to delete");
      }
      
      return reply.send({ message: "Logo removed successfully" });
    } catch (error: any) {
      console.error("Logo removal error:", error);
      return reply.status(400).send({ error: error.message });
    }
  }
}
