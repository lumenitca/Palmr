import type {
  UpdateConfigResult,
  GetAllConfigsResult,
  BulkUpdateConfigsResult,
  UpdateConfigBody,
  BulkUpdateConfigsBodyItem,
} from "./types";
import axiosInstance from "@/config/axios";
import type { AxiosRequestConfig } from "axios";

/**
 * Update a configuration value (admin only)
 * @summary Update a configuration value
 */
export const updateConfig = <TData = UpdateConfigResult>(
  key: string,
  updateConfigBody: UpdateConfigBody,
  options?: AxiosRequestConfig
): Promise<TData> => {
  return axiosInstance.patch(`/app/configs/${key}`, updateConfigBody, options);
};

/**
 * List all configurations (admin only)
 * @summary List all configurations
 */
export const getAllConfigs = <TData = GetAllConfigsResult>(options?: AxiosRequestConfig): Promise<TData> => {
  return axiosInstance.get(`/app/configs`, options);
};

/**
 * Bulk update configuration values (admin only)
 * @summary Bulk update configuration values
 */
export const bulkUpdateConfigs = <TData = BulkUpdateConfigsResult>(
  bulkUpdateConfigsBodyItem: BulkUpdateConfigsBodyItem[],
  options?: AxiosRequestConfig
): Promise<TData> => {
  return axiosInstance.patch(`/app/configs`, bulkUpdateConfigsBodyItem, options);
};
