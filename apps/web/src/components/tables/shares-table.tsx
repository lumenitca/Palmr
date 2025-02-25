import { useShareContext } from "../../contexts/ShareContext";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/dropdown";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/table";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import {
  FaEdit,
  FaTrash,
  FaUsers,
  FaFolder,
  FaEllipsisV,
  FaLock,
  FaUnlock,
  FaEye,
  FaCopy,
  FaLink,
  FaEnvelope,
} from "react-icons/fa";

export interface SharesTableProps {
  shares: any[];
  onDelete: (share: any) => void;
  onEdit: (share: any) => void;
  onManageFiles: (share: any) => void;
  onManageRecipients: (share: any) => void;
  onViewDetails: (share: any) => void;
  onGenerateLink: (share: any) => void;
  onCopyLink: (share: any) => void;
  onNotifyRecipients: (share: any) => void;
}

export function SharesTable({
  shares,
  onDelete,
  onEdit,
  onManageFiles,
  onManageRecipients,
  onViewDetails,
  onGenerateLink,
  onCopyLink,
  onNotifyRecipients,
}: SharesTableProps) {
  const { t } = useTranslation();
  const { smtpEnabled } = useShareContext();

  return (
    <Table aria-label={t("sharesTable.ariaLabel")}>
      <TableHeader>
        <TableColumn>{t("sharesTable.columns.name")}</TableColumn>
        <TableColumn>{t("sharesTable.columns.createdAt")}</TableColumn>
        <TableColumn>{t("sharesTable.columns.expiresAt")}</TableColumn>
        <TableColumn>{t("sharesTable.columns.status")}</TableColumn>
        <TableColumn>{t("sharesTable.columns.security")}</TableColumn>
        <TableColumn>{t("sharesTable.columns.files")}</TableColumn>
        <TableColumn>{t("sharesTable.columns.recipients")}</TableColumn>
        <TableColumn className="w-[70px]">{t("sharesTable.columns.actions")}</TableColumn>
      </TableHeader>
      <TableBody>
        {shares.map((share) => (
          <TableRow key={share.id}>
            <TableCell>{share.name}</TableCell>
            <TableCell>{format(new Date(share.createdAt), "MM/dd/yyyy HH:mm")}</TableCell>
            <TableCell>
              {share.expiration ? format(new Date(share.expiration), "MM/dd/yyyy HH:mm") : t("sharesTable.never")}
            </TableCell>
            <TableCell>
              <Chip
                color={!share.expiration ? "success" : new Date(share.expiration) > new Date() ? "success" : "danger"}
                variant="flat"
              >
                {!share.expiration
                  ? t("sharesTable.status.neverExpires")
                  : new Date(share.expiration) > new Date()
                    ? t("sharesTable.status.active")
                    : t("sharesTable.status.expired")}
              </Chip>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {share.security.hasPassword ? (
                  <Chip color="warning" startContent={<FaLock className="ml-1.5 text-sm" />} variant="flat">
                    {t("sharesTable.security.protected")}
                  </Chip>
                ) : (
                  <Chip color="success" startContent={<FaUnlock className="ml-1.5 text-sm" />} variant="flat">
                    {t("sharesTable.security.public")}
                  </Chip>
                )}
              </div>
            </TableCell>
            <TableCell>{t("sharesTable.filesCount", { count: share.files?.length || 0 })}</TableCell>
            <TableCell>{t("sharesTable.recipientsCount", { count: share.recipients?.length || 0 })}</TableCell>
            <TableCell className="text-right">
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Button isIconOnly aria-label={t("sharesTable.actions.menu")} variant="light">
                    <FaEllipsisV />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem key="edit" startContent={<FaEdit />} onPress={() => onEdit(share)}>
                    {t("sharesTable.actions.edit")}
                  </DropdownItem>
                  <DropdownItem key="files" startContent={<FaFolder />} onPress={() => onManageFiles(share)}>
                    {t("sharesTable.actions.manageFiles")}
                  </DropdownItem>
                  <DropdownItem key="recipients" startContent={<FaUsers />} onPress={() => onManageRecipients(share)}>
                    {t("sharesTable.actions.manageRecipients")}
                  </DropdownItem>
                  <DropdownItem
                    key="view"
                    startContent={<FaEye className="text-sm" />}
                    onPress={() => onViewDetails(share)}
                  >
                    {t("sharesTable.actions.viewDetails")}
                  </DropdownItem>
                  <DropdownItem key="generateLink" startContent={<FaLink />} onPress={() => onGenerateLink(share)}>
                    {share.alias ? t("sharesTable.actions.editLink") : t("sharesTable.actions.generateLink")}
                  </DropdownItem>
                  {share.alias && (
                    <DropdownItem key="copyLink" startContent={<FaCopy />} onPress={() => onCopyLink(share)}>
                      {t("sharesTable.actions.copyLink")}
                    </DropdownItem>
                  )}
                  {share.recipients?.length > 0 && share.alias && smtpEnabled === "true" && (
                    <DropdownItem key="notify" startContent={<FaEnvelope />} onPress={() => onNotifyRecipients(share)}>
                      {t("sharesTable.actions.notifyRecipients")}
                    </DropdownItem>
                  )}
                  <DropdownItem
                    key="delete"
                    className="text-danger"
                    color="danger"
                    startContent={<FaTrash />}
                    onPress={() => onDelete(share)}
                  >
                    {t("sharesTable.actions.delete")}
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
