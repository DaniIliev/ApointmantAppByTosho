import React, { useEffect, useState, useMemo } from "react";
import { Modal } from "@/components/customUIComponents/Modal";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { LabeledSelect } from "@/components/customUIComponents/LabeledSelect"; // Assuming LabeledSelect is saved here or a similar path
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { getCategoryOptions, SelectOption } from "@/Global/Types/types";
import { useTranslation } from "react-i18next";
import { MultiSelectCombobox } from "@/components/customUIComponents/MultiSelectCombobox";

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

type StaffItem = {
  _id: string; // Оригиналният ID от API/DB
  id: string; // ID, който се изисква от MultiSelectCombobox
  firstName: string;
  lastName: string;
  role: string; // Добавихме 'role', за да можем да го покажем в getLabel
  [key: string]: any; // Запазваме гъвкавостта
};

type StaffMember = {
  _id: string;
  firstName: string;
  lastName: string;
};

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
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [open, setOpen] = useState(false); // State for Popover visibility
  const [selectedCategory, setSelectedCategory] = useState<string>(
    formData.category || ""
  );

  const categoryOptions = getCategoryOptions(t);
  useEffect(() => {
    if (isModalOpen) {
      const fetchStaff = async () => {
        try {
          // You might want to consider memoizing the fetch or using a global state management solution
          const staffList = await callApi("/api/staff/staff-list", "GET");
          console.log("stafflist", staffList);
          setStaffMembers(staffList);
        } catch (error) {
          console.error("Failed to fetch staff members:", error);
        }
      };
      fetchStaff();
    }
  }, [isModalOpen]);

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
            // isSearchable={true}
            // isMulti={true}
          />

          {/* <LabeledSelect<string>
            id="subCategory"
            label="Subcategory"
            value={formData.subCategory}
            onValueChange={(value) =>
              setFormData((prev: any) => ({ ...prev, subCategory: value }))
            }
            placeholder="Select a subcategory"
            options={currentSubCategoryOptions}
          /> */}
        </div>

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
    </Modal>
  );
};

export default CreateAppointmentModal;
