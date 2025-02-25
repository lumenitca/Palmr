import type {
  GetPresignedUrl200,
  GetPresignedUrlParams,
  RegisterFile201,
  RegisterFileBody,
  ListFiles200,
  GetDownloadUrl200,
  DeleteFile200,
  UpdateFile200,
  UpdateFileBody,
} from "../../models";
import type { AxiosResponse } from "axios";

export type GetPresignedUrlResult = AxiosResponse<GetPresignedUrl200>;
export type RegisterFileResult = AxiosResponse<RegisterFile201>;
export type ListFilesResult = AxiosResponse<ListFiles200>;
export type GetDownloadUrlResult = AxiosResponse<GetDownloadUrl200>;
export type DeleteFileResult = AxiosResponse<DeleteFile200>;
export type UpdateFileResult = AxiosResponse<UpdateFile200>;

export type { GetPresignedUrlParams, RegisterFileBody, UpdateFileBody };
