"use client";

import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  AppointmentType,
  SelectOptionsAppointmentType,
} from "@/Global/Types/types";
import React, { useState, useEffect } from "react";
import { LabeledSelect } from "@/components/customUIComponents/LabeledSelect";
import { FormGrid } from "@/Global/Styles/FormGrid";
import callApi from "@/app/Api/callApi";
import { Modal } from "@/components/customUIComponents/Modal";
import { Clock } from "lucide-react";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";

interface CreateAppointmantProps {
  newAppointment: {
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    date: string;
    time: string;
    appointmentTypeId: string;
    notes: string;
    staffId: string;
  };
  setNewAppointment: React.Dispatch<
    React.SetStateAction<{
      clientName: string;
      clientEmail: string;
      clientPhone: string;
      date: string;
      time: string;
      appointmentTypeId: string;
      notes: string;
      staffId: string;
    }>
  >;
  appointmentTypes: AppointmentType[] | null;
  appoitmentTypesOptions: SelectOptionsAppointmentType[];
  handleCreateAppointment: (appointmentData: any) => void; // Променено да приема параметър
  setIsCreateModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreateAppointmant = ({
  newAppointment,
  setNewAppointment,
  handleCreateAppointment,
  appoitmentTypesOptions,
  setIsCreateModalOpen,
  appointmentTypes,
}: CreateAppointmantProps) => {
  const { t } = useTranslation();
  const [availableStaff, setAvailableStaff] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [closestSlot, setClosestSlot] = useState<any>(null);
  const [isClosestSlotModalOpen, setIsClosestSlotModalOpen] = useState(false);
  const [loadingClosestSlot, setLoadingClosestSlot] = useState(false);

  useEffect(() => {
    const fetchStaff = async () => {
      if (newAppointment.appointmentTypeId) {
        const selectedService = appointmentTypes?.find(
          (type) => type._id === newAppointment.appointmentTypeId
        );
        if (selectedService && selectedService.staffIds) {
          const staffDetails = await callApi(`/api/staff/by-ids`, "POST", {
            staffIds: selectedService.staffIds,
          });
          setAvailableStaff(staffDetails);
        }
      }
    };
    fetchStaff();
  }, [newAppointment.appointmentTypeId, appointmentTypes]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (
        newAppointment.staffId &&
        newAppointment.date &&
        newAppointment.appointmentTypeId
      ) {
        const slots = await callApi(
          `/api/appointment/availability?staffId=${newAppointment.staffId}&date=${newAppointment.date}&serviceId=${newAppointment.appointmentTypeId}`,
          "GET"
        );
        setAvailableSlots(slots.slots);
      }
    };
    fetchSlots();
  }, [
    newAppointment.staffId,
    newAppointment.date,
    newAppointment.appointmentTypeId,
  ]);

  useEffect(() => {
    console.log(
      "staffid",
      newAppointment.staffId,
      newAppointment.appointmentTypeId
    );
    const fetchClosestSlot = async () => {
      if (newAppointment.appointmentTypeId && newAppointment.staffId) {
        setLoadingClosestSlot(true);
        const response = await callApi(
          `/api/appointment/closest-slot?staffId=${newAppointment.staffId}&serviceId=${newAppointment.appointmentTypeId}`,
          "GET"
        );

        if (response.slot) {
          console.log("response.slot", response.slot);
          setClosestSlot(response.slot);
          setIsClosestSlotModalOpen(true);
        } else {
          setClosestSlot(null);
        }
        setLoadingClosestSlot(false);
      }
    };
    fetchClosestSlot();
  }, [newAppointment.appointmentTypeId, newAppointment.staffId]);

  const handleSaveClosestSlot = () => {
    if (closestSlot) {
      const updatedAppointmentData = {
        ...newAppointment,
        date: closestSlot.date,
        time: closestSlot.startTime,
      };
      handleCreateAppointment(updatedAppointmentData);
      setIsClosestSlotModalOpen(false);
    }
  };

  const handleManualSelection = () => {
    setIsClosestSlotModalOpen(false);
  };

  const handleCreateButton = () => {
    handleCreateAppointment(newAppointment);
  };

  return (
    <div className="space-y-6">
      <FormGrid>
        <LabeledInput
          label={t("Client Name")}
          id="clientName"
          value={newAppointment.clientName}
          onChange={(e) =>
            setNewAppointment((prev) => ({
              ...prev,
              clientName: e.target.value,
            }))
          }
          placeholder={t("Enter client name")}
        />
        <LabeledInput
          label={t("Email")}
          id="clientEmail"
          type="email"
          value={newAppointment.clientEmail}
          onChange={(e) =>
            setNewAppointment((prev) => ({
              ...prev,
              clientEmail: e.target.value,
            }))
          }
          placeholder={t("client@example.com")}
          // icon={<Mail size={20} />}
        />
        <LabeledInput
          label={t("Phone")}
          id="clientPhone"
          type="tel"
          value={newAppointment.clientPhone}
          onChange={(e) =>
            setNewAppointment((prev) => ({
              ...prev,
              clientPhone: e.target.value,
            }))
          }
          placeholder={t("+1 (555) 123-4567")}
        />
        <LabeledSelect
          label={t("Appointment Type")}
          id="appointmentType"
          value={newAppointment.appointmentTypeId}
          onValueChange={(value) =>
            setNewAppointment((prev) => ({
              ...prev,
              appointmentTypeId: value,
              staffId: "",
              date: "",
              time: "",
            }))
          }
          placeholder={t("Select appointment type")}
          options={appoitmentTypesOptions}
        />
        {newAppointment.appointmentTypeId && (
          <LabeledSelect
            label={t("Staff")}
            id="staff"
            value={newAppointment.staffId}
            onValueChange={(value) =>
              setNewAppointment((prev) => ({
                ...prev,
                staffId: value,
                date: "",
                time: "",
              }))
            }
            placeholder={t("Select a staff member")}
            options={availableStaff.map((staff) => ({
              id: staff._id,
              name: `${staff.firstName} ${staff.lastName}`,
            }))}
          />
        )}
        <LabeledInput
          label={t("Date")}
          id="date"
          type="date"
          value={newAppointment.date}
          onChange={(e) =>
            setNewAppointment((prev) => ({ ...prev, date: e.target.value }))
          }
        />
        {newAppointment.staffId && newAppointment.date && (
          <LabeledSelect
            label={t("Time")}
            id="time"
            value={newAppointment.time}
            onValueChange={(value) =>
              setNewAppointment((prev) => ({ ...prev, time: value }))
            }
            placeholder={t("Select time")}
            options={availableSlots.map((slot) => ({
              id: slot.startTime,
              name: `${slot.startTime} - ${slot.endTime}`,
            }))}
          />
        )}
      </FormGrid>
      <LabeledInput
        label={t("Notes (Optional)")}
        id="notes"
        value={newAppointment.notes}
        onChange={(e) =>
          setNewAppointment((prev) => ({ ...prev, notes: e.target.value }))
        }
        placeholder={t("Add any additional notes or special requirements...")}
        rows={2}
      />
      {newAppointment.appointmentTypeId && (
        <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
          {(() => {
            const selectedType = appointmentTypes?.find(
              (type) => type._id === newAppointment.appointmentTypeId
            );
            return selectedType ? (
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">
                  {t("Selected Service")}
                </h4>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{selectedType.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedType.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${selectedType.price}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedType.duration} {t("minutes")}
                    </p>
                  </div>
                </div>
              </div>
            ) : null;
          })()}
        </div>
      )}
      <div className="flex justify-center gap-3">
        <Button
          iconType="cancel"
          variant="outline"
          onClick={() => setIsCreateModalOpen(false)}
        >
          {t("Cancel")}
        </Button>
        <Button
          iconType="save"
          onClick={handleCreateButton}
          disabled={
            !newAppointment.clientName ||
            !newAppointment.clientEmail ||
            !newAppointment.date ||
            !newAppointment.time ||
            !newAppointment.appointmentTypeId ||
            !newAppointment.staffId
          }
        >
          {t("Create")}
        </Button>
      </div>

      {isClosestSlotModalOpen && closestSlot && (
        <Modal
          label={t("Closest Available Time")}
          open={isClosestSlotModalOpen}
          onOpenChange={setIsClosestSlotModalOpen}
        >
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Clock className="w-10 h-10 text-primary" />
            </div>
            <p className="text-lg text-white font-medium">
              {t("The closest available time is:")}
            </p>
            <h3 className="text-2xl font-bold text-primary mt-2">
              {closestSlot.startTime} - {closestSlot.endTime} on{" "}
              {closestSlot.date}
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              {t("Would you like to book this time?")}
            </p>
          </div>
          <div className="flex gap-3 pt-6">
            <Button
              variant="outline"
              onClick={handleManualSelection}
              className="flex-1 rounded-xl bg-transparent"
            >
              {t("Continue to manual selection")}
            </Button>
            <Button
              onClick={handleSaveClosestSlot}
              className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 rounded-xl"
            >
              {t("Book this time")}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CreateAppointmant;
