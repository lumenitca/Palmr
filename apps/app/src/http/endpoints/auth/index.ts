import type { AxiosRequestConfig } from "axios";

import axiosInstance from "@/config/axios";
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
  return axiosInstance.post(`/auth/login`, loginBody, options);
};

export const logout = <TData = LogoutResult>(options?: AxiosRequestConfig): Promise<TData> => {
  return axiosInstance.post(`/auth/logout`, undefined, options);
};

export const requestPasswordReset = <TData = RequestPasswordResetResult>(
  requestPasswordResetBody: RequestPasswordResetBody,
  options?: AxiosRequestConfig
): Promise<TData> => {
  return axiosInstance.post(`/auth/forgot-password`, requestPasswordResetBody, options);
};

export const resetPassword = <TData = ResetPasswordResult>(
  resetPasswordBody: ResetPasswordBody,
  options?: AxiosRequestConfig
): Promise<TData> => {
  return axiosInstance.post(`/auth/reset-password`, resetPasswordBody, options);
};

export const getCurrentUser = <TData = GetCurrentUserResult>(options?: AxiosRequestConfig): Promise<TData> => {
  return axiosInstance.get(`/auth/me`, options);
};
