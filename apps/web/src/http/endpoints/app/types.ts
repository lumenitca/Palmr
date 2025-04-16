import type { AxiosResponse } from "axios";

import type {
  CheckHealth200,
  CheckUploadAllowed200,
  CheckUploadAllowedParams,
  GetAppInfo200,
  GetDiskSpace200,
  RemoveLogo200,
  UploadLogo200,
  UploadLogoBody,
} from "../../models";

export type GetAppInfoResult = AxiosResponse<GetAppInfo200>;
export type UploadLogoResult = AxiosResponse<UploadLogo200>;
export type RemoveLogoResult = AxiosResponse<RemoveLogo200>;
export type CheckHealthResult = AxiosResponse<CheckHealth200>;
export type GetDiskSpaceResult = AxiosResponse<GetDiskSpace200>;
export type CheckUploadAllowedResult = AxiosResponse<CheckUploadAllowed200>;

export type { UploadLogoBody, CheckUploadAllowedParams };
