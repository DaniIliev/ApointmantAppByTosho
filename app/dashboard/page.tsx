"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePageTitle } from "@/context/PageTitleContext";
import { useRightNav } from "@/context/RightNavContext";
import {
  Appointment,
  AppointmentStatus,
  AppointmentType,
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

const mockAppointmentTypes: AppointmentType[] = [
  {
    id: "1",
    name: "Business Consultation",
    description: "Strategic business planning and consultation",
    duration: 60,
    price: 150,
    color: "from-blue-500 to-purple-500",
  },
  {
    id: "2",
    name: "Strategy Session",
    description: "Deep dive into business strategy and planning",
    duration: 90,
    price: 200,
    color: "from-green-500 to-teal-500",
  },
  {
    id: "3",
    name: "Follow-up Meeting",
    description: "Progress review and next steps discussion",
    duration: 30,
    price: 75,
    color: "from-orange-500 to-red-500",
  },
  {
    id: "4",
    name: "Project Review",
    description: "Comprehensive project evaluation and feedback",
    duration: 45,
    price: 100,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "5",
    name: "Initial Consultation",
    description: "First meeting to understand client needs",
    duration: 60,
    price: 120,
    color: "from-cyan-500 to-blue-500",
  },
];

const mockAppointments: Appointment[] = [
  {
    id: "1",
    clientName: "Sarah Johnson",
    clientEmail: "sarah@example.com",
    clientPhone: "+1 (555) 123-4567",
    date: "2024-01-15",
    time: "10:00 AM",
    service: "Business Consultation",
    status: "upcoming",
    notes: "First-time client, interested in digital marketing",
  },
  {
    id: "2",
    clientName: "Michael Chen",
    clientEmail: "michael@example.com",
    clientPhone: "+1 (555) 987-6543",
    date: "2024-01-15",
    time: "2:30 PM",
    service: "Strategy Session",
    status: "upcoming",
  },
  {
    id: "21",
    clientName: "Michael Chen",
    clientEmail: "michael@example.com",
    clientPhone: "+1 (555) 987-6543",
    date: "2024-01-15",
    time: "2:30 PM",
    service: "Strategy Session",
    status: "upcoming",
  },
  {
    id: "22",
    clientName: "Michael Chen",
    clientEmail: "michael@example.com",
    clientPhone: "+1 (555) 987-6543",
    date: "2024-01-15",
    time: "2:30 PM",
    service: "Strategy Session",
    status: "upcoming",
  },
  {
    id: "23",
    clientName: "Michael Chen",
    clientEmail: "michael@example.com",
    clientPhone: "+1 (555) 987-6543",
    date: "2024-01-15",
    time: "2:30 PM",
    service: "Strategy Session",
    status: "upcoming",
  },
  {
    id: "234",
    clientName: "Michael Chen",
    clientEmail: "michael@example.com",
    clientPhone: "+1 (555) 987-6543",
    date: "2024-01-15",
    time: "2:30 PM",
    service: "Strategy Session",
    status: "upcoming",
  },
  {
    id: "235",
    clientName: "Michael Chen",
    clientEmail: "michael@example.com",
    clientPhone: "+1 (555) 987-6543",
    date: "2024-01-15",
    time: "2:30 PM",
    service: "Strategy Session",
    status: "upcoming",
  },
  {
    id: "236",
    clientName: "Michael Chen",
    clientEmail: "michael@example.com",
    clientPhone: "+1 (555) 987-6543",
    date: "2024-01-15",
    time: "2:30 PM",
    service: "Strategy Session",
    status: "upcoming",
  },
  {
    id: "23",
    clientName: "Michael Chen",
    clientEmail: "michael@example.com",
    clientPhone: "+1 (555) 987-6543",
    date: "2024-01-15",
    time: "2:30 PM",
    service: "Strategy Session",
    status: "upcoming",
  },
  {
    id: "3",
    clientName: "Emily Davis",
    clientEmail: "emily@example.com",
    clientPhone: "+1 (555) 456-7890",
    date: "2024-01-14",
    time: "11:00 AM",
    service: "Follow-up Meeting",
    status: "completed",
  },
  {
    id: "4",
    clientName: "Robert Wilson",
    clientEmail: "robert@example.com",
    clientPhone: "+1 (555) 321-0987",
    date: "2024-01-13",
    time: "3:00 PM",
    service: "Project Review",
    status: "cancelled",
  },
  {
    id: "5",
    clientName: "Lisa Anderson",
    clientEmail: "lisa@example.com",
    clientPhone: "+1 (555) 111-2222",
    date: "2024-01-16",
    time: "9:00 AM",
    service: "Initial Consultation",
    status: "upcoming",
  },
  {
    id: "6",
    clientName: "David Brown",
    clientEmail: "david@example.com",
    clientPhone: "+1 (555) 333-4444",
    date: "2024-01-17",
    time: "1:00 PM",
    service: "Project Planning",
    status: "upcoming",
  },
  {
    id: "7",
    clientName: "Jennifer White",
    clientEmail: "jennifer@example.com",
    clientPhone: "+1 (555) 555-5555",
    date: "2024-01-15",
    time: "4:00 PM",
    service: "Follow-up Meeting",
    status: "upcoming",
  },
  {
    id: "8",
    clientName: "Mark Taylor",
    clientEmail: "mark@example.com",
    clientPhone: "+1 (555) 666-7777",
    date: "2024-01-15",
    time: "5:30 PM",
    service: "Business Consultation",
    status: "upcoming",
  },
  {
    id: "9",
    clientName: "Amanda Green",
    clientEmail: "amanda@example.com",
    clientPhone: "+1 (555) 888-9999",
    date: "2024-01-16",
    time: "10:30 AM",
    service: "Strategy Session",
    status: "upcoming",
  },
  {
    id: "10",
    clientName: "Chris Miller",
    clientEmail: "chris@example.com",
    clientPhone: "+1 (555) 000-1111",
    date: "2024-01-16",
    time: "2:00 PM",
    service: "Project Review",
    status: "upcoming",
  },
];
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
  const [appointments, setAppointments] =
    useState<Appointment[]>(mockAppointments);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">(
    "all"
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { setPageTitle } = usePageTitle();
  const { setExtraRightNavMenu, setIsRightNavVisible } = useRightNav();

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

  const openAppointmentModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
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
          apt.id === editingAppointment.id ? editingAppointment : apt
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
        prev.filter((apt) => apt.id !== selectedAppointment.id)
      );
      setIsViewModalOpen(false);
      setSelectedAppointment(null);
    }
  };

  const handleCreateAppointment = () => {
    const selectedType = mockAppointmentTypes.find(
      (type) => type.id === newAppointment.appointmentTypeId
    );
    if (!selectedType) return;

    const appointment: Appointment = {
      id: Date.now().toString(),
      clientName: newAppointment.clientName,
      clientEmail: newAppointment.clientEmail,
      clientPhone: newAppointment.clientPhone,
      date: newAppointment.date,
      time: newAppointment.time,
      service: selectedType.name,
      status: "upcoming",
      notes: newAppointment.notes,
    };

    setAppointments((prev) => [...prev, appointment]);
    setIsCreateModalOpen(false);
    setNewAppointment({
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      date: "",
      time: "",
      appointmentTypeId: "",
      notes: "",
    });
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
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
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
          mockAppointmentTypes={mockAppointmentTypes}
        />
      </Modal>
    </div>
  );
}
