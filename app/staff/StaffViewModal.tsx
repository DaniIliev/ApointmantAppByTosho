"use client";

import React from "react";
import { Modal } from "@/components/customUIComponents/Modal";
import { StaffMember } from "./types";
import { useTranslation } from "react-i18next";

type StaffViewModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: StaffMember | null;
};

export const StaffViewModal: React.FC<StaffViewModalProps> = ({
  open,
  onOpenChange,
  staff,
}) => {
  const { t } = useTranslation();

  if (!staff) return null;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      label={t("Staff Details") as string}
      width="lg"
    >
      <div className="space-y-4 p-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">
              {t("First Name")}
            </label>
            <p className="text-base font-semibold">{staff.firstName}</p>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">
              {t("Last Name")}
            </label>
            <p className="text-base font-semibold">{staff.lastName}</p>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground">
            {t("Email")}
          </label>
          <p className="text-base font-semibold">{staff.email}</p>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground">
            {t("Phone")}
          </label>
          <p className="text-base font-semibold">{staff.phone}</p>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground">
            {t("Role")}
          </label>
          <p className="text-base font-semibold capitalize">{staff.role}</p>
        </div>
      </div>
    </Modal>
  );
};
