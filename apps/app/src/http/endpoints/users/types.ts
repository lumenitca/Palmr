import type { AxiosResponse } from "axios";

import type {
  ActivateUser200,
  DeactivateUser200,
  DeleteUser200,
  GetUserById200,
  ListUsers200Item,
  RegisterUser201,
  RegisterUserBody,
  RemoveAvatar200,
  UpdateUser200,
  UpdateUserBody,
  UpdateUserImage200,
  UpdateUserImageBody,
  UploadAvatar200,
  UploadAvatarBody,
} from "../../models";

export type RegisterUserResult = AxiosResponse<RegisterUser201>;
export type ListUsersResult = AxiosResponse<ListUsers200Item[]>;
export type UpdateUserResult = AxiosResponse<UpdateUser200>;
export type GetUserByIdResult = AxiosResponse<GetUserById200>;
export type DeleteUserResult = AxiosResponse<DeleteUser200>;
export type ActivateUserResult = AxiosResponse<ActivateUser200>;
export type DeactivateUserResult = AxiosResponse<DeactivateUser200>;
export type UpdateUserImageResult = AxiosResponse<UpdateUserImage200>;
export type UploadAvatarResult = AxiosResponse<UploadAvatar200>;
export type RemoveAvatarResult = AxiosResponse<RemoveAvatar200>;

export type { RegisterUserBody, UpdateUserBody, UpdateUserImageBody, UploadAvatarBody };
