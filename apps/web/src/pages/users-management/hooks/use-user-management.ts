import { useAuth } from "@/contexts/auth-context";
import { listUsers, registerUser, updateUser, deleteUser, activateUser, deactivateUser } from "@/http/endpoints";
import type { ListUsers200Item } from "@/http/models";
import { useDisclosure } from "@heroui/modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { TFunction } from "i18next";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";

const createSchemas = (t: TFunction) => ({
  userSchema: z.object({
    firstName: z.string().min(1, t("validation.firstNameRequired")),
    lastName: z.string().min(1, t("validation.lastNameRequired")),
    username: z
      .string()
      .min(3, t("validation.usernameLength"))
      .regex(/^[^\s]+$/, t("validation.usernameSpaces")),
    email: z.string().email(t("validation.invalidEmail")),
    password: z.string().min(8, t("validation.passwordLength")).or(z.literal("")),
    isAdmin: z
      .union([z.enum(["true", "false"]), z.boolean()])
      .transform((val) => (typeof val === "string" ? val === "true" : val))
      .optional(),
  }),
});

export type UserFormData = z.infer<ReturnType<typeof createSchemas>["userSchema"]>;

export function useUserManagement() {
  const { t } = useTranslation();
  const { userSchema } = createSchemas(t);
  const [users, setUsers] = useState<ListUsers200Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<ListUsers200Item | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [deleteModalUser, setDeleteModalUser] = useState<ListUsers200Item | null>(null);
  const [statusModalUser, setStatusModalUser] = useState<ListUsers200Item | null>(null);

  const { user: currentUser } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
  const { isOpen: isStatusModalOpen, onOpen: onStatusModalOpen, onClose: onStatusModalClose } = useDisclosure();

  const formMethods = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  const loadUsers = async () => {
    try {
      const response = await listUsers();

      setUsers(response.data);
    } catch (error) {
      toast.error(t("users.errors.loadFailed"));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = () => {
    setModalMode("create");
    setSelectedUser(null);
    formMethods.reset({});
    onOpen();
  };

  const handleEditUser = (user: ListUsers200Item) => {
    setModalMode("edit");
    setSelectedUser(user);
    formMethods.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      password: "",
    });
    onOpen();
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      if (modalMode === "create") {
        await registerUser(data);
        toast.success(t("users.messages.createSuccess"));
      } else {
        if (!selectedUser) return;
        const updateData = {
          ...data,
          id: selectedUser.id,
        } as { id: string } & Partial<typeof data>;

        if (!data.password || data.password.trim() === "") {
          delete updateData.password;
        }

        await updateUser(updateData);
        toast.success(t("users.messages.updateSuccess"));
      }
      onClose();
      loadUsers();
    } catch (error) {
      toast.error(t("users.errors.submitFailed", { mode: t(`users.modes.${modalMode}`) }));
      console.error(error);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteModalUser) return;

    try {
      await deleteUser(deleteModalUser.id);
      toast.success(t("users.messages.deleteSuccess"));
      loadUsers();
      onDeleteModalClose();
    } catch (error) {
      toast.error(t("users.errors.deleteFailed"));
      console.error(error);
    }
  };

  const handleToggleUserStatus = async () => {
    if (!statusModalUser) return;

    try {
      if (statusModalUser.isActive) {
        await deactivateUser(statusModalUser.id);
        toast.success(t("users.messages.deactivateSuccess"));
      } else {
        await activateUser(statusModalUser.id);
        toast.success(t("users.messages.activateSuccess"));
      }
      loadUsers();
      onStatusModalClose();
    } catch (error) {
      toast.error(t("users.errors.statusUpdateFailed"));
      console.error(error);
    }
  };

  return {
    users,
    isLoading,
    currentUser,
    selectedUser,
    deleteModalUser,
    statusModalUser,
    modals: {
      isOpen,
      onOpen,
      onClose,
      modalMode,
      isDeleteModalOpen,
      onDeleteModalOpen,
      onDeleteModalClose,
      isStatusModalOpen,
      onStatusModalOpen,
      onStatusModalClose,
      setDeleteModalUser,
      setStatusModalUser,
    },
    handleCreateUser,
    handleEditUser,
    handleDeleteUser,
    handleToggleUserStatus,
    onSubmit,
    formMethods,
  };
}
