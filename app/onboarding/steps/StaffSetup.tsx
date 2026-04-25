"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { useTranslation } from "react-i18next";
import {  UserPlus, Trash2 } from "lucide-react";
import callApi from "@/app/Api/callApi";
import { LabeledSelect } from "@/components/customUIComponents/LabeledSelect";
import { Location } from "@/Global/Types/types";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export type StaffRole = "manager" | "staff" | "business";

export interface Staff {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: StaffRole;
  locationIds: string[];
}
import { MultiSelectCombobox } from "@/components/customUIComponents/MultiSelectCombobox";

interface StaffSetupProps {
  locations: Location[];
  onNext: (staff: Staff[]) => void;
  onBack: () => void;
  initialData?: Staff[];
}

export default function StaffSetup({
  locations,
  onNext,
  onBack,
  initialData,
}: StaffSetupProps) {
  const { t } = useTranslation();
  const getInitialStaff = (data?: Staff[]): Staff[] => {
    if (data && data.length > 0) {
      return data.map((s) => {
        if (s.role === "business") {
          return { ...s, locationIds: locations.map((l) => l._id as string) };
        }
        return s;
      });
    }
    return [
      {
        firstName: "",
        lastName: "",
        email: "",
        role: "staff",
        locationIds: [locations[0]?._id || ""],
      },
    ];
  };

  const [staff, setStaff] = useState<Staff[]>(() => getInitialStaff(initialData));

  const knownStaffRef = React.useRef<{
    invitedLocations: Record<string, string[]>;
    staffIds: Record<string, string>;
  }>({ invitedLocations: {}, staffIds: {} });

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setStaff(getInitialStaff(initialData));

      const invitedLocs: Record<string, string[]> = {};
      const sIds: Record<string, string> = {};
      initialData.forEach((s) => {
        if (s.email) {
          const emailLower = s.email.toLowerCase();
          invitedLocs[emailLower] = s.locationIds || [];
          if (s._id) {
            sIds[emailLower] = s._id;
          }
        }
      });
      knownStaffRef.current = { invitedLocations: invitedLocs, staffIds: sIds };
    }
  }, [initialData]);

  const addStaffMember = () => {
    setStaff([
      ...staff,
      {
        firstName: "",
        lastName: "",
        email: "",
        role: "staff",
        locationIds: [locations[0]?._id || ""],
      },
    ]);
  };

  const removeStaffMember = (index: number) => {
    if (staff.length > 1) {
      setStaff(staff.filter((_, i) => i !== index));
    }
  };

  const updateStaff = (index: number, field: keyof Staff, value: any) => {
    const newStaff = [...staff];
    newStaff[index] = { ...newStaff[index], [field]: value } as Staff;
    setStaff(newStaff);
  };

  const mutation = useMutation({
    mutationFn: async () => {
      // Group staff by normalized email to avoid duplicate parallel requests for the same person
      const staffMap = new Map<string, Staff>();

      staff.forEach((s) => {
        if (!s.email) return;
        const normalizedEmail = s.email.trim().toLowerCase();
        if (staffMap.has(normalizedEmail)) {
          const existing = staffMap.get(normalizedEmail)!;
          s.locationIds.forEach((locId) => {
            if (locId && !existing.locationIds.includes(locId)) {
              existing.locationIds.push(locId);
            }
          });
        } else {
          staffMap.set(normalizedEmail, {
            ...s,
            locationIds: [...s.locationIds],
          });
        }
      });

      const errors: string[] = [];
      const newInvitedLocs = { ...knownStaffRef.current.invitedLocations };
      const newStaffIds = { ...knownStaffRef.current.staffIds };
      const invitedStaffMap = new Map<string, any>();

      for (const s of Array.from(staffMap.values())) {
        const emailLower = s.email.toLowerCase();
        const originalLocIds = newInvitedLocs[emailLower] || [];

        // Identify new locations that need an invite/assignment call
        const newLocIds = s.locationIds.filter(
          (locId) => !originalLocIds.includes(locId.toString()),
        );

        let lastResStaff = null;

        if (newLocIds.length > 0) {
          try {
            const res = await callApi("/api/staff/invite", "POST", {
              ...s,
              locationIds: newLocIds,
            });
            if (res.staff) {
              lastResStaff = res.staff;
              newInvitedLocs[emailLower] = [...originalLocIds, ...newLocIds];
              newStaffIds[emailLower] = res.staff._id;
            }
          } catch (err: any) {
            if (
              err.errorCode === "OWNER_ALREADY_ADDED" ||
              err.errorCode === "STAFF_ALREADY_ADDED"
            ) {
              // Treat as success
              newInvitedLocs[emailLower] = [...originalLocIds, ...newLocIds];
            } else {
              const errorText = err.errorCode 
                ? t(`api_errors.${err.errorCode}`) 
                : (err.message || t("Failed to invite staff members"));
              errors.push(`${s.email}: ${errorText}`);
            }
          }
        }

        invitedStaffMap.set(emailLower, lastResStaff || { 
          ...s, 
          _id: newStaffIds[emailLower], 
          locationIds: newInvitedLocs[emailLower] || [] 
        });
      }

      // Update the ref immediately so subsequent retries have the latest state
      knownStaffRef.current = { invitedLocations: newInvitedLocs, staffIds: newStaffIds };

      // Update the original staff array with IDs
      const finalStaff = staff.map((s) => {
        const emailLower = s.email.toLowerCase();
        const invited = invitedStaffMap.get(emailLower);
        return {
          ...s,
          _id: newStaffIds[emailLower] || s._id,
          locationIds: newInvitedLocs[emailLower] || s.locationIds,
        };
      });

      if (errors.length > 0) {
        // Collect errors to throw them so onError is triggered
        throw new Error(errors.join("\n"));
      }

      return finalStaff;
    },
    onSuccess: (finalStaff) => {
      onNext(finalStaff);
    },
    onError: (error: any) => {
      console.error("Failed to invite staff:", error);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
          <UserPlus className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{t("Invite your team")}</h2>
          <p className="text-muted-foreground">
            {t("Add staff members and assign them to your locations.")}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          {staff.map((s, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl border border-border bg-slate-50/50 dark:bg-slate-900/50"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">
                  {t("Team Member")} #{index + 1}
                </h3>
                {staff.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeStaffMember(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LabeledInput
                  id={`firstName-${index}`}
                  label={t("First Name")}
                  value={s.firstName}
                  onChange={(e) =>
                    updateStaff(index, "firstName", e.target.value)
                  }
                  placeholder={t("First name")}
                  required
                />
                <LabeledInput
                  id={`lastName-${index}`}
                  label={t("Last Name")}
                  value={s.lastName}
                  onChange={(e) =>
                    updateStaff(index, "lastName", e.target.value)
                  }
                  placeholder={t("Last name")}
                  required
                />
                <div className="md:col-span-2">
                  <LabeledInput
                    id={`email-${index}`}
                    label={t("Email Address")}
                    type="email"
                    value={s.email}
                    onChange={(e) =>
                      updateStaff(index, "email", e.target.value)
                    }
                    placeholder={t("staff@example.com")}
                    required
                  />
                </div>
                <LabeledSelect
                  id={`role-${index}`}
                  label={t("Role")}
                  value={s.role === "business" ? "business" : s.role}
                  onValueChange={(val) => updateStaff(index, "role", val)}
                  options={[
                    { id: "manager", name: t("Manager") },
                    { id: "staff", name: t("Staff") },
                    {
                      id: "business",
                      name: t("Business Owner"),
                      disabled: true,
                    },
                  ]}
                  placeholder={t("Select role")}
                  // @ts-ignore
                  selectProps={{ disabled: s.role === "business" }}
                />
                <div className="space-y-2">
                  <MultiSelectCombobox
                    items={locations.map((loc) => ({
                      id: loc._id!,
                      name: loc.name,
                    }))}
                    selectedIds={s.locationIds}
                    onSelectIdsChange={(newIds) =>
                      updateStaff(index, "locationIds", newIds)
                    }
                    getLabel={(item) => item.name}
                    triggerPlaceholder={t("Select locations")}
                    searchPlaceholder={t("Search locations...")}
                    emptyMessage={t("No locations found.")}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={addStaffMember}
          iconType="add"
          className="w-full rounded-2xl py-6 border-dashed border-2 hover:border-primary hover:text-primary transition-all flex gap-2 items-center justify-center font-bold"
        >
          {t("Add Another Member")}
        </Button>

        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            iconType="back"
          >
            {t("Back")}
          </Button>
          <Button type="submit" disabled={mutation.isPending} iconType="next">
            {mutation.isPending ? t("Sending...") : t("Next Step")}
          </Button>
        </div>
      </form>
    </div>
  );
}
