"use client";
import { SetStateAction, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { usePageTitle } from "@/context/PageTitleContext";
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

type CreateNewDashboardMenuProps = {
  onOpenModal: () => void;
};

const CreateNewDashboardMenu = ({
  onOpenModal,
}: CreateNewDashboardMenuProps) => {
  return (
    <CustomTooltip onClick={onOpenModal} tooltipText="Add" icon={<Plus />} />
  );
};

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuthContext();

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

  useEffect(() => {
    getDashboardData();
    fetchServices();
  }, []);

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

  const fetchServices = async () => {
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
  };

  const getDashboardData = async () => {
    const data = await callApi("/api/appointment/dashboard", "GET");
    setAppointments(data);
  };

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
  };

  const handleDeleteAppointment = () => {
    // ... (логиката за handleDeleteAppointment остава същата)
    if (selectedAppointment) {
      setAppointments((prev) =>
        prev.filter((apt) => apt._id !== selectedAppointment._id)
      );
      setIsViewModalOpen(false);
      setSelectedAppointment(null);
    }
  };

  // ФУНКЦИЯ ЗА СЪЗДАВАНЕ НА НОВА СРЕЩА
  const handleCreateAppointment = async (
    appointmentData: AppointmentFormData
  ) => {
    const service = appointmentTypes?.find(
      (s) => s._id === appointmentData.appointmentTypeId
    );
    if (!service) {
      toast.error("Invalid service selected.");
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
      toast.success("Appointment created successfully!");
    } catch (error) {
      console.error("Failed to create appointment:", error);
      toast.error("Failed to create appointment. Please try again.");
    }
  };

  return (
    <div>
      <Tabs defaultValue="calendar" className="w-full">
        {/* ... (TabsList и TabsContent остават същите) */}
        <TabsList className="mb-4 bg-transparent p-0 mx-auto w-fit">
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

        <TabsContent value="calendar">
          <Calendar
            appointments={appointments}
            getStatusColor={getStatusColor}
            openDetailsModal={() => setIsViewModalOpen(true)}
            onSelectAppointment={(appointment) =>
              setSelectedAppointment(appointment)
            }
          />
        </TabsContent>

        <TabsContent value="table" className="space-y-4">
          <AppointmentsTable
            data={appointments}
            onOpenViewModal={openViewModal}
          />
        </TabsContent>

        <TabsContent value="board">
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
        <AppointmentForm // Използваме универсалния компонент
          mode="create" // Задаваме режим CREATE
          handleSubmit={handleCreateAppointment} // Използваме функцията за CREATE
          appointmentData={newAppointment}
          setAppointmentData={setNewAppointment}
          onClose={() => setIsCreateModalOpen(false)} // Обща функция за затваряне
          appoitmentTypesOptions={appoitmentTypesOptions}
          appointmentTypes={appointmentTypes}
        />
      </Modal>
    </div>
  );
}
