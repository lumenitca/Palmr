import type {
  CreateShare201,
  CreateShareBody,
  UpdateShare200,
  UpdateShareBody,
  ListUserShares200,
  GetShare200,
  GetShareParams,
  DeleteShare200,
  UpdateSharePassword200,
  UpdateSharePasswordBody,
  AddFiles200,
  AddFilesBody,
  RemoveFiles200,
  RemoveFilesBody,
  AddRecipients200,
  AddRecipientsBody,
  RemoveRecipients200,
  RemoveRecipientsBody,
  CreateShareAlias200,
  CreateShareAliasBody,
  GetShareByAlias200,
  GetShareByAliasParams,
  NotifyRecipients200,
  NotifyRecipientsBody,
} from "../../models";
import type { AxiosResponse } from "axios";

export type CreateShareResult = AxiosResponse<CreateShare201>;
export type UpdateShareResult = AxiosResponse<UpdateShare200>;
export type ListUserSharesResult = AxiosResponse<ListUserShares200>;
export type GetShareResult = AxiosResponse<GetShare200>;
export type DeleteShareResult = AxiosResponse<DeleteShare200>;
export type UpdateSharePasswordResult = AxiosResponse<UpdateSharePassword200>;
export type AddFilesResult = AxiosResponse<AddFiles200>;
export type RemoveFilesResult = AxiosResponse<RemoveFiles200>;
export type AddRecipientsResult = AxiosResponse<AddRecipients200>;
export type RemoveRecipientsResult = AxiosResponse<RemoveRecipients200>;
export type CreateShareAliasResult = AxiosResponse<CreateShareAlias200>;
export type GetShareByAliasResult = AxiosResponse<GetShareByAlias200>;
export type NotifyRecipientsResult = AxiosResponse<NotifyRecipients200>;

export type {
  CreateShareBody,
  UpdateShareBody,
  GetShareParams,
  UpdateSharePasswordBody,
  AddFilesBody,
  RemoveFilesBody,
  AddRecipientsBody,
  RemoveRecipientsBody,
  CreateShareAliasBody,
  GetShareByAliasParams,
  NotifyRecipientsBody,
};
