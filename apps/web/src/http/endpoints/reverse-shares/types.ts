import type { AxiosResponse } from "axios";

export type FieldRequirement = "HIDDEN" | "OPTIONAL" | "REQUIRED";

export type CreateReverseShareBody = {
  name?: string;
  description?: string;
  expiration?: string;
  maxFiles?: number | null;
  maxFileSize?: number | null;
  allowedFileTypes?: string | null;
  password?: string;
  pageLayout?: "WETRANSFER" | "DEFAULT";
  nameFieldRequired?: FieldRequirement;
  emailFieldRequired?: FieldRequirement;
};

export type CreateReverseShareResult = AxiosResponse<{
  reverseShare: {
    id: string;
    name: string | null;
    description: string | null;
    expiration: string | null;
    maxFiles: number | null;
    maxFileSize: number | null;
    allowedFileTypes: string | null;
    pageLayout: string;
    isActive: boolean;
    hasPassword: boolean;
    nameFieldRequired: string;
    emailFieldRequired: string;
    createdAt: string;
    updatedAt: string;
    creatorId: string;
    files: ReverseShareFile[];
  };
}>;

export type UpdateReverseShareBody = {
  id: string;
  name?: string;
  description?: string;
  expiration?: string;
  maxFiles?: number | null;
  maxFileSize?: number | null;
  allowedFileTypes?: string | null;
  password?: string | null;
  pageLayout?: "WETRANSFER" | "DEFAULT";
  isActive?: boolean;
  nameFieldRequired?: FieldRequirement;
  emailFieldRequired?: FieldRequirement;
};

export type UpdateReverseShareResult = AxiosResponse<{
  reverseShare: {
    id: string;
    name: string | null;
    description: string | null;
    expiration: string | null;
    maxFiles: number | null;
    maxFileSize: number | null;
    allowedFileTypes: string | null;
    pageLayout: string;
    isActive: boolean;
    hasPassword: boolean;
    nameFieldRequired: string;
    emailFieldRequired: string;
    createdAt: string;
    updatedAt: string;
    creatorId: string;
    files: ReverseShareFile[];
  };
}>;

export type ListUserReverseSharesResult = AxiosResponse<{
  reverseShares: {
    id: string;
    name: string | null;
    description: string | null;
    expiration: string | null;
    maxFiles: number | null;
    maxFileSize: number | null;
    allowedFileTypes: string | null;
    pageLayout: string;
    isActive: boolean;
    hasPassword: boolean;
    nameFieldRequired: string;
    emailFieldRequired: string;
    createdAt: string;
    updatedAt: string;
    creatorId: string;
    files: ReverseShareFile[];
    alias?: {
      id: string;
      alias: string;
      reverseShareId: string;
      createdAt: string;
      updatedAt: string;
    } | null;
  }[];
}>;

export type GetReverseShareResult = AxiosResponse<{
  reverseShare: {
    id: string;
    name: string | null;
    description: string | null;
    expiration: string | null;
    maxFiles: number | null;
    maxFileSize: number | null;
    allowedFileTypes: string | null;
    pageLayout: string;
    isActive: boolean;
    hasPassword: boolean;
    nameFieldRequired: string;
    emailFieldRequired: string;
    createdAt: string;
    updatedAt: string;
    creatorId: string;
    files: ReverseShareFile[];
    alias?: {
      id: string;
      alias: string;
      reverseShareId: string;
      createdAt: string;
      updatedAt: string;
    } | null;
  };
}>;

export type DeleteReverseShareResult = AxiosResponse<{
  reverseShare: {
    id: string;
    name: string | null;
    description: string | null;
    expiration: string | null;
    maxFiles: number | null;
    maxFileSize: number | null;
    allowedFileTypes: string | null;
    pageLayout: string;
    isActive: boolean;
    hasPassword: boolean;
    nameFieldRequired: string;
    emailFieldRequired: string;
    createdAt: string;
    updatedAt: string;
    creatorId: string;
    files: ReverseShareFile[];
  };
}>;

export type GetReverseShareForUploadParams = {
  password?: string;
};

export type GetReverseShareForUploadResult = AxiosResponse<{
  reverseShare: {
    id: string;
    name: string | null;
    description: string | null;
    maxFiles: number | null;
    maxFileSize: number | null;
    allowedFileTypes: string | null;
    pageLayout: string;
    hasPassword: boolean;
    currentFileCount: number;
    nameFieldRequired: string;
    emailFieldRequired: string;
  };
}>;

export type UpdateReverseSharePasswordBody = {
  password: string | null;
};

export type UpdateReverseSharePasswordResult = AxiosResponse<{
  reverseShare: {
    id: string;
    name: string | null;
    description: string | null;
    expiration: string | null;
    maxFiles: number | null;
    maxFileSize: number | null;
    allowedFileTypes: string | null;
    pageLayout: string;
    isActive: boolean;
    hasPassword: boolean;
    createdAt: string;
    updatedAt: string;
    creatorId: string;
    files: ReverseShareFile[];
  };
}>;

export type GetPresignedUrlBody = {
  objectName: string;
};

export type GetPresignedUrlResult = AxiosResponse<{
  url: string;
  expiresIn: number;
}>;

export type RegisterFileUploadBody = {
  name: string;
  description?: string;
  extension: string;
  size: number;
  objectName: string;
  uploaderEmail?: string;
  uploaderName?: string;
};

export type RegisterFileUploadParams = {
  password?: string;
};

export type RegisterFileUploadResult = AxiosResponse<{
  file: ReverseShareFile;
}>;

export type CheckReverseSharePasswordBody = {
  password: string;
};

export type CheckReverseSharePasswordResult = AxiosResponse<{
  valid: boolean;
}>;

export type DownloadReverseShareFileResult = AxiosResponse<{
  url: string;
  expiresIn: number;
}>;

export type DeleteReverseShareFileResult = AxiosResponse<{
  file: ReverseShareFile;
}>;

export type ReverseShareFile = {
  id: string;
  name: string;
  description: string | null;
  extension: string;
  size: string;
  objectName: string;
  uploaderEmail: string | null;
  uploaderName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ActivateReverseShareResult = AxiosResponse<{
  reverseShare: {
    id: string;
    name: string | null;
    description: string | null;
    expiration: string | null;
    maxFiles: number | null;
    maxFileSize: number | null;
    allowedFileTypes: string | null;
    pageLayout: string;
    isActive: boolean;
    hasPassword: boolean;
    createdAt: string;
    updatedAt: string;
    creatorId: string;
    files: ReverseShareFile[];
  };
}>;

export type DeactivateReverseShareResult = AxiosResponse<{
  reverseShare: {
    id: string;
    name: string | null;
    description: string | null;
    expiration: string | null;
    maxFiles: number | null;
    maxFileSize: number | null;
    allowedFileTypes: string | null;
    pageLayout: string;
    isActive: boolean;
    hasPassword: boolean;
    createdAt: string;
    updatedAt: string;
    creatorId: string;
    files: ReverseShareFile[];
  };
}>;

export type UpdateReverseShareFileBody = {
  name?: string;
  description?: string | null;
};

export type UpdateReverseShareFileResult = AxiosResponse<{
  file: ReverseShareFile;
}>;
