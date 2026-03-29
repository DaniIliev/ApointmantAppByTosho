"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, UserPlus, Trash2, Shield } from "lucide-react";
import callApi from "@/app/Api/callApi";
import { LabeledSelect } from "@/components/customUIComponents/LabeledSelect";

import { Location, Staff } from "@/Global/Types/types";
import { MultiSelectCombobox } from "@/components/customUIComponents/MultiSelectCombobox";

interface StaffSetupProps {
  locations: Location[];
  onNext: (staff: Staff[]) => void;
  onBack: () => void;
  initialData?: Staff[];
}

export default function StaffSetup({ locations, onNext, onBack, initialData }: StaffSetupProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [staff, setStaff] = useState<Staff[]>(
    initialData && initialData.length > 0
      ? initialData
      : [{ firstName: "", lastName: "", email: "", role: "staff", locationIds: [locations[0]?._id || ""] }]
  );

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setStaff(initialData);
    }
  }, [initialData]);

  const addStaffMember = () => {
    setStaff([...staff, { firstName: "", lastName: "", email: "", role: "staff", locationIds: [locations[0]?._id || ""] }]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Group staff by normalized email to avoid duplicate parallel requests for the same person
      const staffMap = new Map<string, Staff>();
      
      staff.forEach(s => {
        if (!s.email) return;
        const normalizedEmail = s.email.trim().toLowerCase();
        if (staffMap.has(normalizedEmail)) {
          const existing = staffMap.get(normalizedEmail)!;
          s.locationIds.forEach(locId => {
            if (locId && !existing.locationIds.includes(locId)) {
              existing.locationIds.push(locId);
            }
          });
        } else {
          staffMap.set(normalizedEmail, { 
            ...s, 
            locationIds: [...s.locationIds] 
          });
        }
      });

      // Send invitations for staff (only for newly added locations to avoid redundant API calls)
      const invitedStaffMap = new Map<string, any>();

      for (const s of Array.from(staffMap.values())) {
        let lastResStaff = null;
        
        // Find existing locationIds for this staff if from initialData
        const originalStaff = (initialData || []).find(o => o.email.toLowerCase() === s.email.toLowerCase());
        const originalLocIds = (originalStaff?.locationIds || []).map(id => id.toString());
        
        // Identify new locations that need an invite/assignment call
        const newLocIds = s.locationIds.filter(locId => !originalLocIds.includes(locId.toString()));

        for (const locId of newLocIds) {
          try {
            const res = await callApi("/api/staff/invite", "POST", { ...s, locationId: locId });
            if (res.staff) {
              lastResStaff = res.staff;
            }
          } catch (err) {
            console.error(`Failed to invite ${s.email} to location ${locId}:`, err);
          }
        }
        
        if (lastResStaff) {
          invitedStaffMap.set(lastResStaff.email.toLowerCase(), lastResStaff);
        } else if (originalStaff) {
          // If no new locations were added, keep the original staff data with updated local state
          invitedStaffMap.set(s.email.toLowerCase(), { ...originalStaff, ...s });
        }
      }

      // Update the original staff array with IDs
      const finalStaff = staff.map(s => {
        const invited = invitedStaffMap.get(s.email.toLowerCase());
        if (invited) {
          return { ...s, _id: invited._id, locationIds: invited.locationIds || s.locationIds };
        }
        return s;
      });

      onNext(finalStaff);
    } catch (error) {
      console.error("Failed to invite staff:", error);
      onNext(staff);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div >
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
          <UserPlus className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{t("Invite your team")}</h2>
          <p className="text-muted-foreground">{t("Add staff members and assign them to your locations.")}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          {staff.map((s, index) => (
            <div key={index} className="p-6 rounded-2xl border border-border bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">{t("Team Member")} #{index + 1}</h3>
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
                  onChange={(e) => updateStaff(index, "firstName", e.target.value)}
                  placeholder={t("First name")}
                  required
                />
                <LabeledInput
                  id={`lastName-${index}`}
                  label={t("Last Name")}
                  value={s.lastName}
                  onChange={(e) => updateStaff(index, "lastName", e.target.value)}
                  placeholder={t("Last name")}
                  required
                />
                <div className="md:col-span-2">
                  <LabeledInput
                    id={`email-${index}`}
                    label={t("Email Address")}
                    type="email"
                    value={s.email}
                    onChange={(e) => updateStaff(index, "email", e.target.value)}
                    placeholder={t("staff@example.com")}
                    required
                  />
                </div>
                <LabeledSelect
                  id={`role-${index}`}
                  label={t("Role")}
                  value={s.role}
                  onValueChange={(val) => updateStaff(index, "role", val)}
                  options={[
                    { id: "staff", name: t("Staff") },
                    { id: "admin", name: t("Admin") }
                  ]}
                  placeholder={t("Select role")}
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("Locations")}</label>
                  <MultiSelectCombobox
                    items={locations.map(loc => ({ id: loc._id!, name: loc.name }))}
                    selectedIds={s.locationIds}
                    onSelectIdsChange={(newIds) => updateStaff(index, "locationIds", newIds)}
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
          <Button
            type="submit"
            disabled={loading}
            iconType="next"
          >
            {loading ? t("Sending...") : t("Next Step")}
          </Button>
        </div>
      </form>
    </div>
  );
}
