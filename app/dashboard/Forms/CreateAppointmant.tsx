"use client";

import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  AppointmentType,
  SelectOptionsAppointmentType,
} from "@/Global/Types/types";
import React, { useState, useEffect, useRef } from "react";
import { LabeledSelect } from "@/components/customUIComponents/LabeledSelect";
import { FormGrid } from "@/Global/Styles/FormGrid";
import callApi from "@/app/Api/callApi";
import { Modal } from "@/components/customUIComponents/Modal";
import { Clock } from "lucide-react";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { formatPriceEUR } from "@/Global/Utils/commonFn";

// Общ тип за данните, който включва и _id за Edit
export interface AppointmentFormData {
  _id?: string; // Добавено за режим на редактиране
  clientName: string;
  email: string;
  clientPhone: string;
  date: string;
  time: string;
  appointmentTypeId: string;
  notes: string;
  staff: {
    _id: string;
    name: string;
  };
}

interface AppointmentFormProps {
  appointmentData: AppointmentFormData;
  setAppointmentData: React.Dispatch<React.SetStateAction<AppointmentFormData>>;
  appointmentTypes: AppointmentType[] | null;
  appoitmentTypesOptions: SelectOptionsAppointmentType[];
  handleSubmit: (data: AppointmentFormData) => void;
  mode: "create" | "edit";
  onClose: () => void;
  businessId?: string;
  locationId?: string;
}

const AppointmentForm = ({
  appointmentData,
  setAppointmentData,
  handleSubmit,
  appoitmentTypesOptions,
  onClose,
  appointmentTypes,
  mode,
  businessId,
  locationId,
}: AppointmentFormProps) => {
  const { t } = useTranslation();
  const [availableStaff, setAvailableStaff] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [closestSlot, setClosestSlot] = useState<any>(null);
  const [isClosestSlotModalOpen, setIsClosestSlotModalOpen] = useState(false);
  const fetchedStaffForTypeRef = useRef<string | null>(null);
  console.log("appointment types in form", appointmentTypes);
  useEffect(() => {
    const fetchStaff = async () => {
      if (appointmentData.appointmentTypeId) {
        if (
          fetchedStaffForTypeRef.current === appointmentData.appointmentTypeId
        ) {
          return;
        }
        fetchedStaffForTypeRef.current = appointmentData.appointmentTypeId;

        const selectedService = appointmentTypes?.find(
          (type) => type._id === appointmentData.appointmentTypeId,
        );
        if (selectedService && selectedService.staffMembers) {
          const staffIdsArray = selectedService.staffMembers.map((s: any) =>
            typeof s === "string" ? s : s._id || s,
          );
          const staffDetails = await callApi(`/api/staff/by-ids`, "POST", {
            staffIds: staffIdsArray,
          });
          setAvailableStaff(staffDetails);
        }
      } else {
        setAvailableStaff([]);
        fetchedStaffForTypeRef.current = null;
      }
    };
    fetchStaff();
  }, [appointmentData.appointmentTypeId]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (
        appointmentData.staff._id &&
        appointmentData.date &&
        appointmentData.appointmentTypeId
      ) {
        const slots = await callApi(
          `/api/appointment/availability?staffId=${appointmentData.staff._id}&date=${appointmentData.date}&serviceId=${appointmentData.appointmentTypeId}&locationId=${locationId}`,
          "GET",
        );
        setAvailableSlots(slots.slots);
      } else {
        setAvailableSlots([]); // Изчистване, ако данните не са попълнени
      }
    };
    fetchSlots();
  }, [
    appointmentData.staff._id,
    appointmentData.date,
    appointmentData.appointmentTypeId,
  ]);

  // 3. Извличане на Най-близък Час (Само за CREATE режим)
  useEffect(() => {
    const fetchClosestSlot = async () => {
      // ИЗПЪЛНЯВАЙ САМО В РЕЖИМ CREATE
      if (
        mode === "create" &&
        appointmentData.appointmentTypeId &&
        appointmentData.staff._id
      ) {
        // Ако има избрана дата или час, не показвай модал
        if (appointmentData.time || appointmentData.date) return;

        // Ако има избрана дата, зареди най-близкия час за тази дата
        let endpoint = `/api/appointment/closest-slot?staffId=${appointmentData.staff._id}&serviceId=${appointmentData.appointmentTypeId}&locationId=${locationId}`;
        if (appointmentData.date) {
          endpoint += `&date=${appointmentData.date}`;
        }

        const response = await callApi(endpoint, "GET");

        if (response.slot) {
          setClosestSlot(response.slot);
          setIsClosestSlotModalOpen(true);
        } else {
          setClosestSlot(null);
        }
      }
    };
    fetchClosestSlot();
  }, [
    appointmentData.appointmentTypeId,
    appointmentData.staff._id,
    appointmentData.date,
    mode,
    appointmentData.time,
  ]);

  const handleUseClosestSlot = () => {
    if (closestSlot) {
      // Backend returns date in DD.MM.YYYY format, convert to YYYY-MM-DD
      const dateParts = closestSlot.date.split(".");
      const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

      // Only fill date and time, don't submit yet
      setAppointmentData((prev) => ({
        ...prev,
        date: formattedDate,
        time: closestSlot.startTime,
      }));
      setIsClosestSlotModalOpen(false);
    }
  };

  const handleManualSelection = () => {
    setIsClosestSlotModalOpen(false);
  };

  const handleFormSubmit = () => {
    handleSubmit(appointmentData); // Използваме общия handleSubmit
  };

  const selectedType = appointmentTypes?.find(
    (type) => type._id === appointmentData.appointmentTypeId,
  );

  const canSubmitBase =
    !!appointmentData.clientName &&
    !!appointmentData.email &&
    !!appointmentData.date &&
    !!appointmentData.time &&
    !!appointmentData.appointmentTypeId &&
    !!appointmentData.staff._id;

  const handlePayOnline = async () => {
    if (!canSubmitBase || !selectedType || !businessId) return;

    const startISO = new Date(
      `${appointmentData.date}T${appointmentData.time}`,
    );
    const endISO = new Date(startISO);
    endISO.setMinutes(endISO.getMinutes() + (selectedType.duration || 0));

    const appointmentPayload = {
      business: businessId,
      clientName: appointmentData.clientName,
      clientPhone: appointmentData.clientPhone,
      email: appointmentData.email,
      staff: appointmentData.staff._id,
      appointmentTime: {
        start: startISO.toISOString(),
        end: endISO.toISOString(),
      },
      notes: appointmentData.notes,
      location: locationId,
    };

    try {
      const res = await callApi("/api/stripe/checkout/session", "POST", {
        serviceId: appointmentData.appointmentTypeId,
        appointmentData: appointmentPayload,
      });
      if (res?.url && typeof window !== "undefined") {
        window.location.href = res.url;
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Хендлър за промяна на типа среща (за да нулира персонала, датата и часа)
  const handleAppointmentTypeChange = (value: string) => {
    setAppointmentData((prev) => ({
      ...prev,
      appointmentTypeId: value,
      staff: { _id: "", name: "" },
      date: "",
      time: "",
    }));
  };

  // Хендлър за промяна на персонала (за да нулира датата и часа)
  const handleStaffChange = (value: string) => {
    setAppointmentData((prev) => ({
      ...prev,
      staff: {
        name: "",
        _id: value,
      },
      date: "",
      time: "",
    }));
  };

  return (
    <div className="space-y-6 w-full px-2 md:px-0">
      <FormGrid>
        <LabeledInput
          label={t("Client Name")}
          id="clientName"
          value={appointmentData.clientName}
          onChange={(e) =>
            setAppointmentData((prev) => ({
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
          value={appointmentData.email}
          onChange={(e) =>
            setAppointmentData((prev) => ({
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
          value={appointmentData.clientPhone}
          onChange={(e) =>
            setAppointmentData((prev) => ({
              ...prev,
              clientPhone: e.target.value,
            }))
          }
          placeholder={t("+1 (555) 123-4567")}
        />
        <LabeledSelect
          label={t("Appointment Type")}
          id="appointmentType"
          value={appointmentData.appointmentTypeId}
          onValueChange={handleAppointmentTypeChange} // Използваме новия хендлър
          placeholder={t("Select appointment type")}
          options={appoitmentTypesOptions}
        />
        {appointmentData.appointmentTypeId && (
          <LabeledSelect
            label={t("Staff")}
            id="staff"
            value={appointmentData.staff._id}
            onValueChange={handleStaffChange} // Използваме новия хендлър
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
          value={appointmentData.date}
          onChange={(e) =>
            setAppointmentData((prev) => ({ ...prev, date: e.target.value }))
          }
        />
        {appointmentData.staff._id && appointmentData.date && (
          <LabeledSelect
            label={t("Time")}
            id="time"
            value={appointmentData.time}
            onValueChange={(value) =>
              setAppointmentData((prev) => ({ ...prev, time: value }))
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
        value={appointmentData.notes}
        onChange={(e) =>
          setAppointmentData((prev) => ({ ...prev, notes: e.target.value }))
        }
        placeholder={t("Add any additional notes or special requirements...")}
      />
      {appointmentData.appointmentTypeId && (
        <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
          {(() => {
            const selectedType = appointmentTypes?.find(
              (type) => type._id === appointmentData.appointmentTypeId,
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
      <div className="flex justify-center gap-3">
        <Button
          iconType="cancel"
          variant="outline"
          onClick={onClose} // Използваме общия onClose
        >
          {t("Cancel")}
        </Button>
        {selectedType?.paymentOption === "card" ? (
          <Button
            iconType="save"
            onClick={handlePayOnline}
            disabled={!canSubmitBase}
          >
            {t("Pay Online")}
          </Button>
        ) : selectedType?.paymentOption === "cash_and_card" ? (
          <div className="flex gap-3">
            <Button
              variant="outline"
              iconType="save"
              onClick={handleFormSubmit}
              disabled={!canSubmitBase}
            >
              {t("Book with Cash")}
            </Button>
            <Button
              iconType="save"
              onClick={handlePayOnline}
              disabled={!canSubmitBase}
            >
              {t("Pay Online")}
            </Button>
          </div>
        ) : (
          <Button
            iconType="save"
            onClick={handleFormSubmit}
            disabled={!canSubmitBase}
          >
            {t(mode === "create" ? "Create" : "Save Changes")}{" "}
          </Button>
        )}
      </div>

      {isClosestSlotModalOpen &&
        closestSlot &&
        mode === "create" && ( // Показвай само в CREATE режим
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
                onClick={handleUseClosestSlot}
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 rounded-xl"
              >
                {t("Use this time")}
              </Button>
            </div>
          </Modal>
        )}
    </div>
  );
};

export default AppointmentForm;
