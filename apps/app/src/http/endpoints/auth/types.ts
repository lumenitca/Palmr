import type {
  Login200,
  LoginBody,
  Logout200,
  RequestPasswordReset200,
  RequestPasswordResetBody,
  ResetPassword200,
  ResetPasswordBody,
  GetCurrentUser200,
} from "../../models";
import type { AxiosResponse } from "axios";

export type LoginResult = AxiosResponse<Login200>;
export type LogoutResult = AxiosResponse<Logout200>;
export type RequestPasswordResetResult = AxiosResponse<RequestPasswordReset200>;
export type ResetPasswordResult = AxiosResponse<ResetPassword200>;
export type GetCurrentUserResult = AxiosResponse<GetCurrentUser200>;

export type { LoginBody, RequestPasswordResetBody, ResetPasswordBody };
