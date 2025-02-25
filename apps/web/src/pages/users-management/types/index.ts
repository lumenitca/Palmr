import { UserFormData } from "../hooks/use-user-management";
import type { ListUsers200Item } from "@/http/models";
import { UseFormReturn } from "react-hook-form";

export interface UserActionsDropdownProps {
  user: ListUsers200Item;
  isCurrentUser: boolean;
  onEdit: (user: ListUsers200Item) => void;
  onDelete: (user: ListUsers200Item) => void;
  onToggleStatus: (user: ListUsers200Item) => void;
}

export interface UserDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: ListUsers200Item | null;
  onConfirm: () => Promise<void>;
}

export interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalMode: "create" | "edit";
  selectedUser: ListUsers200Item | null;
  formMethods: UseFormReturn<UserFormData>;
  onSubmit: (data: UserFormData) => Promise<void>;
}

export interface UserManagementModalsProps {
  modals: {
    isOpen: boolean;
    onClose: () => void;
    modalMode: "create" | "edit";
    isDeleteModalOpen: boolean;
    onDeleteModalClose: () => void;
    isStatusModalOpen: boolean;
    onStatusModalClose: () => void;
  };
  selectedUser: ListUsers200Item | null;
  deleteModalUser: ListUsers200Item | null;
  statusModalUser: ListUsers200Item | null;
  onSubmit: (data: UserFormData) => Promise<void>;
  onDelete: () => Promise<void>;
  onToggleStatus: () => Promise<void>;
  formMethods: UseFormReturn<UserFormData>;
}

export interface UserStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: ListUsers200Item | null;
  onConfirm: () => Promise<void>;
}

export interface UsersHeaderProps {
  onCreateUser: () => void;
}

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  image: string | null;
}

export interface UsersTableProps {
  users: ListUsers200Item[];
  currentUser: AuthUser | null;
  onEdit: (user: ListUsers200Item) => void;
  onDelete: (user: ListUsers200Item) => void;
  onToggleStatus: (user: ListUsers200Item) => void;
}
