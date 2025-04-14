import { UserActionsDropdownProps } from "../types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useTranslations } from "next-intl";
import {
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconCheck,
  IconBan
} from "@tabler/icons-react";

export function UserActionsDropdown({
  user,
  isCurrentUser,
  onEdit,
  onDelete,
  onToggleStatus,
}: UserActionsDropdownProps) {
  const t = useTranslations();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className={isCurrentUser ? "hidden" : ""}
          disabled={isCurrentUser}
        >
          <IconDotsVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => onEdit(user)}>
          <IconEdit className="mr-2 h-4 w-4" />
          {t("users.actions.edit")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onToggleStatus(user)}>
          {user.isActive ? (
            <IconBan className="mr-2 h-4 w-4" />
          ) : (
            <IconCheck className="mr-2 h-4 w-4" />
          )}
          {user.isActive ? t("users.actions.deactivate") : t("users.actions.activate")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDelete(user)}
          className="text-destructive"
        >
          <IconTrash className="mr-2 h-4 w-4" />
          {t("users.actions.delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
