import type {
  GetAppInfoResult,
  UploadLogoResult,
  RemoveLogoResult,
  CheckHealthResult,
  GetDiskSpaceResult,
  CheckUploadAllowedResult,
  UploadLogoBody,
  CheckUploadAllowedParams,
} from "./types";
import axiosInstance from "@/config/axios";
import type { AxiosRequestConfig } from "axios";

/**
 * Get application base information
 * @summary Get application base information
 */
export const getAppInfo = <TData = GetAppInfoResult>(options?: AxiosRequestConfig): Promise<TData> => {
  return axiosInstance.get(`/app/info`, options);
};

/**
 * Upload a new app logo (admin only)
 * @summary Upload app logo
 */
export const uploadLogo = <TData = UploadLogoResult>(
  uploadLogoBody: UploadLogoBody,
  options?: AxiosRequestConfig
): Promise<TData> => {
  const formData = new FormData();

  if (uploadLogoBody.file !== undefined) {
    formData.append("file", uploadLogoBody.file as Blob);
  }

  return axiosInstance.post(`/app/logo`, formData, {
    ...options,
    headers: {
      ...options?.headers,
      "Content-Type": "multipart/form-data",
    },
  });
};

/**
 * Remove the current app logo (admin only)
 * @summary Remove app logo
 */
export const removeLogo = <TData = RemoveLogoResult>(options?: AxiosRequestConfig): Promise<TData> => {
  return axiosInstance.delete(`/app/logo`, options);
};

/**
 * Returns the health status of the API
 * @summary Check API Health
 */
export const checkHealth = <TData = CheckHealthResult>(options?: AxiosRequestConfig): Promise<TData> => {
  return axiosInstance.get(`/health`, options);
};

/**
 * Get server disk space information
 * @summary Get server disk space information
 */
export const getDiskSpace = <TData = GetDiskSpaceResult>(options?: AxiosRequestConfig): Promise<TData> => {
  return axiosInstance.get(`/storage/disk-space`, options);
};

/**
 * Check if file upload is allowed based on available space (fileSize in bytes)
 * @summary Check if file upload is allowed
 */
export const checkUploadAllowed = <TData = CheckUploadAllowedResult>(
  params: CheckUploadAllowedParams,
  options?: AxiosRequestConfig
): Promise<TData> => {
  return axiosInstance.get(`/storage/check-upload`, {
    ...options,
    params: { ...params, ...options?.params },
  });
};
