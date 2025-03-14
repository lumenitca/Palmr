import { AvatarService } from "./avatar.service";
import { UpdateUserSchema, createRegisterUserSchema } from "./dto";
import { UserService } from "./service";
import { FastifyReply, FastifyRequest } from "fastify";
import multer from 'multer';
import path from 'path';
import { Request, Response } from 'express';
import fs from 'fs';

const uploadsDir = "/app/uploads/avatars";
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
    return cb(new Error('Only images are allowed'));
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

export class UserController {
  private userService = new UserService();
  private avatarService = new AvatarService();

  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const schema = await createRegisterUserSchema();
      const input = schema.parse(request.body);
      const user = await this.userService.register(input);
      return reply.status(201).send({ user, message: "User created successfully" });
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }

  async listUsers(request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await this.userService.listUsers();
      return reply.send(users);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }

  async getUserById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const user = await this.userService.getUserById(id);
      return reply.send(user);
    } catch (error: any) {
      return reply.status(404).send({ error: error.message });
    }
  }

  async updateUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const input = UpdateUserSchema.parse(request.body);
      const { id, ...updateData } = input;
      const updatedUser = await this.userService.updateUser(id, updateData);
      return reply.send(updatedUser);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }

  async activateUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const user = await this.userService.activateUser(id);
      return reply.send(user);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }

  async deactivateUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const user = await this.userService.deactivateUser(id);
      return reply.send(user);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }

  async deleteUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const user = await this.userService.deleteUser(id);
      return reply.send(user);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }

  async updateUserImage(request: FastifyRequest, reply: FastifyReply) {
    try {
      const input = UpdateUserSchema.parse(request.body);
      const { id, ...updateData } = input;
      const updatedUser = await this.userService.updateUser(id, updateData);
      return reply.send(updatedUser);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }

  async uploadAvatar(request: FastifyRequest, reply: FastifyReply) {
    if (!request.isMultipart()) {
      return reply.status(400).send({ error: "Request must be multipart/form-data" });
    }

    const userId = (request as any).user?.userId;
    if (!userId) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    return new Promise((resolve) => {
      const rawRequest = request.raw;
      rawRequest.headers = request.headers;

      upload(rawRequest as Request, reply.raw as Response, async (err) => {
        if (err) {
          console.error("Upload error:", err);
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
          const imageUrl = await this.avatarService.uploadAvatar(userId, file.path);
          const updatedUser = await this.userService.updateUserImage(userId, imageUrl);
          resolve(reply.send(updatedUser));
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

  async removeAvatar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as any).user?.userId;
      if (!userId) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      const user = await this.userService.getUserById(userId);
      if (user.image) {
        await this.avatarService.deleteAvatar(user.image);
        const updatedUser = await this.userService.updateUserImage(userId, null);
        return reply.send(updatedUser);
      }

      return reply.send(user);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }
}
