import React, { useEffect, useState } from "react";
import { Modal } from "@/components/customUIComponents/Modal";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { LabeledSelect } from "@/components/customUIComponents/LabeledSelect"; // Assuming LabeledSelect is saved here or a similar path
import { ImageUpload } from "@/components/customUIComponents/ImageUpload";
import { MultiSelectCombobox } from "@/components/customUIComponents/MultiSelectCombobox";
import { PaymentOptionSelector } from "@/components/customUIComponents/PaymentOptionSelector";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import callApi from "../Api/callApi";
import { getCategoryOptions, PaymentOption } from "@/Global/Types/types";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "@/context/AuthContext";

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
  const [locations, setLocations] = useState<any[]>([]);

  const categoryOptions = getCategoryOptions(t);
  useEffect(() => {
    if (isModalOpen) {
      const fetchStaff = async () => {
        try {
          const staffList = await callApi(
            `/api/staff/staff-list?businessId=${user?.businessId}`,
            "GET",
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
            "GET",
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
    setFormData((prev: any) => ({
      ...prev,
      category: newCategory,
      subCategory: "",
    }));
  };

  const selectedStaffIds: string[] = (formData.staffMembers || []).map(
    (staff: { _id: string }) => staff._id,
  );

  const handleStaffIdsChange = (newIds: string[]) => {
    const selectedStaff = newIds
      .map((id) => {
        const staff = staffMembers.find((member) => member._id === id);
        if (!staff) return null;
        return {
          _id: staff._id,
          name: `${staff.firstName} ${staff.lastName}`,
        };
      })
      .filter(Boolean);

    setFormData((prev: any) => ({
      ...prev,
      staffMembers: selectedStaff,
    }));
  };

  return (
    <Modal
      open={isModalOpen}
      onOpenChange={setIsModalOpen}
      label={editingType ? "Edit Appointment Type" : "New Appointment Type"}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <LabeledSelect<string>
          id="category"
          label={t("Category")}
          value={formData?.category || ""}
          onValueChange={handleCategoryChange}
          placeholder={t("Select a category")}
          options={categoryOptions}
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
        <div className="grid grid-cols-2 gap-4">
          <LabeledInput
            id="duration"
            label={t("Duration (minutes)")}
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
            label={t("Price (€)")}
            value={formData.price}
            onChange={(e) =>
              setFormData((prev: any) => ({ ...prev, price: e.target.value }))
            }
            placeholder="150.00"
            type="number"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <LabeledSelect<string>
            id="locationId"
            label={t("Location")}
            value={formData.locationId}
            onValueChange={(val) =>
              setFormData((prev: any) => ({ ...prev, locationId: val }))
            }
            placeholder={t("Select a location")}
            options={locations}
          />
          <MultiSelectCombobox
            label={t("Staff members")}
            items={staffMembers.map((staff) => ({
              id: staff._id,
              name: `${staff.firstName} ${staff.lastName}`,
            }))}
            selectedIds={selectedStaffIds}
            onSelectIdsChange={handleStaffIdsChange}
            getLabel={(item) => item.name}
            searchPlaceholder={t("Search staff...")}
            emptyMessage={t("No staff found.")}
          />
        </div>
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
          />
        </div>

        {/* Group Appointment Settings */}
        <div className="p-4 rounded-xl border border-primary/10 bg-primary/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold">
                {t("Group Appointment")}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t("Allow multiple clients to book the same time slot.")}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setFormData((prev: any) => ({
                  ...prev,
                  isGroup: !prev.isGroup,
                }))
              }
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                formData.isGroup ? "bg-primary" : "bg-gray-300",
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  formData.isGroup ? "translate-x-6" : "translate-x-1",
                )}
              />
            </button>
          </div>

          {formData.isGroup && (
            <div className="pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <LabeledInput
                id="capacity"
                label={t("Max Clients (Capacity)")}
                value={formData.capacity}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    capacity: e.target.value,
                  }))
                }
                placeholder="10"
                type="number"
                min="1"
              />
            </div>
          )}
        </div>

        <PaymentOptionSelector
          value={(formData.paymentOption as PaymentOption) || "cash"}
          onChange={(option) =>
            setFormData((prev: any) => ({ ...prev, paymentOption: option }))
          }
          disabled={isLoading}
        />
        <div className="space-y-2">
          <ImageUpload
            value={formData.imageUrl}
            onChange={(file) =>
              setFormData({
                ...formData,
                imageUrl: file,
              })
            }
            fullWidth
            onRemove={() =>
              setFormData({
                ...formData,
                imageUrl: null,
              })
            }
          />
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
    </Modal>
  );
};

export default CreateAppointmentModal;
