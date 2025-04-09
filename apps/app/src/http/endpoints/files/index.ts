import type { AxiosRequestConfig } from "axios";

import axiosInstance from "@/config/axios";
import type {
  DeleteFileResult,
  GetDownloadUrlResult,
  GetPresignedUrlParams,
  GetPresignedUrlResult,
  ListFilesResult,
  RegisterFileBody,
  RegisterFileResult,
  UpdateFileBody,
  UpdateFileResult,
} from "./types";

/**
 * Generates a pre-signed URL for direct upload to MinIO
 * @summary Get Presigned URL
 */
export const getPresignedUrl = <TData = GetPresignedUrlResult>(
  params: GetPresignedUrlParams,
  options?: AxiosRequestConfig
): Promise<TData> => {
  return axiosInstance.get(`/files/presigned-url`, {
    ...options,
    params: { ...params, ...options?.params },
  });
};

/**
 * Registers file metadata in the database
 * @summary Register File Metadata
 */
export const registerFile = <TData = RegisterFileResult>(
  registerFileBody: RegisterFileBody,
  options?: AxiosRequestConfig
): Promise<TData> => {
  return axiosInstance.post(`/files`, registerFileBody, options);
};

/**
 * Lists user files
 * @summary List Files
 */
export const listFiles = <TData = ListFilesResult>(options?: AxiosRequestConfig): Promise<TData> => {
  return axiosInstance.get(`/files`, options);
};

/**
 * Generates a pre-signed URL for downloading a private file
 * @summary Get Download URL
 */
export const getDownloadUrl = <TData = GetDownloadUrlResult>(
  objectName: string,
  options?: AxiosRequestConfig
): Promise<TData> => {
  return axiosInstance.get(`/files/${objectName}/download`, options);
};

/**
 * Deletes a user file
 * @summary Delete File
 */
export const deleteFile = <TData = DeleteFileResult>(id: string, options?: AxiosRequestConfig): Promise<TData> => {
  return axiosInstance.delete(`/files/${id}`, options);
};

/**
 * Updates file metadata in the database
 * @summary Update File Metadata
 */
export const updateFile = <TData = UpdateFileResult>(
  id: string,
  updateFileBody: UpdateFileBody,
  options?: AxiosRequestConfig
): Promise<TData> => {
  return axiosInstance.patch(`/files/${id}`, updateFileBody, options);
};
