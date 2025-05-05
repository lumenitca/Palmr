import type { AxiosRequestConfig } from "axios";

import apiInstance from "@/config/api";
import type {
  DeleteFileResult,
  GetDownloadUrlResult,
  GetPresignedUrlParams,
  GetPresignedUrlResult,
  ListFilesResult,
  RegisterFileBody,
  RegisterFileResult,
  CheckFileBody,
  CheckFileResult,
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
  return apiInstance.get(`/api/files/generate-presigned-url`, {
    ...options,
    params: { ...params, ...options?.params },
  });
};


/**
 * Checks if the file meets constraints like MAX_FILESIZE
 * @summary Check file for constraints
 */
export const checkFile = <TData = CheckFileResult>(
  CheckFileBody: CheckFileBody,
  options?: AxiosRequestConfig
): Promise<TData> => {
  return apiInstance.post(`/api/files/check`, CheckFileBody, options);
};


/**
 * Registers file metadata in the database
 * @summary Register File Metadata
 */
export const registerFile = <TData = RegisterFileResult>(
  registerFileBody: RegisterFileBody,
  options?: AxiosRequestConfig
): Promise<TData> => {
  return apiInstance.post(`/api/files/register`, registerFileBody, options);
};

/**
 * Lists user files
 * @summary List Files
 */
export const listFiles = <TData = ListFilesResult>(options?: AxiosRequestConfig): Promise<TData> => {
  return apiInstance.get(`/api/files/list`, options);
};

/**
 * Generates a pre-signed URL for downloading a private file
 * @summary Get Download URL
 */
export const getDownloadUrl = <TData = GetDownloadUrlResult>(
  objectName: string,
  options?: AxiosRequestConfig
): Promise<TData> => {
  return apiInstance.get(`/api/files/${objectName}/download`, options);
};

/**
 * Deletes a user file
 * @summary Delete File
 */
export const deleteFile = <TData = DeleteFileResult>(id: string, options?: AxiosRequestConfig): Promise<TData> => {
  return apiInstance.delete(`/api/files/delete/${id}`, options);
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
  return apiInstance.patch(`/api/files/update/${id}`, updateFileBody, options);
};
