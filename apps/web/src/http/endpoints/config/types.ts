import type {
  UpdateConfig200,
  UpdateConfigBody,
  GetAllConfigs200,
  BulkUpdateConfigs200,
  BulkUpdateConfigsBodyItem,
} from "../../models";
import type { AxiosResponse } from "axios";

export type UpdateConfigResult = AxiosResponse<UpdateConfig200>;
export type GetAllConfigsResult = AxiosResponse<GetAllConfigs200>;
export type BulkUpdateConfigsResult = AxiosResponse<BulkUpdateConfigs200>;

export type { UpdateConfigBody, BulkUpdateConfigsBodyItem };
