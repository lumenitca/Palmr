import type {
  RegisterUser201,
  RegisterUserBody,
  ListUsers200Item,
  UpdateUser200,
  UpdateUserBody,
  GetUserById200,
  DeleteUser200,
  ActivateUser200,
  DeactivateUser200,
  UpdateUserImage200,
  UpdateUserImageBody,
  UploadAvatar200,
  UploadAvatarBody,
  RemoveAvatar200,
} from "../../models";
import type { AxiosResponse } from "axios";

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
