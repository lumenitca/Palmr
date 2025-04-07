import type {
  GetAppInfo200,
  UploadLogo200,
  UploadLogoBody,
  RemoveLogo200,
  CheckHealth200,
  GetDiskSpace200,
  CheckUploadAllowed200,
  CheckUploadAllowedParams,
} from "../../models";
import type { AxiosResponse } from "axios";

export type GetAppInfoResult = AxiosResponse<GetAppInfo200>;
export type UploadLogoResult = AxiosResponse<UploadLogo200>;
export type RemoveLogoResult = AxiosResponse<RemoveLogo200>;
export type CheckHealthResult = AxiosResponse<CheckHealth200>;
export type GetDiskSpaceResult = AxiosResponse<GetDiskSpace200>;
export type CheckUploadAllowedResult = AxiosResponse<CheckUploadAllowed200>;

export type { UploadLogoBody, CheckUploadAllowedParams };
