"use client";

import { useState } from "react";
import { IconLock } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PasswordModalProps {
  isOpen: boolean;
  onSubmit: (password: string) => void;
  onClose: () => void;
}

export function PasswordModal({ isOpen, onSubmit, onClose }: PasswordModalProps) {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(password);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
            <IconLock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <DialogTitle>Link Protegido</DialogTitle>
          <DialogDescription>Este link está protegido por senha. Digite a senha para continuar.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Digite a senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={!password.trim() || isSubmitting}>
              {isSubmitting ? "Verificando..." : "Continuar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
