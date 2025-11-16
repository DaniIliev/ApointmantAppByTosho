"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/customUIComponents/Modal";
import { Button } from "@/components/ui/button";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { LabeledSelect } from "@/components/customUIComponents/LabeledSelect";
import { Upload, Trash2, Plus, Trash } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getBusinessCategories } from "@/Global/Types/types";
import { useAuthContext } from "@/context/AuthContext";
import callApi from "@/app/Api/callApi";
import CreateAppointmentModal from "@/app/appointment-types/CreateAppointmentModal";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomTooltip } from "../customUIComponents/CustomTooltip";

type ModalWidth =
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "6xl"
  | "7xl"
  | "full";

export type SetupModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFinished?: () => void;
  businessId?: string;
  width?: ModalWidth;
};

// Types mimicking business-information page
interface BusinessInformation {
  category: string;
  businessName: string;
  aboutUs: string;
  address: string;
  addressLine2: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  businessImageUrl?: File | string | null;
}

const initialBusinessState: BusinessInformation = {
  category: "",
  businessName: "",
  aboutUs: "",
  address: "",
  addressLine2: "",
  postalCode: "",
  city: "",
  country: "",
  phone: "",
  email: "",
  website: "",
  businessImageUrl: null,
};

// Appointment type local structure
interface TempAppointmentType {
  name: string;
  description: string;
  duration: string;
  price: string;
  color: string;
  imageUrl: File | string | null;
  category: string;
  staffMembers: { _id: string; name: string }[];
}

// Staff types
interface StaffMember {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
}

// Schedule types
type TimeRange = { start: string | null; end: string | null };
interface ScheduleState {
  _id?: string;
  startDate: string;
  endDate: string;
  workTime: TimeRange;
  isDayOff: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  break1: TimeRange;
  break2: TimeRange;
  break3: TimeRange;
}

const initialSchedule: ScheduleState = {
  startDate: "",
  endDate: "",
  workTime: { start: null, end: null },
  isDayOff: {
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: true,
    sunday: true,
  },
  break1: { start: null, end: null },
  break2: { start: null, end: null },
  break3: { start: null, end: null },
};

// Pricing selection moved to separate Pricing page

export default function BusinessSetupModal({
  open,
  onOpenChange,
  onFinished,
  businessId,
  width,
}: SetupModalProps) {
  const { t } = useTranslation();
  const { user } = useAuthContext();

  const [step, setStep] = useState(0);
  const [biz, setBiz] = useState<BusinessInformation>(initialBusinessState);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [types, setTypes] = useState<TempAppointmentType[]>([]);
  const [createTypeOpen, setCreateTypeOpen] = useState(false);
  const [createTypeData, setCreateTypeData] = useState<TempAppointmentType>({
    name: "",
    category: "",
    description: "",
    duration: "",
    price: "",
    color: "from-blue-500 to-cyan-500",
    imageUrl: null,
    staffMembers: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  // Schedule state
  const [schedule, setSchedule] = useState<ScheduleState>(initialSchedule);
  const [breaks, setBreaks] = useState<TimeRange[]>([
    { start: null, end: null },
  ]);
  const [applyScheduleToAll, setApplyScheduleToAll] = useState(true);
  const [showStepErrors, setShowStepErrors] = useState(false);

  const categories = useMemo(() => getBusinessCategories(t), [t]);

  const stepLabels = [
    "Photo",
    "General",
    "Contact",
    "Address",
    "Staff",
    "Schedule",
    "Services",
  ];
  const next = () => setStep((s) => Math.min(s + 1, stepLabels.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const validateCurrentStep = (): boolean => {
    // Step indexes: 0 Photo, 1 General, 2 Contact, 3 Address, 4 Staff, 5 Schedule, 6 Services
    if (step === 1) {
      // businessName required
      if (!biz.businessName?.trim()) return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      setShowStepErrors(true);
      return;
    }
    setShowStepErrors(false);
    next();
  };

  const handleFinish = async () => {
    // Validate critical required fields before submit
    if (!biz.businessName?.trim()) {
      setStep(1);
      setShowStepErrors(true);
      return;
    }
    setShowStepErrors(false);
    await finish();
  };

  const onImageChange = (file?: File) => {
    if (!file) return;
    setBiz((prev) => ({ ...prev, businessImageUrl: file }));
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const addAppointmentType = () => {
    setTypes((prev) => [...prev, createTypeData]);
    setCreateTypeData({
      name: "",
      category: "",
      description: "",
      duration: "",
      price: "",
      color: "from-blue-500 to-cyan-500",
      imageUrl: null,
      staffMembers: [],
    });
    setCreateTypeOpen(false);
  };

  const removeType = (idx: number) =>
    setTypes((prev) => prev.filter((_, i) => i !== idx));

  // Staff fetching when on Staff step
  useEffect(() => {
    if (!open) return;
    if (step === 4) {
      callApi("/api/staff/staff-list", "GET")
        .then((data) => setStaffList(data))
        .catch(() => {});
    }
  }, [step, open]);

  // Schedule helpers similar to ScheduleModal
  const handleWorkTimeChange = (type: "start" | "end", value: string) => {
    setSchedule((prev) => ({
      ...prev,
      workTime: { ...prev.workTime, [type]: value },
    }));
  };
  const handleBreakChange = (
    index: number,
    type: "start" | "end",
    value: string
  ) => {
    const nb = [...breaks];
    nb[index] = { ...nb[index], [type]: value };
    setBreaks(nb);
  };
  const addBreak = () =>
    breaks.length < 3 && setBreaks([...breaks, { start: null, end: null }]);
  const removeBreak = (index: number) =>
    setBreaks((prev) => prev.filter((_, i) => i !== index));

  const finish = async () => {
    try {
      setSubmitting(true);
      const effectiveBusinessId = businessId || user?.businessId;
      // 1) Save business info
      if (effectiveBusinessId) {
        const payload: any = { ...biz };
        await callApi(
          `/api/business/${effectiveBusinessId}`,
          "PUT",
          payload,
          !!biz.businessImageUrl
        );
      }
      // 1.5) Create schedule if provided
      if (
        schedule.startDate &&
        schedule.workTime.start &&
        schedule.workTime.end
      ) {
        const finalBreaks = breaks.slice(0, 3);
        const schedulePayload = {
          ...schedule,
          break1: finalBreaks[0] || { start: null, end: null },
          break2: finalBreaks[1] || { start: null, end: null },
          break3: finalBreaks[2] || { start: null, end: null },
        };
        const created: any = await callApi(
          "/api/staff-schedules",
          "POST",
          schedulePayload
        );
        if (applyScheduleToAll && created?._id) {
          try {
            await callApi("/api/staff-schedules/apply-to-all", "POST", {
              scheduleId: created._id,
            });
          } catch {}
        }
      }
      // 2) Create appointment types
      for (const t of types) {
        const dataToSend: any = {
          name: t.name,
          description: t.description,
          duration: Number(t.duration),
          price: Number(t.price),
          color: t.color,
          imageUrl: t.imageUrl,
          category: t.category,
          staffs: JSON.stringify(t.staffMembers),
        };
        await callApi(
          `/api/service`,
          "POST",
          dataToSend,
          t.imageUrl instanceof File
        );
      }
      onOpenChange(false);
      onFinished?.();
    } catch (e) {
      console.error("Setup submission failed", e);
    } finally {
      setSubmitting(false);
    }
  };

  const StepsHeader = () => {
    return (
      <div className="mb-4">
        <div className="flex items-center gap-2">
          {stepLabels.map((label, i) => {
            const isActive = i === step;
            const isCompleted = i < step;
            return (
              <React.Fragment key={label}>
                <div className="flex flex-col items-center min-w-[60px]">
                  <div
                    className={
                      `w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ` +
                      (isActive
                        ? "bg-primary text-primary-foreground"
                        : isCompleted
                        ? "bg-primary/70 text-white"
                        : "bg-muted text-muted-foreground")
                    }
                  >
                    {i + 1}
                  </div>
                  <div
                    className={
                      `mt-1 text-[11px] sm:text-xs text-center ` +
                      (isActive
                        ? "text-primary font-medium"
                        : "text-muted-foreground")
                    }
                  >
                    {t(label)}
                  </div>
                </div>
                {i < stepLabels.length - 1 && (
                  <div
                    className={
                      `hidden sm:block flex-1 h-[2px] rounded ` +
                      (isCompleted ? "bg-primary/70" : "bg-muted")
                    }
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      label={t("Business Setup") as string}
      width={"7xl"}
    >
      <div className="space-y-4 w-full">
        <StepsHeader />
        {step === 0 && (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center w-full">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="preview"
                  className="w-48 h-36 object-cover rounded-xl border border-white/10"
                />
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-input rounded-xl cursor-pointer bg-input/20 hover:bg-input/40 transition-colors duration-300">
                  <Upload className="h-6 w-6 text-gray-500 mb-1" />
                  <span className="text-sm text-gray-600">
                    {t("Click to upload or drag & drop")}
                  </span>
                  <input
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={(e) =>
                      onImageChange(e.target.files?.[0] || undefined)
                    }
                  />
                </label>
              )}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <LabeledSelect<string>
                id="category"
                label={t("Category") as string}
                placeholder={t("e.g. Hair and Beauty") as string}
                value={biz.category}
                onValueChange={(v) => setBiz((p) => ({ ...p, category: v }))}
                options={categories}
              />
              <LabeledInput
                id="businessName"
                label={t("Business Name") as string}
                placeholder={t("e.g. Luxe Hair Salon") as string}
                value={biz.businessName}
                onChange={(e) =>
                  setBiz((p) => ({ ...p, businessName: e.target.value }))
                }
                required
                errorText={t("Business name is required") as string}
                showError={showStepErrors}
              />
            </div>
            <LabeledInput
              label={t("About us") as string}
              id="aboutUs"
              value={biz.aboutUs}
              onChange={(e) =>
                setBiz((p) => ({ ...p, aboutUs: e.target.value }))
              }
              placeholder={
                t(
                  "Add any additional information about your Business..."
                ) as string
              }
              rows={2}
              showError={showStepErrors}
            />
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <LabeledInput
              id="phone"
              type="tel"
              label={t("Phone") as string}
              placeholder="(555) 123-4567"
              value={biz.phone}
              onChange={(e) => setBiz((p) => ({ ...p, phone: e.target.value }))}
              showError={showStepErrors}
            />
            <LabeledInput
              id="email"
              type="email"
              label={t("Email") as string}
              placeholder="info@company.com"
              value={biz.email}
              onChange={(e) => setBiz((p) => ({ ...p, email: e.target.value }))}
              showError={showStepErrors}
            />
            <LabeledInput
              id="website"
              type="url"
              label={t("Website") as string}
              placeholder="www.company.com"
              value={biz.website}
              onChange={(e) =>
                setBiz((p) => ({ ...p, website: e.target.value }))
              }
              showError={showStepErrors}
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <LabeledInput
                id="country"
                label={t("Country") as string}
                placeholder={t("Select country") as string}
                value={biz.country}
                onChange={(e) =>
                  setBiz((p) => ({ ...p, country: e.target.value }))
                }
                showError={showStepErrors}
              />
              <LabeledInput
                id="city"
                label={t("City") as string}
                placeholder={t("Select city") as string}
                value={biz.city}
                onChange={(e) =>
                  setBiz((p) => ({ ...p, city: e.target.value }))
                }
                showError={showStepErrors}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <LabeledInput
                id="address"
                label={t("Street and Number") as string}
                placeholder={t("Street and Number") as string}
                value={biz.address}
                onChange={(e) =>
                  setBiz((p) => ({ ...p, address: e.target.value }))
                }
                className="sm:col-span-2"
                showError={showStepErrors}
              />
              <LabeledInput
                id="postalCode"
                label={t("Postal Code") as string}
                placeholder={t("Postal Code") as string}
                value={biz.postalCode}
                onChange={(e) =>
                  setBiz((p) => ({ ...p, postalCode: e.target.value }))
                }
                showError={showStepErrors}
              />
            </div>
            <LabeledInput
              id="addressLine2"
              label={t("Apartment, floor, etc. (optional)") as string}
              placeholder={t("Apartment, floor, etc. (optional)") as string}
              value={biz.addressLine2}
              onChange={(e) =>
                setBiz((p) => ({ ...p, addressLine2: e.target.value }))
              }
              showError={showStepErrors}
            />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">{t("Team")}</h4>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setInviteOpen(true)}
              >
                <Plus className="h-4 w-4" /> {t("Invite staff")}
              </Button>
            </div>
            {staffList.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("No staff yet. Invite your first team member.")}
              </p>
            ) : (
              <ul className="space-y-2">
                {staffList.map((s) => (
                  <li
                    key={s._id}
                    className="flex items-center justify-between rounded-md border border-input p-2"
                  >
                    <div className="text-sm">
                      <div className="font-medium">
                        {s.firstName} {s.lastName}
                      </div>
                      <div className="text-muted-foreground">
                        {s.email} · {s.phone}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {s.role}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <LabeledInput
                type="date"
                value={schedule.startDate}
                onChange={(e) =>
                  setSchedule((p) => ({ ...p, startDate: e.target.value }))
                }
                label={t("Start Date") as string}
                id="startDate"
                showError={showStepErrors}
              />
              <LabeledInput
                type="date"
                value={schedule.endDate}
                onChange={(e) =>
                  setSchedule((p) => ({ ...p, endDate: e.target.value }))
                }
                label={t("End Date") as string}
                id="endDate"
                showError={showStepErrors}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <LabeledInput
                type="time"
                value={schedule.workTime.start || ""}
                onChange={(e) => handleWorkTimeChange("start", e.target.value)}
                label={t("Work Start") as string}
                id="workStart"
                showError={showStepErrors}
              />
              <LabeledInput
                type="time"
                value={schedule.workTime.end || ""}
                onChange={(e) => handleWorkTimeChange("end", e.target.value)}
                label={t("Work End") as string}
                id="workEnd"
                showError={showStepErrors}
              />
            </div>
            <div>
              <label className="text-sm font-medium leading-none block pt-2">
                {t("Breaks (Max 3)")}
              </label>
              {breaks.map((br, idx) => (
                <div key={idx} className="flex items-end gap-3 mt-2">
                  <div className="basis-[61%]">
                    <LabeledInput
                      type="time"
                      value={br.start || ""}
                      onChange={(e) =>
                        handleBreakChange(idx, "start", e.target.value)
                      }
                      label={t(`Break ${idx + 1} Start`) as string}
                      id={`break${idx + 1}Start`}
                      showError={showStepErrors}
                    />
                  </div>
                  <div className="basis-[50%]">
                    <LabeledInput
                      type="time"
                      value={br.end || ""}
                      onChange={(e) =>
                        handleBreakChange(idx, "end", e.target.value)
                      }
                      label={t(`Break ${idx + 1} End`) as string}
                      id={`break${idx + 1}End`}
                      showError={showStepErrors}
                    />
                  </div>
                  <div className="basis-[10%] flex items-center justify-end gap-2">
                    <CustomTooltip
                      onClick={() => removeBreak(idx)}
                      tooltipText={t("Delete Brake")}
                      icon={<Trash color="red" />}
                    />
                    {idx === breaks.length - 1 && breaks.length < 3 && (
                      <CustomTooltip
                        onClick={() => addBreak()}
                        tooltipText={t("Add Brake")}
                        icon={<Plus />}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div>
              <label className="text-sm font-medium leading-none block pt-2">
                {t("Days Off")}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.keys(schedule.isDayOff).map((day) => (
                  <label key={day} className="flex items-center gap-2">
                    <Checkbox
                      checked={
                        schedule.isDayOff[day as keyof typeof schedule.isDayOff]
                      }
                      onCheckedChange={(checked) =>
                        setSchedule((prev) => ({
                          ...prev,
                          isDayOff: {
                            ...prev.isDayOff,
                            [day]: Boolean(checked),
                          },
                        }))
                      }
                    />
                    <span>{t(day.charAt(0).toUpperCase() + day.slice(1))}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Checkbox
                checked={applyScheduleToAll}
                onCheckedChange={(c) => setApplyScheduleToAll(Boolean(c))}
              />
              <span className="text-sm text-muted-foreground">
                {t("Apply this schedule to all staff")}
              </span>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6">
            {/* Appointment Types */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{t("Appointment Types")}</h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCreateTypeOpen(true)}
                >
                  {t("Add type")}
                </Button>
              </div>
              {types.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("No types added yet.")}
                </p>
              ) : (
                <ul className="space-y-2">
                  {types.map((tp, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between rounded-md border border-input p-2"
                    >
                      <div className="text-sm">
                        <div className="font-medium">{tp.name}</div>
                        <div className="text-muted-foreground">
                          {tp.duration}m · €{tp.price}
                        </div>
                      </div>
                      <button
                        className="text-red-500 hover:text-red-600"
                        onClick={() => removeType(idx)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Footer nav */}
        <div className="flex items-center justify-between pt-2">
          <Button
            iconType="back"
            variant="outline"
            onClick={back}
            disabled={step === 0}
          >
            {t("Back")}
          </Button>
          {step < stepLabels.length - 1 ? (
            <Button iconType="next" onClick={handleNext}>
              {t("Next")}
            </Button>
          ) : (
            <Button
              iconType="confirm"
              onClick={handleFinish}
              disabled={submitting}
            >
              {submitting ? t("Submitting...") : t("Finish")}
            </Button>
          )}
        </div>
      </div>

      {/* Nested invite staff modal */}
      <Modal
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        label={t("Invite Staff") as string}
      >
        <div className="space-y-3 p-1">
          <LabeledInput
            id="firstName"
            label={t("First Name") as string}
            value={newStaff.firstName}
            onChange={(e) =>
              setNewStaff({ ...newStaff, firstName: e.target.value })
            }
          />
          <LabeledInput
            id="lastName"
            label={t("Last Name") as string}
            value={newStaff.lastName}
            onChange={(e) =>
              setNewStaff({ ...newStaff, lastName: e.target.value })
            }
          />
          <LabeledInput
            id="email"
            type="email"
            label={t("Email") as string}
            value={newStaff.email}
            onChange={(e) =>
              setNewStaff({ ...newStaff, email: e.target.value })
            }
          />
          <LabeledInput
            id="phone"
            type="tel"
            label={t("Phone") as string}
            value={newStaff.phone}
            onChange={(e) =>
              setNewStaff({ ...newStaff, phone: e.target.value })
            }
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              {t("Cancel")}
            </Button>
            <Button
              onClick={async () => {
                try {
                  const res: any = await callApi(
                    "/api/staff/invite-staff",
                    "POST",
                    newStaff
                  );
                  if (res?.staff) setStaffList((prev) => [...prev, res.staff]);
                  setInviteOpen(false);
                  setNewStaff({
                    firstName: "",
                    lastName: "",
                    email: "",
                    phone: "",
                  });
                } catch (e) {}
              }}
            >
              {t("Invite Staff")}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Nested create appointment modal for adding types */}
      <CreateAppointmentModal
        isModalOpen={createTypeOpen}
        setIsModalOpen={setCreateTypeOpen}
        editingType={null}
        formData={createTypeData}
        setFormData={setCreateTypeData}
        handleSubmit={(e) => {
          e.preventDefault();
          addAppointmentType();
        }}
        isLoading={false}
        colorOptions={["from-blue-500 to-cyan-500"]}
      />
    </Modal>
  );
}
