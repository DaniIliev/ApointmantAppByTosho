"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/customUIComponents/Modal";
import { Button } from "@/components/ui/button";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { StaffMember } from "./types";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import callApi from "../Api/callApi";
import { LabeledSelect } from "@/components/customUIComponents/LabeledSelect";
import { MultiSelectCombobox } from "@/components/customUIComponents/MultiSelectCombobox";

type StaffEditModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: StaffMember | null;
  onStaffUpdated: (updatedStaff: StaffMember) => void;
  locations: any[];
};

export const StaffEditModal: React.FC<StaffEditModalProps> = ({
  open,
  onOpenChange,
  staff,
  onStaffUpdated,
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

  // Reset form when staff changes or modal opens
  useEffect(() => {
    if (staff && open) {
      setFormData({
        firstName: staff.firstName,
        lastName: staff.lastName,
        email: staff.email,
        phone: staff.phone,
        role: staff.role,
        locationIds: staff.locationIds || [],
      });
    }
  }, [staff, open]);

  const handleSubmit = async () => {
    if (!staff) return;

    try {
      setIsSubmitting(true);
      const updatedStaff = await callApi(
        `/api/staff/${staff._id}`,
        "PUT",
        formData
      );

      onStaffUpdated(updatedStaff);
      onOpenChange(false);
      toast.success(t("Staff member updated successfully") as string);
    } catch (error) {
      toast.error(t("Failed to update staff member") as string);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!staff) return null;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      label={t("Edit Staff Member") as string}
      autoDetectDirty
      onConfirmSave={handleSubmit}
      width="lg"
    >
      <div className="space-y-3 p-2">
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
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          label={t("Email") as string}
          id="email"
        />

        <LabeledInput
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          label={t("Phone") as string}
          id="phone"
        />

        <LabeledInput
          type="text"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          label={t("Role") as string}
          id="role"
        />

        <div className="space-y-1">
          <label className="text-sm font-medium">{t("Locations")}</label>
          <MultiSelectCombobox
            items={locations.map(l => ({ id: l._id, name: l.name }))}
            selectedIds={formData.locationIds}
            onSelectIdsChange={(newIds) => setFormData({ ...formData, locationIds: newIds })}
            getLabel={(item) => item.name}
            triggerPlaceholder={t("Select locations")}
            searchPlaceholder={t("Search locations...")}
            emptyMessage={t("No locations found.")}
          />
        </div>

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
            {isSubmitting ? t("Saving...") : t("Save")}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
