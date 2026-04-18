"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/customUIComponents/Modal";
import { Button } from "@/components/ui/button";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { LabeledSelect } from "@/components/customUIComponents/LabeledSelect";
import { StaffMember } from "./types";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { MultiSelectCombobox } from "@/components/customUIComponents/MultiSelectCombobox";
import { Eye, Edit2, Plus } from "lucide-react";
import { useCreateStaff, useUpdateStaff } from "@/hooks/queries/useStaff";

type StaffModalMode = "view" | "edit" | "create";

type StaffModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: StaffModalMode;
  staff: StaffMember | null;
  onStaffUpdated?: (updatedStaff: StaffMember) => void;
  onStaffCreated?: (newStaff: StaffMember) => void;
  locations: any[];
};

export const StaffModal: React.FC<StaffModalProps> = ({
  open,
  onOpenChange,
  mode,
  staff,
  onStaffUpdated,
  onStaffCreated,
  locations,
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    locationIds: [] as string[],
  });

  const createStaffMutation = useCreateStaff();
  const updateStaffMutation = useUpdateStaff();

  // Reset form when staff changes or modal opens
  useEffect(() => {
    if (open) {
      if (mode === "create") {
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          role: "",
          locationIds: [],
        });
      } else if (staff) {
        setFormData({
          firstName: staff.firstName,
          lastName: staff.lastName,
          email: staff.email,
          phone: staff.phone,
          role: staff.role,
          locationIds: staff.locationIds || [],
        });
      }
    }
  }, [staff, open, mode]);

  const handleSubmit = async () => {
    if (mode === "create") {
      try {
        setIsSubmitting(true);
        const result = await createStaffMutation.mutateAsync(formData);
        onStaffCreated?.(result.staff || result);
        onOpenChange(false);
        toast.success(
          t("Staff member invited successfully! An email with a temporary password has been sent") as string,
        );
      } catch (error) {
        toast.error(t("Failed to invite staff member") as string);
      } finally {
        setIsSubmitting(false);
      }
    } else if (mode === "edit" && staff) {
      try {
        setIsSubmitting(true);
        const updatedStaff = await updateStaffMutation.mutateAsync({
          id: staff._id,
          data: formData,
        });
        onStaffUpdated?.(updatedStaff);
        onOpenChange(false);
        toast.success(t("Staff member updated successfully") as string);
      } catch (error) {
        toast.error(t("Failed to update staff member") as string);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Get modal title based on mode
  const getModalTitle = () => {
    switch (mode) {
      case "view":
        return t("Staff Details");
      case "edit":
        return t("Edit Staff Member");
      case "create":
        return t("Add New Staff Member");
      default:
        return "";
    }
  };

  // Get modal icon based on mode
  const getModalIcon = () => {
    switch (mode) {
      case "view":
        return <Eye className="w-4 h-4" />;
      case "edit":
        return <Edit2 className="w-4 h-4" />;
      case "create":
        return <Plus className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (!staff && mode !== "create") return null;

  const initials =
    staff && `${staff.firstName?.[0] || ""}${staff.lastName?.[0] || ""}`;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      label={getModalTitle()}
      autoDetectDirty={mode !== "view"}
      onConfirmSave={mode === "view" ? undefined : handleSubmit}
      width="lg"
    >
      <div className="space-y-4 p-2">
        {/* View Mode - Profile Picture */}
        {mode === "view" && staff && (
          <div className="flex items-center gap-3 pb-2">
            <div className="h-16 w-16 overflow-hidden rounded-full border border-muted bg-muted flex items-center justify-center text-lg font-semibold text-muted-foreground flex-shrink-0">
              {staff.profilePictureUrl ? (
                <img
                  src={
                    staff.profilePictureUrl.startsWith("http")
                      ? staff.profilePictureUrl
                      : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/${staff.profilePictureUrl.replace(/^\/+/, "")}`
                  }
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
        )}

        {/* View Mode - Read-only fields */}
        {mode === "view" && staff ? (
          <>
            <div className="space-y-4">
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
                <p className="text-base font-semibold capitalize">
                  {staff.role}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  {t("Locations")}
                </label>
                <p className="text-base font-semibold">
                  {(staff.locationIds || [])
                    .map((id) => locations.find((l) => l._id === id)?.name)
                    .filter(Boolean)
                    .join(", ") || "-"}
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Edit/Create Mode - Form fields */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <LabeledInput
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  label={t("First Name") as string}
                  id="firstName"
                />
                <LabeledInput
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  label={t("Last Name") as string}
                  id="lastName"
                />
              </div>

              <LabeledInput
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                label={t("Email") as string}
                id="email"
              />

              <LabeledInput
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                label={t("Phone") as string}
                id="phone"
              />

              <LabeledSelect
                id="role"
                label={t("Role") as string}
                value={formData.role}
                onValueChange={(val) => setFormData({ ...formData, role: val })}
                options={[
                  { id: "manager", name: t("Manager") },
                  { id: "staff", name: t("Staff") },
                  { id: "business", name: t("Business"), disabled: true },
                ]}
                placeholder={t("Select role") as string}
                selectProps={{ disabled: formData.role === "business" }}
              />

              <MultiSelectCombobox
                label={t("Select locations")}
                items={locations.map((l) => ({ id: l._id, name: l.name }))}
                selectedIds={formData.locationIds}
                onSelectIdsChange={(newIds) =>
                  setFormData({ ...formData, locationIds: newIds })
                }
                getLabel={(item) => item.name}
                searchPlaceholder={t("Search locations...")}
                emptyMessage={t("No locations found.")}
              />
            </div>

            {/* Edit/Create Mode - Action buttons */}
            <div className="flex justify-center gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                iconType="cancel"
              >
                {t("Cancel")}
              </Button>
              <Button
                onClick={handleSubmit}
                iconType="save"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? mode === "create"
                    ? t("Inviting...")
                    : t("Saving...")
                  : mode === "create"
                    ? t("Invite Staff")
                    : t("Save")}
              </Button>
            </div>
          </>
        )}

        {/* View Mode - Close button */}
        {mode === "view" && (
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              {t("Close")}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};
