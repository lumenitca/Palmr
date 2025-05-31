import { prisma } from "../../shared/prisma";
import { ConfigService } from "../config/service";
import { EmailService } from "../email/service";
import { UserResponseSchema } from "../user/dto";
import { PrismaUserRepository } from "../user/repository";
import { LoginInput } from "./dto";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

export class AuthService {
  private userRepository = new PrismaUserRepository();
  private configService = new ConfigService();
  private emailService = new EmailService();

  async login(data: LoginInput) {
    const user = await this.userRepository.findUserByEmail(data.email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    if (!user.isActive) {
      throw new Error("Account is inactive. Please contact an administrator.");
    }

    const maxAttempts = Number(await this.configService.getValue("maxLoginAttempts"));
    const blockDurationSeconds = Number(await this.configService.getValue("loginBlockDuration"));
    const blockDuration = blockDurationSeconds * 1000;

    const loginAttempt = await prisma.loginAttempt.findUnique({
      where: { userId: user.id },
    });

    if (loginAttempt) {
      if (loginAttempt.attempts >= maxAttempts && Date.now() - loginAttempt.lastAttempt.getTime() < blockDuration) {
        const remainingTime = Math.ceil(
          (blockDuration - (Date.now() - loginAttempt.lastAttempt.getTime())) / 1000 / 60
        );
        throw new Error(`Too many failed attempts. Please try again in ${remainingTime} minutes.`);
      }

      if (Date.now() - loginAttempt.lastAttempt.getTime() >= blockDuration) {
        await prisma.loginAttempt.delete({
          where: { userId: user.id },
        });
      }
    }

    const isValid = await bcrypt.compare(data.password, user.password);

    if (!isValid) {
      await prisma.loginAttempt.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          attempts: 1,
          lastAttempt: new Date(),
        },
        update: {
          attempts: {
            increment: 1,
          },
          lastAttempt: new Date(),
        },
      });

      throw new Error("Invalid credentials");
    }

    if (loginAttempt) {
      await prisma.loginAttempt.delete({
        where: { userId: user.id },
      });
    }

    return UserResponseSchema.parse(user);
  }

  async validateLogin(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { loginAttempts: true },
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    if (user.loginAttempts) {
      const maxAttempts = Number(await this.configService.getValue("maxLoginAttempts"));
      const blockDurationSeconds = Number(await this.configService.getValue("loginBlockDuration"));
      const blockDuration = blockDurationSeconds * 1000;

      if (
        user.loginAttempts.attempts >= maxAttempts &&
        Date.now() - user.loginAttempts.lastAttempt.getTime() < blockDuration
      ) {
        const remainingTime = Math.ceil(
          (blockDuration - (Date.now() - user.loginAttempts.lastAttempt.getTime())) / 1000 / 60
        );
        throw new Error(`Too many failed attempts. Please try again in ${remainingTime} minutes.`);
      }

      if (Date.now() - user.loginAttempts.lastAttempt.getTime() >= blockDuration) {
        await prisma.loginAttempt.delete({
          where: { userId: user.id },
        });
      }
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      await prisma.loginAttempt.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          attempts: 1,
          lastAttempt: new Date(),
        },
        update: {
          attempts: {
            increment: 1,
          },
          lastAttempt: new Date(),
        },
      });

      throw new Error("Invalid credentials");
    }

    if (user.loginAttempts) {
      await prisma.loginAttempt.delete({
        where: { userId: user.id },
      });
    }

    return user;
  }

  async requestPasswordReset(email: string, origin: string) {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      return;
    }

    const token = crypto.randomBytes(128).toString("hex");
    const expirationSeconds = Number(await this.configService.getValue("passwordResetTokenExpiration"));

    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + expirationSeconds * 1000),
      },
    });

    try {
      await this.emailService.sendPasswordResetEmail(email, token, origin);
    } catch (error) {
      console.error("Failed to send password reset email:", error);
      throw new Error("Failed to send password reset email");
    }
  }

  async resetPassword(token: string, newPassword: string) {
    const resetRequest = await prisma.passwordReset.findFirst({
      where: {
        token,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!resetRequest) {
      throw new Error("Invalid or expired reset token");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRequest.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordReset.update({
        where: { id: resetRequest.id },
        data: { used: true },
      }),
    ]);
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new Error("User not found");
    }
    return UserResponseSchema.parse(user);
  }
}
