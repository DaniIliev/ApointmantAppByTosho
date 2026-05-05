"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Euro } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import callApi from "@/app/Api/callApi";
import {
  AppointmentType,
  SelectOptionsAppointmentType,
} from "@/Global/Types/types";
import { formatPriceEUR, getInitials } from "@/Global/Utils/commonFn";
import { Modal } from "@/components/customUIComponents/Modal";
import AppointmentForm, {
  AppointmentFormData,
} from "@/app/dashboard/Forms/CreateAppointmant";
import { useAuthContext } from "@/context/AuthContext";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React from "react";

const groupServicesByCategory = (services: AppointmentType[]) => {
  if (!services || !Array.isArray(services)) return {};
  return services.reduce(
    (acc, service) => {
      if (!service) return acc;
      const category = service.category || "Other";
      if (!acc[category]) acc[category] = [];
      acc[category].push(service);
      return acc;
    },
    {} as Record<string, AppointmentType[]>,
  );
};

export function ServicesSection({
  businessId,
  locationId,
}: {
  businessId: string;
  locationId?: string;
}) {
  const { t } = useTranslation();
  const [services, setServices] = useState<Record<string, AppointmentType[]>>();
  const [categories, setCategories] = useState<string[]>([]);
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(
    null,
  );
  const { user } = useAuthContext();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState<AppointmentFormData>({
    clientName: "",
    email: "",
    clientPhone: "",
    date: "",
    time: "",
    appointmentTypeId: "",
    notes: "",
    staff: { _id: "", name: "" },
  });

  const fetchBusinessServices = async () => {
    let url = `/api/service?businessId=${businessId}`;
    if (locationId) {
      url += `&locationId=${locationId}`;
    }
    const result = await callApi(url, "GET");
    const categorizedServices = groupServicesByCategory(result);
    const categories = Object.keys(categorizedServices);
    setCategories(categories);
    setServices(categorizedServices);
  };

  useEffect(() => {
    fetchBusinessServices();
  }, [businessId, locationId]);

  const appointmentTypes: AppointmentType[] = services
    ? Object.values(services).flat()
    : [];
  const appoitmentTypesOptions: SelectOptionsAppointmentType[] =
    appointmentTypes.map((s) => ({ id: s._id, name: s.name }));

  const handleBookService = (service: AppointmentType) => {
    setNewAppointment({
      clientName:
        user?.firstName || user?.lastName
          ? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()
          : "",
      email: user?.email || "",
      clientPhone: user?.phone || "",
      date: "",
      time: "",
      appointmentTypeId: service._id,
      notes: "",
      staff: { _id: "", name: "" },
    });
    setIsCreateOpen(true);
  };

  const handleCreateAppointment = async (data: AppointmentFormData) => {
    try {
      const startDateTime = new Date(`${data.date}T${data.time}`).toISOString();
      const payload = {
        business: businessId,
        service: data.appointmentTypeId,
        dateTime: startDateTime,
        clientName: data.clientName,
        clientPhone: data.clientPhone,
        email: data.email,
        staff: data.staff._id,
        notes: data.notes,
        locationId: locationId,
      };
      await callApi(`/api/appointment`, "POST", payload);
      toast.success(t("Appointment created successfully"));
      setIsCreateOpen(false);
    } catch (e) {
      console.error(e);
      toast.error(t("Failed to create appointment. Please try again."));
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row justify-between items-center border-b p-4">
        <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2 text-primary">
          <Euro className="h-6 w-6 text-primary" />
          {t("Services and Price List")}
        </CardTitle>
      </CardHeader>
    <CardContent className="p-0">
      <div className="p-6">
        {/* Глобалният Grid контейнер, който държи всички услуги заедно */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {categories.map((category) => (
            <React.Fragment key={category}>
              {services &&
                services[category].map((service) => (
                  <div
                    key={service._id}
                    className="relative overflow-hidden rounded-[28px] min-h-[320px] bg-slate-200 shadow-lg group cursor-pointer"
                    onClick={() =>
                      setExpandedServiceId((prev) =>
                        prev === service._id ? null : service._id,
                      )
                    }
                  >
                    {/* Изображение и Overlay */}
                    <div className="absolute inset-0">
                      <img
                        src={service.imageUrl || "/default-service.png"}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/30 to-slate-900/10" />
                    </div>

                    {/* Категория (Badge) */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="rounded-full bg-black/45 px-2.5 py-1 text-xs font-semibold text-white border border-white/20 backdrop-blur-sm">
                        {category}
                      </span>
                    </div>

                    {/* Съдържание на картата */}
                    <div className="relative z-10 flex h-full flex-col justify-end p-3.5 md:p-4">
                      <div className="mb-1.5 flex justify-center">
                        <div className="h-1.5 w-12 rounded-full bg-white/70" />
                      </div>

                      <div className="rounded-[22px] bg-black/30 backdrop-blur-md border border-white/15 p-3 text-white">
                        <div className="flex items-center gap-0.5 mb-2">
                          <h4 className="flex-1 text-l font-bold leading-tight truncate pr-1">
                            {service.name}
                          </h4>
                          <span className="shrink-0 rounded-full bg-black/45 px-2 py-0.5 text-sm font-semibold border border-white/20">
                            {formatPriceEUR(service.price)}
                          </span>
                          <span className="shrink-0 inline-flex items-center gap-0.5 rounded-full bg-white/15 px-2 py-0.5 text-sm font-semibold border border-white/20">
                            <Clock className="h-3.5 w-3.5" />
                            {service.duration}
                          </span>
                        </div>

                        {/* Разширяема секция с детайли */}
                        <div
                          className={`overflow-hidden transition-all duration-300 ${
                            expandedServiceId === service._id
                              ? "max-h-52 opacity-100 mb-3"
                              : "max-h-0 opacity-0 mb-0"
                          }`}
                        >
                          <p className="text-sm text-white/85 line-clamp-2 mb-2.5">
                            {service.description ||
                              t("Premium service with professional care.")}
                          </p>

                          <div className="flex items-center justify-between gap-2">
                            <div className="flex -space-x-2">
                              {(service.staffMembers || [])
                                .slice(0, 5)
                                .map((staff) => (
                                  <Avatar
                                    key={staff._id}
                                    className="h-7 w-7 ring-1 ring-black/20"
                                  >
                                    <AvatarImage
                                      src={staff.profilePictureUrl || ""}
                                      alt={`${staff.firstName} ${staff.lastName}`}
                                      className="object-cover"
                                    />
                                    <AvatarFallback className="bg-slate-700 text-white text-[10px] font-semibold">
                                      {getInitials(
                                        `${staff.firstName || ""} ${staff.lastName || ""}`,
                                      )}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}

                              {(service.staffMembers?.length || 0) > 5 && (
                                <span className="h-7 min-w-7 px-1.5 inline-flex items-center justify-center rounded-full bg-white/20 text-[10px] font-semibold border border-white/30 text-white">
                                  +{(service.staffMembers?.length || 0) - 5}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Бутони за действие */}
                        <div className="flex items-center gap-1.5">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="h-7 rounded-full bg-white/20 text-white hover:bg-white/30 border border-white/20 px-3 text-xs"
                            onClick={(e) => {
                              e.stopPropagation(); // Спира onClick на цялата карта
                              setExpandedServiceId((prev) =>
                                prev === service._id ? null : service._id,
                              );
                            }}
                          >
                            {expandedServiceId === service._id
                              ? t("Hide details")
                              : t("More details")}
                          </Button>

                          <Button
                            size="default"
                            className="flex-1 rounded-full bg-white/70 text-slate-900 hover:bg-white/90 font-bold h-7 text-sm"
                            onClick={(e) => {
                              e.stopPropagation(); // Спира onClick на цялата карта
                              handleBookService(service); // Пълна функционалност за резервация
                            }}
                          >
                            {t("Reserve")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </CardContent>
      <Modal
        label={t("Create Appointment")}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        width="3xl"
      >
        <AppointmentForm
          mode="create"
          handleSubmit={handleCreateAppointment}
          appointmentData={newAppointment}
          setAppointmentData={setNewAppointment}
          onClose={() => setIsCreateOpen(false)}
          appoitmentTypesOptions={appoitmentTypesOptions}
          appointmentTypes={appointmentTypes}
          businessId={businessId}
          locationId={locationId}
        />
      </Modal>
    </Card>
  );
}
