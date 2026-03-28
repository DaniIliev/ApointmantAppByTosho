"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, UserPlus, Trash2, Shield } from "lucide-react";
import callApi from "@/app/Api/callApi";
import { LabeledSelect } from "@/components/customUIComponents/LabeledSelect";

import { Location, Staff } from "@/Global/Types/types";

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
      : [{ firstName: "", lastName: "", email: "", role: "staff", locationId: locations[0]?._id || "" }]
  );

  const addStaffMember = () => {
    setStaff([...staff, { firstName: "", lastName: "", email: "", role: "staff", locationId: locations[0]?._id || "" }]);
  };

  const removeStaffMember = (index: number) => {
    if (staff.length > 1) {
      setStaff(staff.filter((_, i) => i !== index));
    }
  };

  const updateStaff = (index: number, field: keyof Staff, value: string) => {
    const newStaff = [...staff];
    newStaff[index] = { ...newStaff[index], [field]: value } as Staff;
    setStaff(newStaff);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Group staff by normalized email to avoid duplicate parallel requests for the same person
      const staffMap = new Map<string, Staff & { allLocations: string[] }>();
      
      staff.forEach(s => {
        if (!s.email) return;
        const normalizedEmail = s.email.trim().toLowerCase();
        if (staffMap.has(normalizedEmail)) {
          const existing = staffMap.get(normalizedEmail)!;
          if (s.locationId && !existing.allLocations.includes(s.locationId)) {
            existing.allLocations.push(s.locationId);
          }
        } else {
          staffMap.set(normalizedEmail, { 
            ...s, 
            allLocations: s.locationId ? [s.locationId] : [] 
          });
        }
      });

      // Send invitations for new staff (only once per email)
      const uniqueStaffToInvite = Array.from(staffMap.values()).filter(s => !s._id);
      
      await Promise.all(
        uniqueStaffToInvite.map(s => 
          // Note: The backend currently expects a single locationId, 
          // so we send the first one. Our backend logic is already updated to handle 
          // subsequent invitations for the same email gracefully.
          callApi("/api/staff/invite", "POST", s)
        )
      );
      onNext(staff);
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
                <LabeledSelect
                  id={`locationId-${index}`}
                  label={t("Location")}
                  value={s.locationId}
                  onValueChange={(val) => updateStaff(index, "locationId", val)}
                  options={locations.map(loc => ({ id: loc._id || index.toString(), name: loc.name }))}
                  placeholder={t("Assign to location")}
                />
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
