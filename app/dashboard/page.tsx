"use client";
import { useEffect, useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { usePageTitle } from "@/context/PageTitleContext";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import { useRightNav } from "@/context/RightNavContext";
import {
  Appointment,
  AppointmentType,
  SelectOptionsAppointmentType,
} from "@/Global/Types/types";
import { getStatusColor } from "@/Global/Utils/statusIndicator";
import Calendar from "@/components/calendar/Calendar";
import ViewDetails from "./Forms/ViewDetails";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import AppointmentsBoardView from "./Components/AppointmentsBoardView";
import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";
import { Modal } from "@/components/customUIComponents/Modal";
import AppointmentsTable from "@/components/AppointmantTable/AppointmantTable";
import callApi from "../Api/callApi";
import { useAuthContext } from "@/context/AuthContext";
import moment from "moment";
import { toast } from "sonner";
import AppointmentForm, {
  AppointmentFormData,
} from "./Forms/CreateAppointmant";
import { AppointmentEditModal } from "./Forms/AppointmentEditModal";

import { Skeleton } from "@/components/ui/skeleton";

type CreateNewDashboardMenuProps = {
  onOpenModal: () => void;
};

const CreateNewDashboardMenu = ({
  onOpenModal,
}: CreateNewDashboardMenuProps) => {
  const { t } = useTranslation();
  return (
    <CustomTooltip
      onClick={onOpenModal}
      tooltipText={t("Add")}
      icon={<Plus color="white" />}
    />
  );
};

import { useLocationContext } from "@/context/LocationContext";

function DashboardPageContent() {
  const { t } = useTranslation();
  const { user } = useAuthContext();
  const { selectedLocation } = useLocationContext();
  const [isLoading, setIsLoading] = useState(true);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentTypes, setAppointmentTypes] = useState<
    AppointmentType[] | null
  >(null);
  const [appoitmentTypesOptions, setAppointmentTypesOptions] = useState<
    SelectOptionsAppointmentType[]
  >([]);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [newAppointment, setNewAppointment] = useState<AppointmentFormData>({
    clientName: "",
    email: "",
    clientPhone: "",
    date: "",
    time: "",
    appointmentTypeId: "",
    notes: "",
    staff: {
      name: "",
      _id: "",
    },
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { setPageTitle } = usePageTitle();
  const { setExtraRightNavMenu, setIsRightNavVisible } = useRightNav();

  const fetchServices = useCallback(async () => {
    try {
      const services: AppointmentType[] = await callApi(
        `/api/service?businessId=${user?.businessId}`,
        "GET"
      );
      setAppointmentTypes(services);
      const transformedOptions: SelectOptionsAppointmentType[] = services.map(
        (type) => ({
          id: type._id,
          name: type.name,
        })
      );
      setAppointmentTypesOptions(transformedOptions);
    } catch (error) {
      console.error("Failed to fetch services:", error);
    }
  }, [user?.businessId]);

  const getDashboardData = useCallback(async () => {
    const data = await callApi("/api/appointment/dashboard", "GET");
    setAppointments(data);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([getDashboardData(), fetchServices()]);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [fetchServices, getDashboardData, selectedLocation?._id]);

  // Global auto-completion now handled by AutoCompletePastAppointments component

  useEffect(() => {
    setPageTitle(t("Dashboard"));
    setExtraRightNavMenu(
      <CreateNewDashboardMenu onOpenModal={() => setIsCreateModalOpen(true)} />
    );
    setIsRightNavVisible(true);
    return () => {
      setPageTitle(null);
      setExtraRightNavMenu(null);
      setIsRightNavVisible(false);
    };
  }, [setPageTitle, setExtraRightNavMenu, setIsRightNavVisible, t]);

  const openViewModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsViewModalOpen(true);
  };

  // ФУНКЦИЯ ЗА ОТВАРЯНЕ НА МОДАЛ ЗА РЕДАКТИРАНЕ
  const handleEditAppointment = () => {
    if (selectedAppointment) {
      setIsViewModalOpen(false);
      setIsEditModalOpen(true);
    }
  };

  // ФУНКЦИЯ ЗА ОБНОВЯВАНЕ НА СРЕЩАТА В СПИСЪКА
  const handleAppointmentUpdated = (updatedAppointment: Appointment) => {
    // If the appointment was cancelled, remove it from the list
    if (updatedAppointment.status === "cancelled") {
      setAppointments((prev) =>
        prev.filter((apt) => apt._id !== updatedAppointment._id)
      );
    } else {
      // Otherwise, update it in the list
      setAppointments((prev) =>
        prev.map((apt) =>
          apt._id === updatedAppointment._id ? updatedAppointment : apt
        )
      );
    }
    setSelectedAppointment(null);
    // Refresh from server to ensure latest state
    void getDashboardData();
  };

  const handleDeleteAppointment = () => {
    if (selectedAppointment) {
      setAppointments((prev) =>
        prev.filter((apt) => apt._id !== selectedAppointment._id)
      );
      setIsViewModalOpen(false);
      setSelectedAppointment(null);
    }
  };

  const handleCreateAppointment = async (
    appointmentData: AppointmentFormData
  ) => {
    const service = appointmentTypes?.find(
      (s) => s._id === appointmentData.appointmentTypeId
    );
    if (!service) {
      toast.error(t("Invalid service selected."));
      return;
    }

    const startDateTime = moment(
      `${appointmentData.date}T${appointmentData.time}`
    ).toISOString();

    const payload = {
      business: user?.businessId,
      service: service._id,
      dateTime: startDateTime,
      clientName: appointmentData.clientName,
      clientPhone: appointmentData.clientPhone,
      email: appointmentData.email,
      staff: appointmentData.staff._id,
      notes: appointmentData.notes,
      locationId: selectedLocation?._id,
    };
    try {
      const appointment: Appointment = await callApi(
        "/api/appointment",
        "POST",
        payload
      );
      setIsCreateModalOpen(false);
      setAppointments((prev) => [...prev, appointment]);
      setNewAppointment({
        clientName: "",
        email: "",
        clientPhone: "",
        date: "",
        time: "",
        appointmentTypeId: "",
        notes: "",
        staff: { _id: "", name: "" },
      });
      toast.success(t("Appointment created successfully!"));
    } catch (error) {
      console.error("Failed to create appointment:", error);
      toast.error(t("Failed to create appointment. Please try again."));
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex gap-4 justify-center">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-48 rounded-xl col-span-2" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100dvh-9.5rem)] md:h-full md:pb-0 overflow-hidden flex flex-col">
      <Tabs defaultValue="calendar" className="w-full h-full flex flex-col pb-0 md:pb-0">
        {/* Desktop Tabs - Top */}
        <TabsList className="hidden md:flex mb-4 bg-transparent p-0 mx-auto w-fit flex-shrink-0">
          <TabsTrigger
            value="calendar"
            className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none transition-colors px-6 py-3 border-b-2 data-[state=active]:border-primary border-transparent"
          >
            {t("Calendar View")}
          </TabsTrigger>
          <TabsTrigger
            value="table"
            className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none transition-colors px-6 py-3 border-b-2 data-[state=active]:border-primary border-transparent"
          >
            {t("Table View")}
          </TabsTrigger>
        </TabsList>

        {/* Mobile Tabs - Bottom Fixed */}
        <TabsList className="md:hidden fixed bottom-0 left-0 right-0 z-5 bg-primary-foreground/95 backdrop-blur-xl border-t border-white/10 p-2 grid grid-cols-2 gap-2 h-16 shadow-lg w-full">
          <TabsTrigger
            value="calendar"
            className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:text-muted-foreground flex flex-col items-center justify-center gap-1 rounded-lg transition-all py-2 px-3"
          >
            <span className="text-xs font-medium">{t("Calendar")}</span>
          </TabsTrigger>
          <TabsTrigger
            value="table"
            className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:text-muted-foreground flex flex-col items-center justify-center gap-1 rounded-lg transition-all py-2 px-3"
          >
            <span className="text-xs font-medium">{t("Table")}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="flex-1 overflow-hidden">
          <Calendar
            appointments={appointments}
            getStatusColor={getStatusColor}
            openDetailsModal={() => setIsViewModalOpen(true)}
            onSelectAppointment={(appointment) =>
              setSelectedAppointment(appointment)
            }
          />
        </TabsContent>

        <TabsContent value="table" className="flex-1 overflow-hidden">
          <AppointmentsTable
            data={appointments}
            onOpenViewModal={openViewModal}
            onOpenEditModal={(apt) => {
              setSelectedAppointment(apt);
              setIsEditModalOpen(true);
            }}
            onDeleteAppointment={async (id: string) => {
              try {
                await callApi(`/api/appointment/${id}`, "DELETE");
                setAppointments((prev) => prev.filter((a) => a._id !== id));
                toast.success(t("Appointment deleted successfully!"));
              } catch (error) {
                console.error("Failed to delete appointment:", error);
                toast.error(
                  t("Failed to delete appointment. Please try again.")
                );
              }
            }}
          />
        </TabsContent>

        <TabsContent value="board" className="flex-1 overflow-hidden">
          <AppointmentsBoardView
            onOpenModal={() => setIsCreateModalOpen(true)}
          />
        </TabsContent>
      </Tabs>

      {/* Модал за Преглед */}
      <Modal
        label={t("Appointment Details")}
        open={isViewModalOpen}
        onOpenChange={(open) => {
          setIsViewModalOpen(open);
          if (!open) {
            setSelectedAppointment(null);
          }
        }}
      >
        {selectedAppointment && (
          <ViewDetails
            handleEditAppointment={handleEditAppointment}
            handleDeleteAppointment={handleDeleteAppointment}
            selectedAppointment={selectedAppointment}
          />
        )}
      </Modal>

      {/* Модал за Редактиране */}
      <AppointmentEditModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        appointment={selectedAppointment}
        appointmentTypes={appointmentTypes}
        appoitmentTypesOptions={appoitmentTypesOptions}
        onAppointmentUpdated={handleAppointmentUpdated}
      />

      {/* Модал за Създаване */}
      <Modal
        label={t("Create New Appointment")}
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      >
        <AppointmentForm  
          mode="create" 
          handleSubmit={handleCreateAppointment} 
          appointmentData={newAppointment}
          setAppointmentData={setNewAppointment}
          onClose={() => setIsCreateModalOpen(false)} 
          appoitmentTypesOptions={appoitmentTypesOptions}
          appointmentTypes={appointmentTypes}
          locationId={selectedLocation?._id}
        />
      </Modal>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute requiredRoles={["business", "staff"]}>
      <DashboardPageContent />
    </ProtectedRoute>
  );
}
