import { UserActionsDropdownProps } from "../types";
import { Button } from "@heroui/button";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { useTranslation } from "react-i18next";
import { FaEllipsisV, FaEdit, FaTrash, FaCheck, FaBan } from "react-icons/fa";

export function UserActionsDropdown({
  user,
  isCurrentUser,
  onEdit,
  onDelete,
  onToggleStatus,
}: UserActionsDropdownProps) {
  const { t } = useTranslation();

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button isIconOnly className={isCurrentUser ? "hidden" : ""} isDisabled={isCurrentUser} variant="light">
          <FaEllipsisV />
        </Button>
      </DropdownTrigger>
      <DropdownMenu>
        <DropdownItem key="edit" startContent={<FaEdit />} onPress={() => onEdit(user)}>
          {t("users.actions.edit")}
        </DropdownItem>
        <DropdownItem
          key="toggle-status"
          startContent={user.isActive ? <FaBan /> : <FaCheck />}
          onPress={() => onToggleStatus(user)}
        >
          {user.isActive ? t("users.actions.deactivate") : t("users.actions.activate")}
        </DropdownItem>
        <DropdownItem
          key="delete"
          className="text-danger"
          color="danger"
          startContent={<FaTrash />}
          onPress={() => onDelete(user)}
        >
          {t("users.actions.delete")}
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
