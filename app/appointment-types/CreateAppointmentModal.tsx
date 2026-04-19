import React, { useEffect, useState } from "react";
import { Modal } from "@/components/customUIComponents/Modal";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { LabeledSelect } from "@/components/customUIComponents/LabeledSelect";
import { ImageUpload } from "@/components/customUIComponents/ImageUpload";
import { MultiSelectCombobox } from "@/components/customUIComponents/MultiSelectCombobox";
import { PaymentOptionSelector } from "@/components/customUIComponents/PaymentOptionSelector";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, X, MapPin, Layers, ChevronRight, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import callApi from "../Api/callApi";
import { getCategoryOptions, PaymentOption } from "@/Global/Types/types";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "@/context/AuthContext";
import { useLocationContext } from "@/context/LocationContext";
import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";

// --- Type Definitions ---

type CreateAppointmentModalProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  editingType: any;
  formData: any;
  setFormData: (data: any) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
};

type StaffMember = {
  _id: string;
  firstName: string;
  lastName: string;
  locationIds: string[];
  role: string;
};

type LocationStaffAssignment = {
  locationId: string;
  staffIds: string[];
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
}: CreateAppointmentModalProps) => {
  const { t } = useTranslation();
  const { user } = useAuthContext();
  const { selectedLocation } = useLocationContext();
  
  const [creationStep, setCreationStep] = useState<"selection" | "form">("selection");
  const [creationMode, setCreationMode] = useState<"single" | "multiple">("single");
  const [staffByLocation, setStaffByLocation] = useState<Record<string, StaffMember[]>>({});
  const [locations, setLocations] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<LocationStaffAssignment[]>([]);

  const categoryOptions = getCategoryOptions(t);

  const fetchStaffForLocation = async (locId: string) => {
    if (!locId || staffByLocation[locId]) return;
    try {
      const staffList = await callApi(
        `/api/staff/staff-list?businessId=${user?.businessId}&locationId=${locId}`,
        "GET"
      );
      setStaffByLocation(prev => ({ ...prev, [locId]: staffList }));
    } catch (error) {
      console.error(`Failed to fetch staff for location ${locId}:`, error);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      const fetchData = async () => {
        try {
          const [staffList, locs] = await Promise.all([
            callApi(`/api/staff/staff-list?businessId=${user?.businessId}`, "GET"),
            callApi(`/api/locations?businessId=${user?.businessId}`, "GET")
          ]);
          
          const mappedLocs = locs.map((l: any) => ({ id: l._id, name: l.name }));
          setLocations(mappedLocs);
          
          // Pre-populate staffByLocation cache with whole business list (filtered per location in the backend later if needed, but here we have the full data already)
          const staffMap: Record<string, StaffMember[]> = {};
          locs.forEach((l: any) => {
            staffMap[l._id] = staffList.filter((s: any) => 
              s.role === "business" || (s.locationIds || []).includes(l._id)
            );
          });
          setStaffByLocation(staffMap);

          if (editingType) {
            setCreationStep("form");
            const locIds: string[] = editingType.locationIds || (editingType.locationId ? [editingType.locationId] : []);
            setCreationMode(locIds.length > 1 ? "multiple" : "single");
            
            // Reconstruct assignments by checking which service-staff member belongs to which location
            const initialAssignments = locIds.map(locId => ({
              locationId: locId,
              staffIds: (editingType.staffMembers || [])
                .filter((s: any) => {
                  const fullStaff = staffList.find((m: any) => m._id === s._id);
                  return fullStaff?.role === "business" || (fullStaff?.locationIds || []).includes(locId);
                })
                .map((s: any) => s._id)
            }));
            
            setAssignments(initialAssignments.length > 0 ? initialAssignments : [{ locationId: "", staffIds: [] }]);
          } else {
            setCreationStep("selection");
            setAssignments([{ locationId: selectedLocation?._id || "", staffIds: [] }]);
          }
        } catch (error) {
          console.error("Failed to fetch creation data:", error);
        }
      };
      fetchData();

      if (!formData.paymentOption) {
        setFormData((prev: any) => ({ ...prev, paymentOption: "cash" }));
      }
    }
  }, [isModalOpen, editingType, user?.businessId, selectedLocation?._id]);

  const handleModeSelect = (mode: "single" | "multiple") => {
    setCreationMode(mode);
    setCreationStep("form");
    if (mode === "single" && selectedLocation?._id) {
      setFormData((prev: any) => ({ ...prev, locationIds: [selectedLocation._id] }));
      setAssignments([{ locationId: selectedLocation._id, staffIds: [] }]);
      fetchStaffForLocation(selectedLocation._id);
    }
  };

  const addAssignment = () => {
    setAssignments([...assignments, { locationId: "", staffIds: [] }]);
  };

  const removeAssignment = (index: number) => {
    const newAssignments = assignments.filter((_, i) => i !== index);
    setAssignments(newAssignments);
    updateGlobalStaffAndLocations(newAssignments);
  };

  const updateAssignment = (index: number, field: keyof LocationStaffAssignment, value: any) => {
    const newAssignments = assignments.map((a, i) => (i === index ? { ...a, [field]: value } : a));
    if (field === "locationId") {
      newAssignments[index].staffIds = []; // Reset staff when location changes
      if (value) fetchStaffForLocation(value);
    }
    setAssignments(newAssignments);
    updateGlobalStaffAndLocations(newAssignments);
  };

  const updateGlobalStaffAndLocations = (currentAssignments: LocationStaffAssignment[]) => {
    const allStaffIds = Array.from(new Set(currentAssignments.flatMap(a => a.staffIds)));
    const allLocationIds = Array.from(new Set(currentAssignments.map(a => a.locationId).filter(Boolean)));
    
    // Collect selected staff from all loaded location staff lists
    const allLoadedStaff = Object.values(staffByLocation).flat();
    const selectedStaff = allStaffIds.map(id => {
      const staff = allLoadedStaff.find(m => String(m._id) === String(id));
      return staff ? { _id: staff._id, name: `${staff.firstName} ${staff.lastName}` } : null;
    }).filter(Boolean);

    setFormData((prev: any) => ({
      ...prev,
      staffMembers: selectedStaff,
      locationIds: allLocationIds,
      locationId: allLocationIds[0] || null // For legacy support
    }));
  };

  const renderSelectionStep = () => (
    <div className="space-y-4 py-4 animate-in fade-in zoom-in duration-300">
      <h2 className="text-xl font-bold text-center mb-6">{t("Where would you like to offer this service?")}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Single Location Option */}
        <div 
          onClick={() => handleModeSelect("single")}
          className="group relative p-6 rounded-2xl border-2 border-transparent bg-white shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer overflow-hidden"
        >
          <div className="relative z-10 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{t("Current Location")}</h3>
              <p className="text-sm text-muted-foreground">{selectedLocation?.name || t("Only for the current branch")}</p>
            </div>
            <div className="flex items-center text-primary text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              <span>{t("Select")}</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
        </div>

        {/* Multiple Locations Option */}
        <div 
          onClick={() => handleModeSelect("multiple")}
          className="group relative p-6 rounded-2xl border-2 border-transparent bg-white shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer overflow-hidden"
        >
          <div className="relative z-10 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{t("Multiple Locations")}</h3>
              <p className="text-sm text-muted-foreground">{t("Distribute across various branches")}</p>
            </div>
            <div className="flex items-center text-blue-600 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              <span>{t("Select")}</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors" />
        </div>
      </div>
    </div>
  );

  const renderFormStep = () => (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <LabeledSelect<string>
        id="category"
        label={t("Category")}
        value={formData?.category || ""}
        onValueChange={(val) => setFormData((prev: any) => ({ ...prev, category: val, subCategory: "" }))}
        placeholder={t("Select a category")}
        options={categoryOptions}
      />
      <LabeledInput
        id="name"
        label={t("Name")}
        value={formData.name}
        onChange={(e) => setFormData((prev: any) => ({ ...prev, name: e.target.value }))}
        placeholder="e.g., Business Consultation"
      />
      
      <div className="grid grid-cols-2 gap-4">
        <LabeledInput
          id="duration"
          label={t("Duration (minutes)")}
          value={formData.duration}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, duration: e.target.value }))}
          placeholder="60"
          type="number"
        />
        <LabeledInput
          id="price"
          label={t("Price (€)")}
          value={formData.price}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, price: e.target.value }))}
          placeholder="150.00"
          type="number"
        />
      </div>

      {/* Location Assignment Section */}
      <div className="space-y-3">
        <div className="space-y-4">
          {assignments.map((assignment, index) => {
            const targetLocId = creationMode === "single" ? selectedLocation?._id : assignment.locationId;
            const assignmentStaffList = targetLocId ? (staffByLocation[targetLocId] || []) : [];

            return (
              <div key={index} className="space-y-3">
                {creationMode === "multiple" && (
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <LabeledSelect<string>
                        id={`loc-${index}`}
                        label={t("Location")}
                        value={assignment.locationId}
                        onValueChange={(val) => updateAssignment(index, "locationId", val)}
                        placeholder={t("Select location")}
                        options={locations}
                        // className="bg-white"
                      />
                    </div>
                    <CustomTooltip
                      onClick={addAssignment}
                      tooltipText={t("Add Location")}
                      icon={<Plus />}
                    />
                    {assignments.length > 1 && (
                      <CustomTooltip
                        onClick={() => removeAssignment(index)}
                        tooltipText={t("Remove Location")}
                        icon={<Trash2 className="text-red-500"/>}
                      />
                    )}
                  </div>
                )}
                
                <MultiSelectCombobox
                  label={t("Staff available at this location")}
                  items={assignmentStaffList.map((staff) => ({
                    id: staff._id,
                    name: `${staff.firstName} ${staff.lastName}`,
                  }))}
                  selectedIds={assignment.staffIds}
                  onSelectIdsChange={(ids) => updateAssignment(index, "staffIds", ids)}
                  getLabel={(item) => item.name}
                  searchPlaceholder={t("Search staff...")}
                  emptyMessage={assignment.locationId || creationMode === "single" ? t("No staff found for this location.") : t("Please select a location first.")}
                  // disabled={creationMode === "multiple" && !assignment.locationId}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <LabeledInput
          label={t("Description (Optional)")}
          id="description"
          value={formData.description}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, description: e.target.value }))}
          placeholder={t("Brief description of the service")}
        />
      </div>

      {/* Group Appointment Settings */}
      <div className="p-4 rounded-xl border border-primary/10 bg-primary/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base font-semibold">{t("Group Appointment")}</Label>
            <p className="text-xs text-muted-foreground">{t("Allow multiple clients to book the same time slot.")}</p>
          </div>
          <button
            type="button"
            onClick={() => setFormData((prev: any) => ({ ...prev, isGroup: !prev.isGroup }))}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
              formData.isGroup ? "bg-primary" : "bg-gray-300",
            )}
          >
            <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white transition-transform", formData.isGroup ? "translate-x-6" : "translate-x-1")} />
          </button>
        </div>
        {formData.isGroup && (
          <div className="pt-2 animate-in fade-in slide-in-from-top-1">
            <LabeledInput
              id="capacity"
              label={t("Max Clients (Capacity)")}
              value={formData.capacity}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, capacity: e.target.value }))}
              placeholder="10"
              type="number"
              min="1"
            />
          </div>
        )}
      </div>

      <PaymentOptionSelector
        value={(formData.paymentOption as PaymentOption) || "cash"}
        onChange={(option) => setFormData((prev: any) => ({ ...prev, paymentOption: option }))}
        disabled={isLoading}
      />
      
      <div className="space-y-2">
        <ImageUpload
          value={formData.imageUrl}
          onChange={(file) => setFormData({ ...formData, imageUrl: file })}
          fullWidth
          onRemove={() => setFormData({ ...formData, imageUrl: null })}
        />
      </div>

      <div className="flex justify-center gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={() => editingType ? setIsModalOpen(false) : setCreationStep("selection")} disabled={isLoading}>
          {editingType ? t("Cancel") : t("Back")}
        </Button>
        <Button type="submit" disabled={isLoading || (creationMode === "multiple" && formData.locationIds?.length === 0)} className="min-w-[120px]">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : editingType ? t("Update") : t("Create")}
        </Button>
      </div>
    </form>
  );

  return (
    <Modal
      open={isModalOpen}
      onOpenChange={setIsModalOpen}
      label={editingType ? t("Edit Appointment Type") : t("New Appointment Type")}
      className={creationStep === "selection" ? "max-w-xl" : "max-w-2xl"}
    >
      {creationStep === "selection" ? renderSelectionStep() : renderFormStep()}
    </Modal>
  );
};

export default CreateAppointmentModal;
