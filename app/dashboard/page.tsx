"use client";
import { useEffect, useState, useCallback } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarPlus,
  Plus,
} from "lucide-react";
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
import WorkBlockDetails from "./Forms/WorkBlockDetails";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";
import { Modal } from "@/components/customUIComponents/Modal";
import { Button } from "@/components/ui/button";
import AppointmentsTable from "@/components/AppointmantTable/AppointmantTable";
import callApi from "../Api/callApi";
import { useAuthContext } from "@/context/AuthContext";
import moment from "moment";
import { toast } from "sonner";
import AppointmentForm, {
  AppointmentFormData,
} from "./Forms/CreateAppointmant";
import { AppointmentEditModal } from "./Forms/AppointmentEditModal";
import CreateWorkBlock from "./Forms/CreateWorkBlock";

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
  const [isWorkBlockModalOpen, setIsWorkBlockModalOpen] = useState(false);
  const [isCreateChoiceModalOpen, setIsCreateChoiceModalOpen] = useState(false);
  const { setPageTitle } = usePageTitle();
  const { setExtraRightNavMenu, setIsRightNavVisible } = useRightNav();
  const [activeTab, setActiveTab] = useState("calendar");

  const fetchServices = useCallback(async () => {
    try {
      const services: AppointmentType[] = await callApi(
        `/api/service?businessId=${user?.businessId}`,
        "GET",
      );
      setAppointmentTypes(services);
      const transformedOptions: SelectOptionsAppointmentType[] = services.map(
        (type) => ({
          id: type._id,
          name: type.name,
        }),
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
      <div className="flex items-center gap-2">
        <CreateNewDashboardMenu
          onOpenModal={() => setIsCreateChoiceModalOpen(true)}
        />
      </div>,
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
        prev.filter((apt) => apt._id !== updatedAppointment._id),
      );
    } else {
      // Otherwise, update it in the list
      setAppointments((prev) =>
        prev.map((apt) =>
          apt._id === updatedAppointment._id ? updatedAppointment : apt,
        ),
      );
    }
    setSelectedAppointment(null);
    // Refresh from server to ensure latest state
    void getDashboardData();
  };

  const handleDeleteAppointment = () => {
    if (!selectedAppointment) return;

    void (async () => {
      try {
        await callApi(`/api/appointment/${selectedAppointment._id}`, "DELETE");
        setIsViewModalOpen(false);
        setSelectedAppointment(null);
        await getDashboardData();
        toast.success(t("Appointment deleted successfully!"));
      } catch (error) {
        console.error("Failed to delete appointment:", error);
        toast.error(t("Failed to delete appointment. Please try again."));
      }
    })();
  };

  const handleCreateAppointment = async (
    appointmentData: AppointmentFormData,
  ) => {
    const service = appointmentTypes?.find(
      (s) => s._id === appointmentData.appointmentTypeId,
    );
    if (!service) {
      toast.error(t("Invalid service selected."));
      return;
    }

    const startDateTime = moment(
      `${appointmentData.date}T${appointmentData.time}`,
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
      await callApi("/api/appointment", "POST", payload);
      setIsCreateModalOpen(false);
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
      await getDashboardData();
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
    <div
      className={`relative ${activeTab === "calendar" ? "h-[calc(100dvh-9.5rem)]" : ""} md:h-full md:pb-0 flex flex-col`}
    >
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full h-full flex flex-col pb-0 md:pb-0"
      >
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
            <span className="text-xs text-foreground font-medium">
              {t("Calendar")}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="table"
            className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:text-muted-foreground flex flex-col items-center justify-center gap-1 rounded-lg transition-all py-2 px-3"
          >
            <span className="text-xs font-medium text-foreground">
              {t("Table")}
            </span>
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

        <TabsContent value="table" className="flex-1">
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
                  t("Failed to delete appointment. Please try again."),
                );
              }
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Модал за Преглед */}
      <Modal
        label={
          selectedAppointment?.kind === "work_block"
            ? t("Work Block Details")
            : t("Appointment Details")
        }
        open={isViewModalOpen}
        onOpenChange={(open) => {
          setIsViewModalOpen(open);
          if (!open) {
            setSelectedAppointment(null);
          }
        }}
      >
        {selectedAppointment && selectedAppointment.kind !== "work_block" && (
          <ViewDetails
            handleEditAppointment={handleEditAppointment}
            handleDeleteAppointment={handleDeleteAppointment}
            selectedAppointment={selectedAppointment}
          />
        )}
        {selectedAppointment?.kind === "work_block" && (
          <WorkBlockDetails
            selectedAppointment={selectedAppointment}
            handleDeleteAppointment={handleDeleteAppointment}
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
        label={t("What would you like to create?")}
        open={isCreateChoiceModalOpen}
        onOpenChange={setIsCreateChoiceModalOpen}
        width="md"
      >
        <div className="p-3 pb-4 space-y-3">
          <Button
            type="button"
            variant="outline"
            className="group h-auto w-full rounded-2xl border-primary/30 bg-card/80 px-4 py-4 hover:bg-primary/5"
            onClick={() => {
              setIsCreateChoiceModalOpen(false);
              setIsCreateModalOpen(true);
            }}
          >
            <div className="flex w-full items-center gap-3 text-left">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CalendarPlus className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold text-foreground leading-tight break-words">
                  {t("Create New Appointment")}
                </p>
                <p className="text-sm text-muted-foreground leading-tight">
                  {t("Book a client meeting")}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </div>
          </Button>

          <Button
            type="button"
            variant="outline"
            className="group h-auto w-full rounded-2xl border-primary/30 bg-card/80 px-4 py-4 hover:bg-primary/5"
            onClick={() => {
              setIsCreateChoiceModalOpen(false);
              setIsWorkBlockModalOpen(true);
            }}
          >
            <div className="flex w-full items-center gap-3 text-left">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <BriefcaseBusiness className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold text-foreground leading-tight break-words">
                  {t("Add Work Block")}
                </p>
                <p className="text-sm text-muted-foreground leading-tight">
                  {t("Block time in calendar")}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </div>
          </Button>
        </div>
      </Modal>

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

      <CreateWorkBlock
        open={isWorkBlockModalOpen}
        onOpenChange={setIsWorkBlockModalOpen}
        businessId={user?.businessId}
        locationId={selectedLocation?._id}
        onCreated={async () => {
          await getDashboardData();
        }}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute requiredRoles={["business", "staff", "manager"]}>
      <DashboardPageContent />
    </ProtectedRoute>
  );
}
