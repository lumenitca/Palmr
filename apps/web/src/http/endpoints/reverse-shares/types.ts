import type { AxiosResponse } from "axios";

// Create Reverse Share
export type CreateReverseShareBody = {
  name?: string;
  description?: string;
  expiration?: string;
  maxFiles?: number | null;
  maxFileSize?: number | null;
  allowedFileTypes?: string | null;
  password?: string;
  pageLayout?: "WETRANSFER" | "DEFAULT";
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
    createdAt: string;
    updatedAt: string;
    creatorId: string;
    files: ReverseShareFile[];
  };
}>;

// Update Reverse Share
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
    createdAt: string;
    updatedAt: string;
    creatorId: string;
    files: ReverseShareFile[];
  };
}>;

// List User Reverse Shares
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

// Get Reverse Share
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

// Delete Reverse Share
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
    createdAt: string;
    updatedAt: string;
    creatorId: string;
    files: ReverseShareFile[];
  };
}>;

// Get Reverse Share for Upload (Public)
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
  };
}>;

// Update Password
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

// Presigned URL
export type GetPresignedUrlBody = {
  objectName: string;
};

export type GetPresignedUrlResult = AxiosResponse<{
  url: string;
  expiresIn: number;
}>;

// Register File Upload
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

// Check Password
export type CheckReverseSharePasswordBody = {
  password: string;
};

export type CheckReverseSharePasswordResult = AxiosResponse<{
  valid: boolean;
}>;

// Download File
export type DownloadReverseShareFileResult = AxiosResponse<{
  url: string;
  expiresIn: number;
}>;

// Delete File
export type DeleteReverseShareFileResult = AxiosResponse<{
  file: ReverseShareFile;
}>;

// Shared Type
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

// Activate Reverse Share
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

// Deactivate Reverse Share
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

// Update Reverse Share File
export type UpdateReverseShareFileBody = {
  name?: string;
  description?: string | null;
};

export type UpdateReverseShareFileResult = AxiosResponse<{
  file: ReverseShareFile;
}>;
