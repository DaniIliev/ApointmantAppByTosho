"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/customUIComponents/Modal";
import { Button } from "@/components/ui/button";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { LabeledSelect } from "@/components/customUIComponents/LabeledSelect";
import { FormGrid } from "@/Global/Styles/FormGrid";
import {
  Appointment,
  AppointmentType,
  SelectOptionsAppointmentType,
} from "@/Global/Types/types";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import callApi from "@/app/Api/callApi";
import moment from "moment";
import { useAuthContext } from "@/context/AuthContext";
import { formatDateAndTime, formatPriceEUR } from "@/Global/Utils/commonFn";
import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";
import { X } from "lucide-react";

type StaffOption = {
  _id: string;
  firstName: string;
  lastName: string;
};

type SlotOption = {
  startTime: string;
  endTime: string;
};

type AppointmentEditModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  appointmentTypes: AppointmentType[] | null;
  appoitmentTypesOptions: SelectOptionsAppointmentType[];
  onAppointmentUpdated: (updatedAppointment: Appointment) => void;
};

export const AppointmentEditModal: React.FC<AppointmentEditModalProps> = ({
  open,
  onOpenChange,
  appointment,
  appointmentTypes,
  appoitmentTypesOptions,
  onAppointmentUpdated,
}) => {
  const { t } = useTranslation();
  const { user } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [availableStaff, setAvailableStaff] = useState<StaffOption[]>([]);
  const [availableSlots, setAvailableSlots] = useState<SlotOption[]>([]);

  const [formData, setFormData] = useState({
    clientName: "",
    email: "",
    clientPhone: "",
    date: "",
    time: "",
    appointmentTypeId: "",
    notes: "",
    staffId: "",
  });

  // Reset form when appointment changes or modal opens
  useEffect(() => {
    if (appointment && open) {
      // Find service ID by matching serviceName
      const serviceId = appointmentTypes?.find(
        (s) => s.name === appointment.serviceName
      )?._id;
      console.log(
        "Setting form data for appointment:",
        formatDateAndTime(appointment.appointmentTime.start, "time")
      );
      setFormData({
        clientName: appointment.clientName,
        email: appointment.email,
        clientPhone: appointment.clientPhone,
        date: moment(appointment.appointmentTime.start).format("YYYY-MM-DD"),
        time: formatDateAndTime(appointment.appointmentTime.start, "time"),
        appointmentTypeId: serviceId || "",
        notes: appointment.notes || "",
        staffId: appointment.staff._id || "",
      });
    }
  }, [appointment, open, appointmentTypes]);

  // Fetch staff when appointment type changes
  useEffect(() => {
    const fetchStaff = async () => {
      if (formData.appointmentTypeId) {
        const selectedService = appointmentTypes?.find(
          (type) => type._id === formData.appointmentTypeId
        );
        if (selectedService && selectedService.staffs) {
          const staffDetails = await callApi(`/api/staff/by-ids`, "POST", {
            staffIds: selectedService.staffs,
          });
          setAvailableStaff(staffDetails);
        }
      } else {
        setAvailableStaff([]);
      }
    };
    fetchStaff();
  }, [formData.appointmentTypeId, appointmentTypes]);

  // Fetch available slots when staff and date change
  useEffect(() => {
    const fetchSlots = async () => {
      if (formData.staffId && formData.date && formData.appointmentTypeId && appointment) {
        const slots = await callApi(
          `/api/appointment/availability?staffId=${formData.staffId}&date=${formData.date}&serviceId=${formData.appointmentTypeId}&locationId=${appointment.locationId?._id || appointment.locationId}`,
          "GET"
        );

        let finalSlots = slots.slots || [];
        if (appointment && formData.time) {
          const currentSlotExists = finalSlots.some(
            (slot: SlotOption) => slot.startTime === formData.time
          );

          if (!currentSlotExists) {
            const service = appointmentTypes?.find(
              (s) => s._id === formData.appointmentTypeId
            );
            const endTime = moment(
              `${formData.date}T${formData.time}`,
              "YYYY-MM-DDTHH:mm"
            )
              .add(service?.duration || 20, "minutes")
              .format("HH:mm");

            // Add current slot at the beginning and sort
            finalSlots = [
              { startTime: formData.time, endTime: endTime },
              ...finalSlots,
            ].sort((a, b) => a.startTime.localeCompare(b.startTime));
          }
        }

        setAvailableSlots(finalSlots);
      } else {
        setAvailableSlots([]);
      }
    };
    fetchSlots();
  }, [
    formData.staffId,
    formData.date,
    formData.appointmentTypeId,
    appointment,
    formData.time,
    appointmentTypes,
  ]);

  const handleSubmit = async () => {
    if (!appointment) return;

    try {
      setIsSubmitting(true);

      const startDateTime = moment(
        `${formData.date}T${formData.time}`
      ).toISOString();

      const payload = {
        business: user?.businessId,
        service: formData.appointmentTypeId,
        dateTime: startDateTime,
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        email: formData.email,
        staff: formData.staffId,
        notes: formData.notes,
      };

      const updatedAppointment: Appointment = await callApi(
        `/api/appointment/${appointment._id}`,
        "PUT",
        payload
      );

      onAppointmentUpdated(updatedAppointment);
      onOpenChange(false);
      toast.success(t("Appointment updated successfully") as string);
    } catch (error) {
      console.error("Failed to update appointment:", error);
      toast.error(
        t("Failed to update appointment. Please try again.") as string
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAppointment = async () => {
    try {
      if (!appointment) return;
      setIsCancelling(true);
      const updatedAppointment: Appointment = await callApi(
        `/api/appointment/${appointment._id}/status`,
        "PUT",
        {
          status: "cancelled",
        }
      );

      onAppointmentUpdated(updatedAppointment);
      setShowCancelConfirm(false);
      onOpenChange(false);
      toast.success(t("Appointment cancelled successfully!"));
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
      toast.error(t("Failed to cancel appointment. Please try again."));
    } finally {
      setIsCancelling(false);
    }
  };

  console.log(availableSlots);
  const handleAppointmentTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      appointmentTypeId: value,
      staffId: "",
      date: "",
      time: "",
    }));
  };

  const handleStaffChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      staffId: value,
      date: "",
      time: "",
    }));
  };

  if (!appointment) return null;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      label={t("Edit Appointment") as string}
      width="3xl"
    >
      <div className="space-y-6 p-2">
        <FormGrid>
          <LabeledInput
            label={t("Client Name")}
            id="clientName"
            value={formData.clientName}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                clientName: e.target.value,
              }))
            }
            placeholder={t("Enter client name")}
          />
          <LabeledInput
            label={t("Email")}
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                email: e.target.value,
              }))
            }
            placeholder={t("client@example.com")}
          />
          <LabeledInput
            label={t("Phone")}
            id="clientPhone"
            type="tel"
            value={formData.clientPhone}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                clientPhone: e.target.value,
              }))
            }
            placeholder={t("+1 (555) 123-4567")}
          />
          <LabeledSelect
            label={t("Appointment Type")}
            id="appointmentType"
            value={formData.appointmentTypeId}
            onValueChange={handleAppointmentTypeChange}
            placeholder={t("Select appointment type")}
            options={appoitmentTypesOptions}
          />
          {formData.appointmentTypeId && (
            <LabeledSelect
              label={t("Staff")}
              id="staff"
              value={formData.staffId}
              onValueChange={handleStaffChange}
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
            value={formData.date}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, date: e.target.value }))
            }
          />
          {formData.staffId && formData.date && (
            <LabeledSelect
              label={t("Time")}
              id="time"
              value={formData.time}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, time: value }))
              }
              placeholder={t("Select time")}
              options={availableSlots.map((slot) => ({
                id: slot.startTime,
                name: `${slot.startTime} - ${slot.endTime}`,
              }))}
            />
          )}
          <Button
            iconType="delete"
            className="text-red-500"
            variant="destructive"
            onClick={() => setShowCancelConfirm(true)}
            disabled={isSubmitting || isCancelling}
          >
            {t("Cancel Appointment")}
          </Button>
        </FormGrid>

        <LabeledInput
          label={t("Notes (Optional)")}
          id="notes"
          value={formData.notes}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, notes: e.target.value }))
          }
          placeholder={t("Add any additional notes or special requirements...")}
          rows={2}
        />

        {formData.appointmentTypeId && (
          <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
            {(() => {
              const selectedType = appointmentTypes?.find(
                (type) => type._id === formData.appointmentTypeId
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
                      <p className="font-semibold">
                        {formatPriceEUR(selectedType.price)}
                      </p>
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

        <div className="flex justify-center items-center gap-2 pt-4">
          <div className="flex gap-2 items-center justify-center">
            <Button
              iconType="cancel"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || isCancelling}
            >
              {t("Close")}
            </Button>
            <Button
              iconType="save"
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                isCancelling ||
                !formData.clientName ||
                !formData.email ||
                !formData.date ||
                !formData.time ||
                !formData.appointmentTypeId ||
                !formData.staffId
              }
            >
              {isSubmitting ? t("Saving...") : t("Save Changes")}
            </Button>
          </div>
        </div>

        {/* Cancel Confirmation Dialog */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
            <div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full mx-4 relative">
              <div className="absolute top-4 right-2">
                <CustomTooltip
                  onClick={() => setShowCancelConfirm(false)}
                  tooltipText={t("Delete")}
                  icon={<X />}
                />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {t("Cancel Appointment?")}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t(
                  "Are you sure you want to cancel this appointment? This action cannot be undone."
                )}
              </p>
              <div className="flex justify-center gap-3">
                <Button
                  variant="outline"
                  iconType="cancel"
                  onClick={() => setShowCancelConfirm(false)}
                  disabled={isCancelling}
                >
                  {t("Keep Appointment")}
                </Button>
                <Button
                  variant="default"
                  iconType="check"
                  onClick={handleCancelAppointment}
                  disabled={isCancelling}
                >
                  {isCancelling ? t("Cancelling...") : t("Yes, Cancel It")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
