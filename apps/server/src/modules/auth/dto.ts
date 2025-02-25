import { ConfigService } from "../config/service";
import { z } from "zod";

const configService = new ConfigService();

export const createPasswordSchema = async () => {
  const minLength = Number(await configService.getValue("passwordMinLength"));
  return z.string().min(minLength, `Password must be at least ${minLength} characters`).describe("User password");
};

export const LoginSchema = z.object({
  email: z.string().email("Invalid email").describe("User email"),
  password: z.string().min(6, "Password must be at least 6 characters").describe("User password"),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const RequestPasswordResetSchema = z.object({
  email: z.string().email("Invalid email").describe("User email"),
});

export const BaseResetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required").describe("Reset password token"),
});

export type BaseResetPasswordInput = z.infer<typeof BaseResetPasswordSchema>;

export const createResetPasswordSchema = async () => {
  const minLength = Number(await configService.getValue("passwordMinLength"));
  return BaseResetPasswordSchema.extend({
    password: z.string().min(minLength, `Password must be at least ${minLength} characters`).describe("User password"),
  });
};

export type ResetPasswordInput = BaseResetPasswordInput & {
  password: string;
};
