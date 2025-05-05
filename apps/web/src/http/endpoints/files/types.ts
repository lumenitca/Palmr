import type { AxiosResponse } from "axios";

import type {
  DeleteFile200,
  GetDownloadUrl200,
  GetPresignedUrl200,
  GetPresignedUrlParams,
  ListFiles200,
  RegisterFile201,
  CheckFile201,
  CheckFileBody,
  RegisterFileBody,
  UpdateFile200,
  UpdateFileBody,
} from "../../models";

export type GetPresignedUrlResult = AxiosResponse<GetPresignedUrl200>;
export type RegisterFileResult = AxiosResponse<RegisterFile201>;
export type CheckFileResult = AxiosResponse<CheckFile201>;
export type ListFilesResult = AxiosResponse<ListFiles200>;
export type GetDownloadUrlResult = AxiosResponse<GetDownloadUrl200>;
export type DeleteFileResult = AxiosResponse<DeleteFile200>;
export type UpdateFileResult = AxiosResponse<UpdateFile200>;

export type { GetPresignedUrlParams, RegisterFileBody, UpdateFileBody, CheckFileBody };
