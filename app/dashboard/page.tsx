// DashboardPage.js

"use client";
import { useEffect, useState } from "react";
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
import EditForm from "./Forms/EditForm";
import CreateAppointmant from "./Forms/CreateAppointmant";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import AppointmentsBoardView from "./Components/AppointmentsBoardView";
import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";
import { Modal } from "@/components/customUIComponents/Modal";
import AppointmentsTable from "@/components/AppointmantTable/AppointmantTable";
import callApi from "../Api/callApi";
import { useAuthContext } from "@/context/AuthContext";
import moment from "moment"; // Добави import-а за moment
import { toast } from "sonner";

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
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);
  const [newAppointment, setNewAppointment] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    date: "",
    time: "",
    appointmentTypeId: "",
    notes: "",
    staffId: "",
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
      const services: AppointmentType[] = await callApi("/api/service", "GET");
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

  const handleEditAppointment = () => {
    if (selectedAppointment) {
      setEditingAppointment({ ...selectedAppointment });
      setIsEditMode(true);
    }
  };

  const handleSaveEdit = () => {
    if (editingAppointment) {
      setAppointments((prev) =>
        prev.map((apt) =>
          apt._id === editingAppointment._id ? editingAppointment : apt
        )
      );
      setIsEditMode(false);
      setEditingAppointment(null);
      setIsViewModalOpen(false);
      setSelectedAppointment(null);
    }
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

  // ПРОМЕНЕНА ФУНКЦИЯ - приема данните като параметър
  const handleCreateAppointment = async (appointmentData: any) => {
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
      email: appointmentData.clientEmail,
      staff: appointmentData.staffId,
    };
    try {
      const appointment: Appointment = await callApi(
        "/api/appointment",
        "POST",
        payload
      );
      setIsCreateModalOpen(false);
      setAppointments((prev) => [...prev, appointment]);
      setIsCreateModalOpen(false);
      // Нулираме състоянието
      setNewAppointment({
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        date: "",
        time: "",
        appointmentTypeId: "",
        notes: "",
        staffId: "",
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
          <TabsTrigger
            value="board"
            className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none transition-colors px-6 py-3 border-b-2 data-[state=active]:border-primary border-transparent"
          >
            {t("Board View")}
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
      <Modal
        label={t(isEditMode ? "Edit Appointment" : "Appointment Details")}
        open={isViewModalOpen} // Коригирано
        onOpenChange={setIsViewModalOpen} // Коригирано
      >
        {selectedAppointment && (
          <div className="space-y-6">
            {!isEditMode ? (
              <>
                <ViewDetails
                  handleEditAppointment={handleEditAppointment}
                  handleDeleteAppointment={handleDeleteAppointment}
                  selectedAppointment={selectedAppointment}
                />
              </>
            ) : (
              <>
                {editingAppointment && (
                  <EditForm
                    handleSaveEdit={handleSaveEdit}
                    editingAppointment={editingAppointment}
                    setEditingAppointment={setEditingAppointment}
                    setIsEditMode={setIsEditMode}
                  />
                )}
              </>
            )}
          </div>
        )}
      </Modal>

      <Modal
        label={t("Create New Appointment")}
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      >
        <CreateAppointmant
          handleCreateAppointment={handleCreateAppointment}
          newAppointment={newAppointment}
          setNewAppointment={setNewAppointment}
          setIsCreateModalOpen={setIsCreateModalOpen}
          appoitmentTypesOptions={appoitmentTypesOptions}
          appointmentTypes={appointmentTypes}
        />
      </Modal>
    </div>
  );
}
