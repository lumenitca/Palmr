import { UsersTableProps } from "../types";
import { UserActionsDropdown } from "./user-actions-dropdown";
import { Avatar } from "@heroui/avatar";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { useTranslation } from "react-i18next";

export function UsersTable({ users, currentUser, onEdit, onDelete, onToggleStatus }: UsersTableProps) {
  const { t } = useTranslation();
  const isCurrentUser = (userId: string) => currentUser?.id === userId;

  return (
    <Card>
      <CardBody>
        <Table>
          <TableHeader>
            <TableColumn>{t("users.table.user")}</TableColumn>
            <TableColumn>{t("users.table.email")}</TableColumn>
            <TableColumn>{t("users.table.status")}</TableColumn>
            <TableColumn>{t("users.table.role")}</TableColumn>
            <TableColumn>{t("users.table.actions")}</TableColumn>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar src={user.image || undefined} />
                    <div>
                      <p className="font-semibold">{`${user.firstName} ${user.lastName}`}</p>
                      <p className="text-small text-default-500">{user.username}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip color={user.isActive ? "primary" : "danger"} radius="sm" variant="dot">
                    {user.isActive ? t("users.table.active") : t("users.table.inactive")}
                  </Chip>
                </TableCell>
                <TableCell>
                  <Chip color={user.isAdmin ? "danger" : "default"} radius="sm" variant="faded">
                    {user.isAdmin ? t("users.table.admin") : t("users.table.userr")}
                  </Chip>
                </TableCell>
                <TableCell>
                  <UserActionsDropdown
                    isCurrentUser={isCurrentUser(user.id)}
                    user={user}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onToggleStatus={onToggleStatus}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
}
