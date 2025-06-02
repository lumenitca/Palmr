import { useEffect, useRef, useState } from "react";
import {
  IconCheck,
  IconCopy,
  IconDotsVertical,
  IconEdit,
  IconEye,
  IconFolder,
  IconLink,
  IconLock,
  IconLockOpen,
  IconMail,
  IconTrash,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useShareContext } from "../../contexts/share-context";

export interface SharesTableProps {
  shares: any[];
  onDelete: (share: any) => void;
  onEdit: (share: any) => void;
  onUpdateName: (shareId: string, newName: string) => void;
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
  onUpdateName,
  onManageFiles,
  onManageRecipients,
  onViewDetails,
  onGenerateLink,
  onCopyLink,
  onNotifyRecipients,
}: SharesTableProps) {
  const t = useTranslations();
  const { smtpEnabled } = useShareContext();
  const [editingShareId, setEditingShareId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [hoveredShareId, setHoveredShareId] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<{ [shareId: string]: { name?: string } }>({});
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingShareId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingShareId]);

  // Clear pending changes when shares are updated
  useEffect(() => {
    setPendingChanges({});
  }, [shares]);

  const startEdit = (shareId: string, currentName: string) => {
    setEditingShareId(shareId);
    setEditValue(currentName);
  };

  const saveEdit = () => {
    if (!editingShareId) return;

    // Update local state optimistically
    setPendingChanges((prev) => ({
      ...prev,
      [editingShareId]: { name: editValue },
    }));

    onUpdateName(editingShareId, editValue);
    setEditingShareId(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    setEditingShareId(null);
    setEditValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveEdit();
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  };

  const getDisplayName = (share: any) => {
    const pendingChange = pendingChanges[share.id];
    if (pendingChange && pendingChange.name !== undefined) {
      return pendingChange.name;
    }
    return share.name;
  };

  return (
    <div className="rounded-lg shadow-sm overflow-hidden border">
      <Table>
        <TableHeader>
          <TableRow className="border-b-0">
            <TableHead className="h-10 text-xs font-bold text-muted-foreground bg-muted/50 px-4">
              {t("sharesTable.columns.name")}
            </TableHead>
            <TableHead className="h-10 text-xs font-bold text-muted-foreground bg-muted/50 px-4">
              {t("sharesTable.columns.createdAt")}
            </TableHead>
            <TableHead className="h-10 text-xs font-bold text-muted-foreground bg-muted/50 px-4">
              {t("sharesTable.columns.expiresAt")}
            </TableHead>
            <TableHead className="h-10 text-xs font-bold text-muted-foreground bg-muted/50 px-4">
              {t("sharesTable.columns.status")}
            </TableHead>
            <TableHead className="h-10 text-xs font-bold text-muted-foreground bg-muted/50 px-4">
              {t("sharesTable.columns.security")}
            </TableHead>
            <TableHead className="h-10 text-xs font-bold text-muted-foreground bg-muted/50 px-4">
              {t("sharesTable.columns.files")}
            </TableHead>
            <TableHead className="h-10 text-xs font-bold text-muted-foreground bg-muted/50 px-4">
              {t("sharesTable.columns.recipients")}
            </TableHead>
            <TableHead className="h-10 w-[70px] text-xs font-bold text-muted-foreground bg-muted/50 px-4">
              {t("sharesTable.columns.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shares.map((share) => {
            const isEditing = editingShareId === share.id;
            const isHovering = hoveredShareId === share.id;
            const displayName = getDisplayName(share);

            return (
              <TableRow key={share.id} className="hover:bg-muted/50 transition-colors border-0">
                <TableCell className="h-12 px-4 border-0">
                  <div
                    className="flex items-center gap-1 min-w-0"
                    onMouseEnter={() => setHoveredShareId(share.id)}
                    onMouseLeave={() => setHoveredShareId(null)}
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-1 flex-1">
                        <Input
                          ref={inputRef}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="h-8 text-sm font-medium"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-green-600 hover:text-green-700 flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            saveEdit();
                          }}
                        >
                          <IconCheck className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-red-600 hover:text-red-700 flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelEdit();
                          }}
                        >
                          <IconX className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        <span className="truncate max-w-[200px] font-medium" title={displayName}>
                          {displayName}
                        </span>
                        <div className="w-6 flex justify-center flex-shrink-0">
                          {isHovering && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 text-muted-foreground hover:text-foreground hidden sm:block"
                              onClick={(e) => {
                                e.stopPropagation();
                                startEdit(share.id, displayName);
                              }}
                            >
                              <IconEdit className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="h-12 px-4">{format(new Date(share.createdAt), "MM/dd/yyyy HH:mm")}</TableCell>
                <TableCell className="h-12 px-4">
                  {share.expiration ? format(new Date(share.expiration), "MM/dd/yyyy HH:mm") : t("sharesTable.never")}
                </TableCell>
                <TableCell className="h-12 px-4">
                  <Badge
                    variant="secondary"
                    className={
                      !share.expiration || new Date(share.expiration) > new Date()
                        ? "bg-green-500/20 hover:bg-green-500/30 text-green-500"
                        : "bg-red-500/20 hover:bg-red-500/30 text-red-500"
                    }
                  >
                    {!share.expiration
                      ? t("sharesTable.status.neverExpires")
                      : new Date(share.expiration) > new Date()
                        ? t("sharesTable.status.active")
                        : t("sharesTable.status.expired")}
                  </Badge>
                </TableCell>
                <TableCell className="h-12 px-4">
                  <Badge
                    variant="secondary"
                    className={`flex items-center gap-1 ${
                      share.security.hasPassword
                        ? "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500"
                        : "bg-green-500/20 hover:bg-green-500/30 text-green-500"
                    }`}
                  >
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
                <TableCell className="h-12 px-4">
                  {share.files?.length || 0} {t("sharesTable.filesCount")}
                </TableCell>
                <TableCell className="h-12 px-4">
                  {share.recipients?.length || 0} {t("sharesTable.recipientsCount")}
                </TableCell>
                <TableCell className="h-12 px-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted cursor-pointer">
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
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
