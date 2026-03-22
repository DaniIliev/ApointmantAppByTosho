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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, formatPriceEUR } from "@/Global/Utils/commonFn";
import { Modal } from "@/components/customUIComponents/Modal";
import AppointmentForm, {
  AppointmentFormData,
} from "@/app/dashboard/Forms/CreateAppointmant";
import { useAuthContext } from "@/context/AuthContext";
import { toast } from "sonner";

const groupServicesByCategory = (services: AppointmentType[]) => {
  return services.reduce((acc, service) => {
    const category = service.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(service);
    return acc;
  }, {} as Record<string, AppointmentType[]>);
};

export function ServicesSection({ businessId, locationId }: { businessId: string; locationId?: string }) {
  const { t } = useTranslation();
  const [services, setServices] = useState<Record<string, AppointmentType[]>>();
  const [categories, setCategories] = useState<string[]>([]);
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
        <div className="space-y-8 p-6">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="text-2xl font-semibold mb-4 text-foreground border-b-2 border-primary/50 pb-2">
                {category}
              </h3>

              <div className="space-y-4">
                {services &&
                  services[category].map((service) => (
                    <div
                      key={service._id}
                      className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 p-4 rounded-xl bg-background/60 border border-border/70 hover:border-primary/50 transition-all shadow-sm hover:shadow-md hover:scale-[1.01]"
                    >
                      <div className="flex-1 w-full flex items-start gap-3 md:gap-4">
                        <div className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 shadow-md">
                        <img
                          src={service.imageUrl || "/default-service.png"}
                          alt={service.name}
                            className="w-full h-full object-cover"
                        />
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-lg font-bold text-foreground mb-1">
                            {service.name}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {service.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 md:gap-4 text-sm font-medium mb-3">
                            <div className="flex items-center gap-1 text-primary">
                              <Clock className="h-4 w-4" />
                              <span>{service.duration} мин.</span>
                            </div>
                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                              <Euro className="h-4 w-4" />
                              <span>{formatPriceEUR(service.price)}</span>
                            </div>
                          {service.staffs && service.staffs.length > 0 && (
                              <>
                                {/* Mobile: left-aligned avatar group with initials only */}
                                <div className="flex items-center justify-start gap-2 w-full md:hidden">
                                  <span className="text-sm text-muted-foreground mr-1">
                                    {t("Performed by")}:
                                  </span>
                              <div className="flex -space-x-2">
                                {service.staffs.map((staff) => (
                                  <Avatar
                                    key={staff._id}
                                        className="h-7 w-7 ring-2 ring-background border border-primary/40"
                                  >
                                    <AvatarFallback className="bg-primary text-white text-[10px] font-semibold">
                                      {getInitials(staff.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                                  </div>
                                </div>

                                {/* Desktop/Tablet: chips with avatar + name */}
                                <div className="hidden md:flex flex-wrap items-center gap-2">
                                  <span className="text-sm text-muted-foreground mr-2">
                                    {t("Performed by")}:
                                  </span>
                                  {service.staffs.map((staff) => (
                                    <div
                                      key={staff._id}
                                      className="flex items-center gap-2 bg-gradient-to-tr from-primary/10 to-primary/20 border border-primary/20 rounded-full px-3 py-1.5 shadow-sm hover:shadow-md hover:from-primary/20 hover:to-primary/30 transition-all duration-300 cursor-pointer group"
                                    >
                                      <Avatar className="h-6 w-6 border border-primary/40 shadow-sm">
                                        <AvatarImage
                                          src={(staff as any).imageUrl}
                                          alt={staff.name}
                                          className="object-cover"
                                        />
                                        <AvatarFallback className="bg-primary text-white text-xs font-semibold">
                                          {getInitials(staff.name)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                        {staff.name}
                                </span>
                              </div>
                                  ))}
                            </div>
                              </>
                          )}
                          </div>
                        </div>
                        </div>

                      <div className="flex flex-col justify-center items-stretch md:items-center md:flex-row gap-2 flex-shrink-0 w-full md:w-auto">
                        <Button
                          size="default"
                          className="w-full md:w-auto min-w-[140px] bg-primary hover:bg-primary-dark transition-colors rounded-xl"
                          onClick={() => handleBookService(service)}
                        >
                          {t("Book Appointment")}
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      {/* Create Appointment Modal for clients */}
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
