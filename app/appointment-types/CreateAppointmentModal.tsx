// components/CreateAppointmentModal.tsx
import React, { useEffect, useState } from "react";
import { Modal } from "@/components/customUIComponents/Modal";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

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

import { cn } from "@/lib/utils";
import callApi from "../Api/callApi";

type CreateAppointmentModalProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  editingType: any;
  formData: any;
  setFormData: (data: any) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  colorOptions: string[];
};
type StaffMember = {
  _id: string;
  firstName: string;
  lastName: string;
};

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
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      const fetchStaff = async () => {
        try {
          // const staffList = await callApi("/api/staff", "GET");
          const staffList = await callApi("/api/staff/staff-list", "GET");
          setStaffMembers(staffList);
        } catch (error) {
          console.error("Failed to fetch staff members:", error);
        }
      };
      fetchStaff();
    }
  }, [isModalOpen]);
  return (
    <Modal
      open={isModalOpen}
      onOpenChange={setIsModalOpen}
      label={editingType ? "Edit Appointment Type" : "New Appointment Type"}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
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
          <Label htmlFor="description" className="text-sm font-medium">
            Description
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            placeholder="Brief description of the service"
            className="border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl"
            rows={3}
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

        {/* НОВО ПОЛЕ ЗА ИЗБОР НА СЛУЖИТЕЛИ С SHADCN */}
        <div className="space-y-2">
          <Label htmlFor="staffMembers" className="text-sm font-medium">
            Assign Staff
          </Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                {formData.staffMembers.length > 0
                  ? `${formData.staffMembers.length} selected`
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
                    const isSelected = formData.staffMembers.includes(
                      staff._id
                    );
                    return (
                      <CommandItem
                        key={staff._id}
                        onSelect={() => {
                          let newSelected = [...formData.staffMembers];
                          if (isSelected) {
                            newSelected = newSelected.filter(
                              (id) => id !== staff._id
                            );
                          } else {
                            newSelected.push(staff._id);
                          }
                          console.log("newSelected", newSelected);
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
        </div>

        {/* ... (останалите полета) ... */}
        <div className="space-y-2">
          <Label htmlFor="image" className="text-sm font-medium">
            Image
          </Label>
          <Input
            id="image"
            type="file"
            onChange={(e) =>
              setFormData({
                ...formData,
                imageUrl: e.target.files?.[0] || null,
              })
            }
            className="h-12 border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Color Theme</Label>
          <div className="grid grid-cols-4 gap-2">
            {colorOptions.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData((prev: any) => ({ ...prev, color }))}
                className={`h-10 bg-gradient-to-r ${color} rounded-lg border-2 transition-all duration-200 ${
                  formData.color === color
                    ? "border-primary scale-110"
                    : "border-transparent hover:scale-105"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsModalOpen(false)}
            className="flex-1 rounded-xl bg-transparent"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 rounded-xl"
            disabled={isLoading}
          >
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
