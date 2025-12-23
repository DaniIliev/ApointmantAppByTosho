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

  const initials = `${staff.firstName?.[0] || ""}${staff.lastName?.[0] || ""}`;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      label={t("Staff Details") as string}
      width="lg"
    >
      <div className="space-y-4 p-2">
        <div className="flex items-center gap-3">
          <div className="h-16 w-16 overflow-hidden rounded-full border border-muted bg-muted flex items-center justify-center text-lg font-semibold text-muted-foreground">
            {staff.profilePictureUrl ? (
              <img
                src={staff.profilePictureUrl}
                alt={`${staff.firstName} ${staff.lastName}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {t("Profile Picture")}
            </p>
            <p className="text-base font-semibold">
              {staff.firstName} {staff.lastName}
            </p>
          </div>
        </div>

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
