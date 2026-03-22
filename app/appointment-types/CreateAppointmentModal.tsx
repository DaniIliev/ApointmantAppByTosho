import React, { useEffect, useState, useMemo } from "react";
import { Modal } from "@/components/customUIComponents/Modal";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { LabeledSelect } from "@/components/customUIComponents/LabeledSelect"; // Assuming LabeledSelect is saved here or a similar path
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Check, ChevronsUpDown, Loader2, Upload, X } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Avatar, AvatarFallback } from "@/components/ui/avatar"; // Assuming you have Avatar component from shadcn/ui
import { Badge } from "@/components/ui/badge"; // Assuming you have Badge component from shadcn/ui

import { cn } from "@/lib/utils";
import callApi from "../Api/callApi";
import { getCategoryOptions } from "@/Global/Types/types";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// --- Type Definitions ---

type CreateAppointmentModalProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  editingType: any;
  formData: any; // Consider making this more specific
  setFormData: (data: any) => void; // Consider making this more specific
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  colorOptions: string[];
};

type StaffMember = {
  _id: string;
  firstName: string;
  lastName: string;
};

type PaymentOption = "cash" | "card" | "cash_and_card";

const StaffAvatarsDisplay = ({
  selectedStaffIds,
  staffMembers,
  onRemove,
}: {
  selectedStaffIds: string[];
  staffMembers: StaffMember[];
  onRemove: (staffId: string) => void;
}) => {
  const selectedStaff = useMemo(() => {
    return staffMembers.filter((s) => selectedStaffIds.includes(s._id));
  }, [selectedStaffIds, staffMembers]);

  if (selectedStaff.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {selectedStaff.map((staff) => (
        <Badge
          key={staff._id}
          className="cursor-pointer pr-1 flex items-center bg-secondary hover:bg-secondary/80 transition-colors"
          onClick={() => onRemove(staff._id)}
        >
          <Avatar className="h-6 w-6 mr-1">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {staff.firstName[0]}
              {staff.lastName[0]}
            </AvatarFallback>
          </Avatar>
          {staff.firstName}
          <X className="ml-1 h-3 w-3" />{" "}
          {/* Add an 'X' icon for visual removal cue */}
        </Badge>
      ))}
    </div>
  );
};

// --- Main Component ---

const CreateAppointmentModal = ({
  isModalOpen,
  setIsModalOpen,
  editingType,
  formData,
  setFormData,
  handleSubmit,
  isLoading,
  colorOptions,
}: CreateAppointmentModalProps) => {
  const { t } = useTranslation();
  const { user } = useAuthContext();
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [open, setOpen] = useState(false); // State for Popover visibility
  const [selectedCategory, setSelectedCategory] = useState<string>(
    formData.category || ""
  );
  const [checkingStripe, setCheckingStripe] = useState(false);
  const [stripeMessage, setStripeMessage] = useState<string | null>(null);
  const [showStripePrompt, setShowStripePrompt] = useState(false);
  const [pendingPaymentOption, setPendingPaymentOption] =
    useState<PaymentOption | null>(null);
  const [locations, setLocations] = useState<any[]>([]);

  const paymentOptions = useMemo(
    () => [
      {
        value: "cash" as PaymentOption,
        title: t("Cash only"),
        description: t("Customer pays in person."),
      },
      {
        value: "card" as PaymentOption,
        title: t("Card only"),
        description: t("Require online payment during booking."),
      },
      {
        value: "cash_and_card" as PaymentOption,
        title: t("Cash or card"),
        description: t("Allow customer to choose at checkout."),
      },
    ],
    [t]
  );

  const categoryOptions = getCategoryOptions(t);
  useEffect(() => {
    if (isModalOpen) {
      const fetchStaff = async () => {
        try {
          const staffList = await callApi(
            `/api/staff/staff-list?businessId=${user?.businessId}`,
            "GET"
          );
          setStaffMembers(staffList);
        } catch (error) {
          console.error("Failed to fetch staff members:", error);
        }
      };
      const fetchLocations = async () => {
        try {
          const locs = await callApi(
            `/api/locations?businessId=${user?.businessId}`,
            "GET"
          );
          setLocations(locs.map((l: any) => ({ id: l._id, name: l.name })));
        } catch (error) {
          console.error("Failed to fetch locations:", error);
        }
      };
      fetchStaff();
      fetchLocations();

      // Ensure a default payment option is present
      if (!formData.paymentOption) {
        setFormData((prev: any) => ({ ...prev, paymentOption: "cash" }));
      }
    }
  }, [isModalOpen, user?.businessId, formData.paymentOption, setFormData]);

  // Handle category change and reset subcategory if needed
  const handleCategoryChange = (newCategory: string) => {
    setSelectedCategory(newCategory);
    setFormData((prev: any) => ({
      ...prev,
      category: newCategory,
      subCategory: "",
    }));
  };

  const handleRemoveStaff = (staffId: string) => {
    setFormData((prev: any) => ({
      ...prev,
      staffMembers: prev.staffMembers.filter((id: string) => id !== staffId),
    }));
  };

  const currentPaymentOption: PaymentOption =
    (formData.paymentOption as PaymentOption) || "cash";

  const ensureStripeReady = async (option: PaymentOption) => {
    setStripeMessage(null);

    if (option === "cash") {
      setFormData((prev: any) => ({ ...prev, paymentOption: option }));
      return;
    }

    setCheckingStripe(true);
    try {
      const status = await callApi("/api/stripe/connect/status", "GET");
      const ready = Boolean(
        status?.ready ?? status?.details_submitted ?? status?.charges_enabled
      );

      if (!ready) {
        setPendingPaymentOption(option);
        setShowStripePrompt(true);
        return;
      }

      setFormData((prev: any) => ({ ...prev, paymentOption: option }));
      setStripeMessage(t("Stripe account ready for card payments."));
    } catch (error: any) {
      console.error("Stripe connect check failed", error);
      setStripeMessage(
        error?.message || t("Connect Stripe to enable card payments.")
      );
      setFormData((prev: any) => ({ ...prev, paymentOption: "cash" }));
      setPendingPaymentOption(null);
      setShowStripePrompt(false);
    } finally {
      setCheckingStripe(false);
    }
  };

  const handlePaymentSelect = (option: PaymentOption) => {
    ensureStripeReady(option);
  };

  return (
    <Modal
      open={isModalOpen}
      onOpenChange={setIsModalOpen}
      label={editingType ? "Edit Appointment Type" : "New Appointment Type"}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category and Subcategory Dropdowns */}
        <div className="grid grid-cols-2 gap-4">
          <LabeledSelect<string>
            id="category"
            label="Category"
            value={formData.category}
            onValueChange={handleCategoryChange}
            placeholder="Select a category"
            options={categoryOptions}
          />
        </div>

        <LabeledSelect<string>
          id="locationId"
          label={t("Location")}
          value={formData.locationId}
          onValueChange={(val) => setFormData((prev: any) => ({ ...prev, locationId: val }))}
          placeholder={t("Select a location")}
          options={locations}
        />

        <LabeledInput
          id="name"
          label="Name"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev: any) => ({ ...prev, name: e.target.value }))
          }
          placeholder="e.g., Business Consultation"
        />

        <div className="space-y-2">
          <LabeledInput
            label={t("Description (Optional)")}
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            placeholder={t("Brief description of the service")}
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <LabeledInput
            id="duration"
            label="Duration (minutes)"
            value={formData.duration}
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                duration: e.target.value,
              }))
            }
            placeholder="60"
            type="number"
          />
          <LabeledInput
            id="price"
            label="Price ($)"
            value={formData.price}
            onChange={(e) =>
              setFormData((prev: any) => ({ ...prev, price: e.target.value }))
            }
            placeholder="150.00"
            type="number"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Payment options</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {paymentOptions.map((option) => {
              const selected = currentPaymentOption === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handlePaymentSelect(option.value)}
                  disabled={checkingStripe || isLoading}
                  className={cn(
                    "w-full text-left border rounded-lg p-3 transition focus:outline-none",
                    "hover:border-primary/60 hover:shadow-sm",
                    selected
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border bg-card/60"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">
                      {option.title}
                    </span>
                    {selected && <Check className="h-4 w-4 text-primary" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>
          {checkingStripe && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("Checking Stripe status...")}
            </div>
          )}
          {stripeMessage && (
            <p className="text-sm text-muted-foreground">{stripeMessage}</p>
          )}
        </div>

        {/* Staff Selection with Avatar Display */}
        <div className="space-y-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                {formData.staffMembers.length > 0
                  ? `${formData.staffMembers.length} staff selected`
                  : "Select staff members..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
              <Command>
                <CommandInput placeholder="Search staff..." />
                <CommandEmpty>No staff found.</CommandEmpty>
                <CommandGroup>
                  {staffMembers.map((staff) => {
                    const isSelected = formData.staffMembers.some(
                      (s: { _id: string }) => s._id === staff._id
                    );
                    return (
                      <CommandItem
                        key={staff._id}
                        value={`${staff.firstName} ${staff.lastName}`} // Add value for search
                        onSelect={() => {
                          let newSelected = [...formData.staffMembers];
                          if (isSelected) {
                            // ПРЕМАХВАНЕ: Филтрираме обекта по _id
                            newSelected = newSelected.filter(
                              (s) => s._id !== staff._id
                            );
                          } else {
                            // ДОБАВЯНЕ: Добавяме обекта с _id и name
                            newSelected.push({
                              _id: staff._id,
                              name: `${staff.firstName} ${staff.lastName}`,
                            });
                          }
                          setFormData((prev: any) => ({
                            ...prev,
                            staffMembers: newSelected,
                          }));
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {`${staff.firstName} ${staff.lastName}`}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <StaffAvatarsDisplay
            selectedStaffIds={formData.staffMembers}
            staffMembers={staffMembers}
            onRemove={handleRemoveStaff}
          />
        </div>
        <div className="space-y-2">
          {/* <Label htmlFor="image" className="text-sm font-medium">
            Image
          </Label> */}
          <label
            htmlFor="image"
            className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-input rounded-xl cursor-pointer bg-input/20 hover:bg-input/40 transition-colors duration-300"
          >
            <Upload className="h-6 w-6 text-gray-500 mb-1" />
            <span className="text-sm text-gray-600">
              {formData.imageUrl
                ? `1 file selected: ${formData.imageUrl.name || "Image"}`
                : "Click to upload or drag & drop"}
            </span>
            <Input
              id="image"
              type="file"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  imageUrl: e.target.files?.[0] || null,
                })
              }
              className="sr-only"
              accept="image/*"
            />
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsModalOpen(false)}
            disabled={isLoading}
            iconType="cancel"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} iconType="save">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {editingType ? "Updating..." : "Creating..."}
              </>
            ) : editingType ? (
              "Update"
            ) : (
              "Create"
            )}
          </Button>
        </div>
      </form>

      <Dialog open={showStripePrompt} onOpenChange={setShowStripePrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("Connect Stripe to take card payments")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "You'll be redirected to Stripe to complete onboarding. It takes about 2 minutes."
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowStripePrompt(false);
                setPendingPaymentOption(null);
                setFormData((prev: any) => ({
                  ...prev,
                  paymentOption: "cash",
                }));
              }}
            >
              {t("Later")}
            </Button>
            <Button
              disabled={checkingStripe}
              onClick={async () => {
                if (!pendingPaymentOption) {
                  setShowStripePrompt(false);
                  return;
                }
                setCheckingStripe(true);
                try {
                  const returnUrl =
                    typeof window !== "undefined"
                      ? window.location.href
                      : undefined;
                  const link = await callApi(
                    "/api/stripe/connect/link",
                    "POST",
                    {
                      returnUrl,
                      refreshUrl: returnUrl,
                    }
                  );
                  const onboardingUrl = link?.url || link?.onboardingUrl;
                  if (onboardingUrl && typeof window !== "undefined") {
                    window.location.href = onboardingUrl;
                    return;
                  }
                  throw new Error("Stripe onboarding link not available");
                } catch (error: any) {
                  console.error("Stripe onboarding launch failed", error);
                  setStripeMessage(
                    error?.message ||
                      t("Connect Stripe to enable card payments.")
                  );
                  setShowStripePrompt(false);
                  setPendingPaymentOption(null);
                  setFormData((prev: any) => ({
                    ...prev,
                    paymentOption: "cash",
                  }));
                } finally {
                  setCheckingStripe(false);
                }
              }}
            >
              {checkingStripe ? t("Opening...") : t("Connect now")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Modal>
  );
};

export default CreateAppointmentModal;
