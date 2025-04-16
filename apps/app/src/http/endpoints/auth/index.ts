import type { AxiosRequestConfig } from "axios";

import apiInstance from "@/config/api";
import type {
  GetCurrentUserResult,
  LoginBody,
  LoginResult,
  LogoutResult,
  RequestPasswordResetBody,
  RequestPasswordResetResult,
  ResetPasswordBody,
  ResetPasswordResult,
} from "./types";

export const login = <TData = LoginResult>(loginBody: LoginBody, options?: AxiosRequestConfig): Promise<TData> => {
  return apiInstance.post(`/api/auth/login`, loginBody, options);
};

export const logout = <TData = LogoutResult>(options?: AxiosRequestConfig): Promise<TData> => {
  return apiInstance.post(`/api/auth/logout`, undefined, options);
};

export const requestPasswordReset = <TData = RequestPasswordResetResult>(
  requestPasswordResetBody: RequestPasswordResetBody,
  options?: AxiosRequestConfig
): Promise<TData> => {
  return apiInstance.post(`/api/auth/forgot-password`, requestPasswordResetBody, options);
};

export const resetPassword = <TData = ResetPasswordResult>(
  resetPasswordBody: ResetPasswordBody,
  options?: AxiosRequestConfig
): Promise<TData> => {
  return apiInstance.post(`/api/auth/reset-password`, resetPasswordBody, options);
};

export const getCurrentUser = <TData = GetCurrentUserResult>(options?: AxiosRequestConfig): Promise<TData> => {
  return apiInstance.get(`/api/auth/me`, options);
};
