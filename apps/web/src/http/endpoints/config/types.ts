import type { AxiosResponse } from "axios";

import type {
  BulkUpdateConfigs200,
  BulkUpdateConfigsBodyItem,
  GetAllConfigs200,
  UpdateConfig200,
  UpdateConfigBody,
} from "../../models";

export type UpdateConfigResult = AxiosResponse<UpdateConfig200>;
export type GetAllConfigsResult = AxiosResponse<GetAllConfigs200>;
export type BulkUpdateConfigsResult = AxiosResponse<BulkUpdateConfigs200>;

export type { UpdateConfigBody, BulkUpdateConfigsBodyItem };
