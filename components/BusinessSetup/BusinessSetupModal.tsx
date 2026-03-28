"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/customUIComponents/Modal";
import { Button } from "@/components/ui/button";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { DateRangePicker } from "@/components/customUIComponents/DateRangePicker";
import { LabeledSelect } from "@/components/customUIComponents/LabeledSelect";
import {
  Upload,
  Trash2,
  Plus,
  Trash,
  Image,
  Info,
  Building2,
  Phone,
  MapPin,
  Users,
  Calendar,
  Briefcase,
  CheckCircle2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { getBusinessCategories } from "@/Global/Types/types";
import { useAuthContext } from "@/context/AuthContext";
import callApi from "@/app/Api/callApi";
import CreateAppointmentModal from "@/app/appointment-types/CreateAppointmentModal";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomTooltip } from "../customUIComponents/CustomTooltip";
import { TimeRangePicker } from "@/components/customUIComponents/TimeRangePicker";
import { cn } from "@/lib/utils";

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
  startDate: string | null;
  endDate: string | null;
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
  startDate: null,
  endDate: null,
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

  const stepInfo = {
    0: {
      icon: Image,
      title: t("Business Photo"),
      description: t(
        "Upload a professional photo of your business. This helps customers recognize your brand."
      ),
      // hint: t(
      //   "Tip: Use a high-quality image (min 800x600px) showing your storefront or logo."
      // ),
      hint: "",
    },
    1: {
      icon: Building2,
      title: t("Business Details"),
      description: t(
        "Tell us about your business. This information will be visible to your customers."
      ),
      // hint: t("Choose a category that best describes your business type."),
      hint: "",
    },
    2: {
      icon: Phone,
      title: t("Contact Information"),
      description: t(
        "How can customers reach you? Add your phone, email, and website."
      ),
      // hint: t(
      //   "Optional: All fields are optional, but providing more contact options builds trust."
      // ),
      hint: "",
    },
    3: {
      icon: MapPin,
      title: t("Business Location"),
      description: t(
        "Where is your business located? This helps customers find you easily."
      ),
      // hint: t(
      //   "Optional: You can skip this if you operate online or provide mobile services."
      // ),
      hint: "",
    },
    4: {
      icon: Users,
      title: t("Your Team"),
      description: t(
        "Add your staff members who will be providing services to customers."
      ),
      hint: t("Optional: You can add staff members later from the Staff page."),
    },
    5: {
      icon: Calendar,
      title: t("Working Hours"),
      description: t(
        "Define your business hours and breaks. Customers can only book during these times."
      ),
      hint: t(
        "Optional: Set your default schedule. You can customize individual staff schedules later."
      ),
    },
    6: {
      icon: Briefcase,
      title: t("Services Offered"),
      description: t(
        "What services do you provide? Add appointment types with duration and pricing."
      ),
      hint: t(
        "Optional: Start with your most popular services. You can add more anytime."
      ),
    },
  };
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
      callApi(`/api/staff/staff-list?businessId=${user?.businessId}`, "GET")
        .then((data) => setStaffList(data))
        .catch(() => {});
    }
  }, [step, open]);

  // Schedule helpers similar to ScheduleModal
  // handleWorkTimeChange is unused (replaced by TimeRangePicker)
  const handleBreakChange = (
    index: number,
    next: { startTime: string | null; endTime: string | null }
  ) => {
    setBreaks((prev) =>
      prev.map((b, i) =>
        i === index
          ? {
              start: next.startTime ?? b.start,
              end: next.endTime ?? b.end,
            }
          : b
      )
    );
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
          staffMembers: JSON.stringify(t.staffMembers),
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
      <div className="mb-3">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2">
          {stepLabels.map((label, i) => {
            const isActive = i === step;
            const isCompleted = i < step;
            return (
              <React.Fragment key={label}>
                <div className="flex flex-col items-center min-w-[50px] sm:min-w-[60px]">
                  <div
                    className={
                      `w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-semibold ` +
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
                      `mt-1 text-[10px] sm:text-xs text-center hidden sm:block ` +
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

        {/* Step Info Card */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
              {React.createElement(
                stepInfo[step as keyof typeof stepInfo].icon,
                {
                  className: "h-4 w-4 sm:h-5 sm:w-5 text-primary",
                }
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base sm:text-lg mb-1">
                {t(stepInfo[step as keyof typeof stepInfo].title)}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-2 hidden sm:block">
                {t(stepInfo[step as keyof typeof stepInfo].description)}
              </p>
              {stepInfo[step as keyof typeof stepInfo].hint && (
                <div className="hidden sm:flex items-start gap-2 text-xs text-primary/80 bg-primary/5 rounded px-2 py-1.5">
                  <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                  <span>{t(stepInfo[step as keyof typeof stepInfo].hint)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center w-full">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt={t("Preview") as string}
                    className="w-48 h-36 object-cover rounded-xl border border-white/10"
                  />
                  <div className="absolute -top-2 -right-2 p-1 bg-green-500 rounded-full">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-input rounded-xl cursor-pointer bg-input/20 hover:bg-input/40 transition-colors duration-300">
                  <Upload className="h-8 w-8 text-primary mb-2" />
                  <span className="text-sm font-medium text-foreground mb-1">
                    {t("Click to upload or drag & drop")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t("PNG, JPG or WEBP (MAX. 5MB)")}
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
              <div className="relative">
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
                <span className="absolute top-0 right-0 text-xs text-red-500 font-semibold">
                  {t("* Required")}
                </span>
              </div>
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
              rows={3}
              showError={showStepErrors}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <LabeledInput
                id="phone"
                type="tel"
                label={t("Phone") as string}
                placeholder="(555) 123-4567"
                value={biz.phone}
                onChange={(e) =>
                  setBiz((p) => ({ ...p, phone: e.target.value }))
                }
                showError={showStepErrors}
              />
              <LabeledInput
                id="email"
                type="email"
                label={t("Email") as string}
                placeholder="info@company.com"
                value={biz.email}
                onChange={(e) =>
                  setBiz((p) => ({ ...p, email: e.target.value }))
                }
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-lg">{t("Team Members")}</h4>
              <Button
                size="sm"
                className="gap-2"
                onClick={() => setInviteOpen(true)}
              >
                <Plus className="h-4 w-4" /> {t("Invite Staff")}
              </Button>
            </div>
            {staffList.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed rounded-lg border-muted">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground mb-1 font-medium">
                  {t("No team members yet")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("Invite your first team member to get started")}
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {staffList.map((s) => (
                  <li
                    key={s._id}
                    className="flex items-center justify-between rounded-lg border border-input p-3 bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-semibold text-sm">
                          {s.firstName.charAt(0)}
                          {s.lastName.charAt(0)}
                        </span>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">
                          {s.firstName} {s.lastName}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {s.email} · {s.phone}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
                      {s.role}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DateRangePicker
                value={{
                  startDate: schedule.startDate || null,
                  endDate: schedule.endDate || null,
                }}
                onChange={(r) =>
                  setSchedule((p) => ({
                    ...p,
                    startDate: r.startDate,
                    endDate: r.endDate,
                  }))
                }
                disablePast={true}
              />
              <TimeRangePicker
                value={{
                  startTime: schedule.workTime.start,
                  endTime: schedule.workTime.end,
                }}
                onChange={(val) =>
                  setSchedule((p) => ({
                    ...p,
                    workTime: { start: val.startTime, end: val.endTime },
                  }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium leading-none flex items-center gap-2 pt-2 mb-2">
                <span>{t("Breaks (Max 3)")}</span>
                <span className="text-xs text-muted-foreground font-normal">
                  — {t("Optional")}
                </span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {breaks.map((br, idx) => (
                  <div key={idx} className="flex items-end gap-3 mt-2">
                    <div className="basis-[80%]">
                      <TimeRangePicker
                        value={{
                          startTime: br.start,
                          endTime: br.end,
                        }}
                        onChange={(val) => handleBreakChange(idx, val)}
                        label={t(`Break ${idx + 1}`) as string}
                      />
                    </div>
                    <div className="basis-[10%] flex items-center justify-end gap-2">
                      <CustomTooltip
                        onClick={() => removeBreak(idx)}
                        tooltipText={t("Delete Break")}
                        icon={<Trash color="red" />}
                      />
                      {idx === breaks.length - 1 && breaks.length < 3 && (
                        <CustomTooltip
                          onClick={() => addBreak()}
                          tooltipText={t("Add Break")}
                          icon={<Plus />}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium leading-none block pt-2 mb-2">
                {t("Days Off")}
              </label>
              <div className="flex items-center justify-center gap-0.5 border border-primary rounded-lg overflow-hidden bg-white dark:bg-background">
                {(
                  [
                    "monday",
                    "tuesday",
                    "wednesday",
                    "thursday",
                    "friday",
                    "saturday",
                    "sunday",
                  ] as Array<keyof typeof schedule.isDayOff>
                ).map((key) => (
                  <button
                    key={key}
                    type="button"
                    className={cn(
                      "flex-1 px-3 py-2 text-sm font-semibold transition-colors focus:outline-none",
                      schedule.isDayOff[key]
                        ? "bg-primary text-white"
                        : "bg-transparent text-foreground hover:bg-primary/10"
                    )}
                    onClick={() =>
                      setSchedule((prev) => ({
                        ...prev,
                        isDayOff: {
                          ...prev.isDayOff,
                          [key]: !prev.isDayOff[key],
                        },
                      }))
                    }
                  >
                    {t(key.charAt(0).toUpperCase() + key.slice(1, 2)) +
                      key.slice(2, 3)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2 bg-primary/5 border border-primary/20 rounded-lg p-3">
              <Checkbox
                checked={applyScheduleToAll}
                onCheckedChange={(c) => setApplyScheduleToAll(Boolean(c))}
              />
              <span className="text-sm">
                {t("Apply this schedule to all staff")}
              </span>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-lg">{t("Your Services")}</h4>
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => setCreateTypeOpen(true)}
                >
                  <Plus className="h-4 w-4" /> {t("Add Service")}
                </Button>
              </div>
              {types.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg border-muted">
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground mb-1 font-medium">
                    {t("No services added yet")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("Add your first service to start accepting bookings")}
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {types.map((tp, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between rounded-lg border border-input p-3 bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="text-sm flex-1">
                        <div className="font-medium text-base mb-1">
                          {tp.name}
                        </div>
                        <div className="text-muted-foreground text-xs flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {tp.duration}m
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-primary">
                            €{tp.price}
                          </span>
                          {tp.category && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[10px]">
                              {tp.category}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 p-2 rounded transition-colors"
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
        <div className="flex items-center justify-between gap-2 pt-2">
          <Button
            iconType="back"
            variant="outline"
            onClick={back}
            disabled={step === 0}
            className="flex-1 sm:flex-initial"
          >
            {t("Back")}
          </Button>
          {step < stepLabels.length - 1 ? (
            <Button
              iconType="next"
              onClick={handleNext}
              className="flex-1 sm:flex-initial"
            >
              {t("Next")}
            </Button>
          ) : (
            <Button
              iconType="confirm"
              onClick={handleFinish}
              disabled={submitting}
              className="flex-1 sm:flex-initial"
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
          <div className="flex justify-center gap-2 pt-2">
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
