import type {
  LoginResult,
  LogoutResult,
  RequestPasswordResetResult,
  ResetPasswordResult,
  GetCurrentUserResult,
  LoginBody,
  RequestPasswordResetBody,
  ResetPasswordBody,
} from "./types";
import axiosInstance from "@/config/axios";
import type { AxiosRequestConfig } from "axios";

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
