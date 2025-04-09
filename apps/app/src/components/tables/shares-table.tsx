import { useShareContext } from "../../contexts/share-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

import {
  IconEdit,
  IconTrash,
  IconUsers,
  IconFolder,
  IconDotsVertical,
  IconLock,
  IconLockOpen,
  IconEye,
  IconCopy,
  IconLink,
  IconMail,
} from "@tabler/icons-react";

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
  const t = useTranslations();
  const { smtpEnabled } = useShareContext();

  return (
    <div className="rounded-lg shadow-sm overflow-hidden border">
      <Table>
        <TableHeader>
          <TableRow className="border-b-0">
            <TableHead className="h-10 text-xs font-bold text-muted-foreground bg-muted/50">
              {t("sharesTable.columns.name")}
            </TableHead>
            <TableHead className="h-10 text-xs font-bold text-muted-foreground bg-muted/50">
              {t("sharesTable.columns.createdAt")}
            </TableHead>
            <TableHead className="h-10 text-xs font-bold text-muted-foreground bg-muted/50">
              {t("sharesTable.columns.expiresAt")}
            </TableHead>
            <TableHead className="h-10 text-xs font-bold text-muted-foreground bg-muted/50">
              {t("sharesTable.columns.status")}
            </TableHead>
            <TableHead className="h-10 text-xs font-bold text-muted-foreground bg-muted/50">
              {t("sharesTable.columns.security")}
            </TableHead>
            <TableHead className="h-10 text-xs font-bold text-muted-foreground bg-muted/50">
              {t("sharesTable.columns.files")}
            </TableHead>
            <TableHead className="h-10 text-xs font-bold text-muted-foreground bg-muted/50">
              {t("sharesTable.columns.recipients")}
            </TableHead>
            <TableHead className="h-10 w-[70px] text-xs font-bold text-muted-foreground bg-muted/50">
              {t("sharesTable.columns.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shares.map((share) => (
            <TableRow key={share.id} className="hover:bg-muted/50 transition-colors border-0">
              <TableCell className="h-12  border-0">{share.name}</TableCell>
              <TableCell className="h-12 ">{format(new Date(share.createdAt), "MM/dd/yyyy HH:mm")}</TableCell>
              <TableCell className="h-12 ">
                {share.expiration ? format(new Date(share.expiration), "MM/dd/yyyy HH:mm") : t("sharesTable.never")}
              </TableCell>
              <TableCell className="h-12 ">
                <Badge variant="secondary" className={
                  !share.expiration || new Date(share.expiration) > new Date()
                    ? "bg-green-500/20 hover:bg-green-500/30 text-green-500"
                    : "bg-red-500/20 hover:bg-red-500/30 text-red-500"
                }>
                  {!share.expiration
                    ? t("sharesTable.status.neverExpires")
                    : new Date(share.expiration) > new Date()
                      ? t("sharesTable.status.active")
                      : t("sharesTable.status.expired")}
                </Badge>
              </TableCell>
              <TableCell className="h-12 ">
                <Badge variant="secondary" className={`flex items-center gap-1 ${
                  share.security.hasPassword
                    ? "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500"
                    : "bg-green-500/20 hover:bg-green-500/30 text-green-500"
                }`}>
                  {share.security.hasPassword ? (
                    <IconLock className="h-4 w-4" />
                  ) : (
                    <IconLockOpen className="h-4 w-4" />
                  )}
                  {share.security.hasPassword
                    ? t("sharesTable.security.protected")
                    : t("sharesTable.security.public")}
                </Badge>
              </TableCell>
              <TableCell className="h-12">{ share.files?.length || 0 } {t("sharesTable.filesCount")}</TableCell>
              <TableCell className="h-12">{ share.recipients?.length || 0 } {t("sharesTable.recipientsCount")}</TableCell>
              <TableCell className="h-12 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-muted"
                    >
                      <IconDotsVertical className="h-4 w-4" />
                      <span className="sr-only">{t("sharesTable.actions.menu")}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuItem className="cursor-pointer py-2" onClick={() => onEdit(share)}>
                      <IconEdit className="mr-2 h-4 w-4" />
                      {t("sharesTable.actions.edit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer py-2" onClick={() => onManageFiles(share)}>
                      <IconFolder className="mr-2 h-4 w-4" />
                      {t("sharesTable.actions.manageFiles")}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer py-2" onClick={() => onManageRecipients(share)}>
                      <IconUsers className="mr-2 h-4 w-4" />
                      {t("sharesTable.actions.manageRecipients")}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer py-2" onClick={() => onViewDetails(share)}>
                      <IconEye className="mr-2 h-4 w-4" />
                      {t("sharesTable.actions.viewDetails")}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer py-2" onClick={() => onGenerateLink(share)}>
                      <IconLink className="mr-2 h-4 w-4" />
                      {share.alias ? t("sharesTable.actions.editLink") : t("sharesTable.actions.generateLink")}
                    </DropdownMenuItem>
                    {share.alias && (
                      <DropdownMenuItem className="cursor-pointer py-2" onClick={() => onCopyLink(share)}>
                        <IconCopy className="mr-2 h-4 w-4" />
                        {t("sharesTable.actions.copyLink")}
                      </DropdownMenuItem>
                    )}
                    {share.recipients?.length > 0 && share.alias && smtpEnabled === "true" && (
                      <DropdownMenuItem className="cursor-pointer py-2" onClick={() => onNotifyRecipients(share)}>
                        <IconMail className="mr-2 h-4 w-4" />
                        {t("sharesTable.actions.notifyRecipients")}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => onDelete(share)}
                      className="cursor-pointer py-2 text-destructive focus:text-destructive"
                    >
                      <IconTrash className="mr-2 h-4 w-4" />
                      {t("sharesTable.actions.delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
