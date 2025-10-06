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
import AppointmentForm from "./Forms/CreateAppointmant";

// Общ тип за данните на формата
type AppointmentFormData = {
  _id?: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  date: string;
  time: string;
  appointmentTypeId: string;
  notes: string;
  staffId: string;
};

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
  // Използваме общия тип за редактиране
  const [editingAppointment, setEditingAppointment] =
    useState<AppointmentFormData | null>(null);
  // Използваме общия тип за създаване
  const [newAppointment, setNewAppointment] = useState<AppointmentFormData>({
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
    // ... (логиката за fetchServices остава същата)
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
    // ... (логиката за getDashboardData остава същата)
    const data = await callApi("/api/appointment/dashboard", "GET");
    // setAppointments(data);
    setAppointments(mockAppointments);
  };

  const openViewModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsViewModalOpen(true);
  };

  // ФУНКЦИЯ ЗА ПРЕМИНАВАНЕ В РЕЖИМ РЕДАКТИРАНЕ
  const handleEditAppointment = () => {
    if (selectedAppointment) {
      // Форматираме съществуващите данни във формата на AppointmentFormData
      console.log("selected appointment", selectedAppointment);
      // const dateTime = moment(selectedAppointment.dateTime);
      // setEditingAppointment({
      //   _id: selectedAppointment._id,
      //   clientName: selectedAppointment.clientName,
      //   clientEmail: selectedAppointment.clientEmail,
      //   clientPhone: selectedAppointment.clientPhone,
      //   date: dateTime.format("YYYY-MM-DD"),
      //   time: dateTime.format("HH:mm"),
      //   appointmentTypeId: selectedAppointment., // Уверете се, че service има _id
      //   notes: selectedAppointment.notes || "",
      //   staffId: selectedAppointment.staff._id, // Уверете се, че staff има _id
      // });
      setIsEditMode(true);
      // setIsViewModalOpen(true); // Модалът вече е отворен
    }
  };

  // ФУНКЦИЯ ЗА ЗАПАЗВАНЕ НА РЕДАКТИРАНАТА СРЕЩА
  const handleUpdateAppointment = async (
    appointmentData: AppointmentFormData
  ) => {
    if (!appointmentData._id) {
      toast.error("Appointment ID is missing for update.");
      return;
    }

    const startDateTime = moment(
      `${appointmentData.date}T${appointmentData.time}`
    ).toISOString();

    const payload = {
      // ID-то на срещата не се включва в payload-а, а в URL
      business: user?.businessId,
      service: appointmentData.appointmentTypeId,
      dateTime: startDateTime,
      clientName: appointmentData.clientName,
      clientPhone: appointmentData.clientPhone,
      email: appointmentData.clientEmail,
      staff: appointmentData.staffId,
      notes: appointmentData.notes,
    };

    try {
      // Изпращаме заявка за обновяване (PUT/PATCH)
      const updatedAppointment: Appointment = await callApi(
        `/api/appointment/${appointmentData._id}`,
        "PUT",
        payload
      );

      // Обновяваме локалното състояние
      setAppointments((prev) =>
        prev.map((apt) =>
          apt._id === updatedAppointment._id ? updatedAppointment : apt
        )
      );

      // Затваряме модала и нулираме състоянието
      setIsEditMode(false);
      setEditingAppointment(null);
      setIsViewModalOpen(false);
      setSelectedAppointment(null);

      toast.success("Appointment updated successfully!");
    } catch (error) {
      console.error("Failed to update appointment:", error);
      toast.error("Failed to update appointment. Please try again.");
    }
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
      email: appointmentData.clientEmail,
      staff: appointmentData.staffId,
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

      {/* Модал за Преглед/Редактиране */}
      <Modal
        label={t(isEditMode ? "Edit Appointment" : "Appointment Details")}
        open={isViewModalOpen}
        onOpenChange={(open) => {
          setIsViewModalOpen(open);
          // Излизаме от режим Edit, ако модалът се затвори
          if (!open) {
            setIsEditMode(false);
            setSelectedAppointment(null);
          }
        }}
      >
        {selectedAppointment && (
          <div className="space-y-6">
            {!isEditMode ? (
              // Режим Преглед
              <ViewDetails
                handleEditAppointment={handleEditAppointment}
                handleDeleteAppointment={handleDeleteAppointment}
                selectedAppointment={selectedAppointment}
              />
            ) : (
              // Режим Редактиране (използваме AppointmentForm)
              <>
                {editingAppointment && setEditingAppointment && (
                  <AppointmentForm
                    mode="edit" // Задаваме режим EDIT
                    handleSubmit={handleUpdateAppointment} // Използваме функцията за UPDATE
                    appointmentData={editingAppointment}
                    setAppointmentData={
                      setEditingAppointment as React.Dispatch<
                        SetStateAction<AppointmentFormData>
                      >
                    }
                    onClose={() => setIsEditMode(false)} // Затваряме режима за редактиране
                    appoitmentTypesOptions={appoitmentTypesOptions}
                    appointmentTypes={appointmentTypes}
                  />
                )}
              </>
            )}
          </div>
        )}
      </Modal>

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
// // DashboardPage.js

// "use client";
// import { useEffect, useState } from "react";
// import { Plus } from "lucide-react";
// import { usePageTitle } from "@/context/PageTitleContext";
// import { useRightNav } from "@/context/RightNavContext";
// import {
//   Appointment,
//   AppointmentType,
//   SelectOptionsAppointmentType,
// } from "@/Global/Types/types";
// import { getStatusColor } from "@/Global/Utils/statusIndicator";
// import Calendar from "@/components/calendar/Calendar";
// import ViewDetails from "./Forms/ViewDetails";
// import EditForm from "./Forms/EditForm";
// import CreateAppointmant from "./Forms/CreateAppointmant";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { useTranslation } from "react-i18next";
// import AppointmentsBoardView from "./Components/AppointmentsBoardView";
// import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";
// import { Modal } from "@/components/customUIComponents/Modal";
// import AppointmentsTable from "@/components/AppointmantTable/AppointmantTable";
// import callApi from "../Api/callApi";
// import { useAuthContext } from "@/context/AuthContext";
// import moment from "moment"; // Добави import-а за moment
// import { toast } from "sonner";

// type CreateNewDashboardMenuProps = {
//   onOpenModal: () => void;
// };

// const CreateNewDashboardMenu = ({
//   onOpenModal,
// }: CreateNewDashboardMenuProps) => {
//   return (
//     <CustomTooltip onClick={onOpenModal} tooltipText="Add" icon={<Plus />} />
//   );
// };

// export default function DashboardPage() {
//   const { t } = useTranslation();
//   const { user } = useAuthContext();

//   const [appointments, setAppointments] = useState<Appointment[]>([]);
//   const [appointmentTypes, setAppointmentTypes] = useState<
//     AppointmentType[] | null
//   >(null);
//   const [appoitmentTypesOptions, setAppointmentTypesOptions] = useState<
//     SelectOptionsAppointmentType[]
//   >([]);

//   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [selectedAppointment, setSelectedAppointment] =
//     useState<Appointment | null>(null);
//   const [editingAppointment, setEditingAppointment] =
//     useState<Appointment | null>(null);
//   const [newAppointment, setNewAppointment] = useState({
//     clientName: "",
//     clientEmail: "",
//     clientPhone: "",
//     date: "",
//     time: "",
//     appointmentTypeId: "",
//     notes: "",
//     staffId: "",
//   });
//   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
//   const { setPageTitle } = usePageTitle();
//   const { setExtraRightNavMenu, setIsRightNavVisible } = useRightNav();

//   useEffect(() => {
//     getDashboardData();
//     fetchServices();
//   }, []);

//   useEffect(() => {
//     setPageTitle(t("Dashboard"));
//     setExtraRightNavMenu(
//       <CreateNewDashboardMenu onOpenModal={() => setIsCreateModalOpen(true)} />
//     );
//     setIsRightNavVisible(true);
//     return () => {
//       setPageTitle(null);
//       setExtraRightNavMenu(null);
//       setIsRightNavVisible(false);
//     };
//   }, [setPageTitle, setExtraRightNavMenu, setIsRightNavVisible, t]);

//   const fetchServices = async () => {
//     try {
//       const services: AppointmentType[] = await callApi("/api/service", "GET");
//       setAppointmentTypes(services);
//       const transformedOptions: SelectOptionsAppointmentType[] = services.map(
//         (type) => ({
//           id: type._id,
//           name: type.name,
//         })
//       );
//       setAppointmentTypesOptions(transformedOptions);
//     } catch (error) {
//       console.error("Failed to fetch services:", error);
//     }
//   };

//   const getDashboardData = async () => {
//     const data = await callApi("/api/appointment/dashboard", "GET");
//     setAppointments(mockAppointments);
//     // setAppointments(data);
//   };

//   const openViewModal = (appointment: Appointment) => {
//     setSelectedAppointment(appointment);
//     setIsViewModalOpen(true);
//   };

//   const handleEditAppointment = () => {
//     if (selectedAppointment) {
//       setEditingAppointment({ ...selectedAppointment });
//       setIsEditMode(true);
//     }
//   };

//   const handleSaveEdit = () => {
//     if (editingAppointment) {
//       setAppointments((prev) =>
//         prev.map((apt) =>
//           apt._id === editingAppointment._id ? editingAppointment : apt
//         )
//       );
//       setIsEditMode(false);
//       setEditingAppointment(null);
//       setIsViewModalOpen(false);
//       setSelectedAppointment(null);
//     }
//   };

//   const handleDeleteAppointment = () => {
//     if (selectedAppointment) {
//       setAppointments((prev) =>
//         prev.filter((apt) => apt._id !== selectedAppointment._id)
//       );
//       setIsViewModalOpen(false);
//       setSelectedAppointment(null);
//     }
//   };

//   // ПРОМЕНЕНА ФУНКЦИЯ - приема данните като параметър
//   const handleCreateAppointment = async (appointmentData: any) => {
//     const service = appointmentTypes?.find(
//       (s) => s._id === appointmentData.appointmentTypeId
//     );
//     if (!service) {
//       toast.error("Invalid service selected.");
//       return;
//     }

//     const startDateTime = moment(
//       `${appointmentData.date}T${appointmentData.time}`
//     ).toISOString();

//     const payload = {
//       business: user?.businessId,
//       service: service._id,
//       dateTime: startDateTime,
//       clientName: appointmentData.clientName,
//       clientPhone: appointmentData.clientPhone,
//       email: appointmentData.clientEmail,
//       staff: appointmentData.staffId,
//     };
//     try {
//       const appointment: Appointment = await callApi(
//         "/api/appointment",
//         "POST",
//         payload
//       );
//       setIsCreateModalOpen(false);
//       setAppointments((prev) => [...prev, appointment]);
//       setIsCreateModalOpen(false);
//       // Нулираме състоянието
//       setNewAppointment({
//         clientName: "",
//         clientEmail: "",
//         clientPhone: "",
//         date: "",
//         time: "",
//         appointmentTypeId: "",
//         notes: "",
//         staffId: "",
//       });
//       toast.success("Appointment created successfully!");
//     } catch (error) {
//       console.error("Failed to create appointment:", error);
//       toast.error("Failed to create appointment. Please try again.");
//     }
//   };

//   return (
//     <div>
//       <Tabs defaultValue="calendar" className="w-full">
//         <TabsList className="mb-4 bg-transparent p-0 mx-auto w-fit">
//           <TabsTrigger
//             value="calendar"
//             className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none transition-colors px-6 py-3 border-b-2 data-[state=active]:border-primary border-transparent"
//           >
//             {t("Calendar View")}
//           </TabsTrigger>
//           <TabsTrigger
//             value="table"
//             className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none transition-colors px-6 py-3 border-b-2 data-[state=active]:border-primary border-transparent"
//           >
//             {t("Table View")}
//           </TabsTrigger>
//           <TabsTrigger
//             value="board"
//             className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none transition-colors px-6 py-3 border-b-2 data-[state=active]:border-primary border-transparent"
//           >
//             {t("Board View")}
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value="calendar">
//           <Calendar
//             appointments={appointments}
//             getStatusColor={getStatusColor}
//             openDetailsModal={() => setIsViewModalOpen(true)}
//             onSelectAppointment={(appointment) =>
//               setSelectedAppointment(appointment)
//             }
//           />
//         </TabsContent>

//         <TabsContent value="table" className="space-y-4">
//           <AppointmentsTable
//             data={appointments}
//             onOpenViewModal={openViewModal}
//           />
//         </TabsContent>

//         <TabsContent value="board">
//           <AppointmentsBoardView
//             onOpenModal={() => setIsCreateModalOpen(true)}
//           />
//         </TabsContent>
//       </Tabs>
//       <Modal
//         label={t(isEditMode ? "Edit Appointment" : "Appointment Details")}
//         open={isViewModalOpen} // Коригирано
//         onOpenChange={setIsViewModalOpen} // Коригирано
//       >
//         {selectedAppointment && (
//           <div className="space-y-6">
//             {!isEditMode ? (
//               <>
//                 <ViewDetails
//                   handleEditAppointment={handleEditAppointment}
//                   handleDeleteAppointment={handleDeleteAppointment}
//                   selectedAppointment={selectedAppointment}
//                 />
//               </>
//             ) : (
//               <>
//                 {editingAppointment && (
//                   <EditForm
//                     handleSaveEdit={handleSaveEdit}
//                     editingAppointment={editingAppointment}
//                     setEditingAppointment={setEditingAppointment}
//                     setIsEditMode={setIsEditMode}
//                   />
//                 )}
//               </>
//             )}
//           </div>
//         )}
//       </Modal>

//       <Modal
//         label={t("Create New Appointment")}
//         open={isCreateModalOpen}
//         onOpenChange={setIsCreateModalOpen}
//       >
//         <CreateAppointmant
//           handleCreateAppointment={handleCreateAppointment}
//           newAppointment={newAppointment}
//           setNewAppointment={setNewAppointment}
//           setIsCreateModalOpen={setIsCreateModalOpen}
//           appoitmentTypesOptions={appoitmentTypesOptions}
//           appointmentTypes={appointmentTypes}
//         />
//       </Modal>
//     </div>
//   );
// }

export const mockAppointments: Appointment[] = [
  // --- Понеделник, 06.10.2025 ---
  {
    _id: "20251006_01",
    clientName: "Александър Николов",
    clientEmail: "a.nikolov@mail.bg",
    clientPhone: "0881112233",
    appointmentTime: {
      start: "2025-10-06T06:00:00Z",
      end: "2025-10-06T07:00:00Z",
    }, // 09:00 - 10:00 EEST
    serviceName: "Подстригване и измиване",
    status: "confirmed",
    staff: "Петя",
  },
  {
    _id: "20251006_02",
    clientName: "Биляна Тодорова",
    clientEmail: "b.todorova@mail.bg",
    clientPhone: "0882223344",
    appointmentTime: {
      start: "2025-10-06T07:00:00Z",
      end: "2025-10-06T08:00:00Z",
    }, // 10:00 - 11:00 EEST
    serviceName: "Маникюр с гел лак",
    status: "confirmed",
    staff: "Ани",
  },
  {
    _id: "20251006_03",
    clientName: "Христо Иванов",
    clientEmail: "h.ivanov@mail.bg",
    clientPhone: "0883334455",
    appointmentTime: {
      start: "2025-10-06T08:00:00Z",
      end: "2025-10-06T09:00:00Z",
    }, // 11:00 - 12:00 EEST
    serviceName: "Масаж - Дълбокотъканен (60 мин)",
    status: "confirmed",
    notes: "Предпочита музика без вокали.",
    staff: "Крум",
  },
  {
    _id: "20251006_04",
    clientName: "Десислава Петрова",
    clientEmail: "d.petrova@mail.bg",
    clientPhone: "0884445566",
    appointmentTime: {
      start: "2025-10-06T09:30:00Z",
      end: "2025-10-06T10:30:00Z",
    }, // 12:30 - 13:30 EEST (30 мин. почивка)
    serviceName: "Боядисване на корени",
    status: "completed",
    staff: "Петя",
  },
  {
    _id: "20251006_05",
    clientName: "Емил Георгиев",
    clientEmail: "e.georgiev@mail.bg",
    clientPhone: "0885556677",
    appointmentTime: {
      start: "2025-10-06T11:30:00Z",
      end: "2025-10-06T12:00:00Z",
    }, // 14:30 - 15:00 EEST (60 мин. обедна почивка)
    serviceName: "Консултация за коса",
    status: "confirmed",
    staff: "Петя",
  },
  {
    _id: "20251006_06",
    clientName: "Филип Кирилов",
    clientEmail: "f.kirilov@mail.bg",
    clientPhone: "0886667788",
    appointmentTime: {
      start: "2025-10-06T12:00:00Z",
      end: "2025-10-06T13:00:00Z",
    }, // 15:00 - 16:00 EEST
    serviceName: "Педикюр",
    status: "pending",
    staff: "Ани",
  },
  {
    _id: "20251006_07",
    clientName: "Габриела Стоянова",
    clientEmail: "g.stoyanova@mail.bg",
    clientPhone: "0887778899",
    appointmentTime: {
      start: "2025-10-06T13:00:00Z",
      end: "2025-10-06T14:00:00Z",
    }, // 16:00 - 17:00 EEST
    serviceName: "Почистване на лице - Класик",
    status: "cancelled",
    notes: "Отменен по имейл.",
    staff: "Крум",
  },
  {
    _id: "20251006_08",
    clientName: "Наталия Димитрова",
    clientEmail: "n.dimitrova@mail.bg",
    clientPhone: "0888889900",
    appointmentTime: {
      start: "2025-10-06T14:00:00Z",
      end: "2025-10-06T15:00:00Z",
    }, // 17:00 - 18:00 EEST
    serviceName: "Антицелулитна терапия",
    status: "confirmed",
    staff: "Ани",
  },

  // --- Вторник, 07.10.2025 ---
  {
    _id: "20251007_01",
    clientName: "Здравко Илиев",
    clientEmail: "z.iliev@mail.bg",
    clientPhone: "0891112233",
    appointmentTime: {
      start: "2025-10-07T06:30:00Z",
      end: "2025-10-07T07:30:00Z",
    }, // 09:30 - 10:30 EEST
    serviceName: "Подстригване",
    status: "confirmed",
    staff: "Крум",
  },
  {
    _id: "20251007_02",
    clientName: "Ива Христова",
    clientEmail: "i.hristova@mail.bg",
    clientPhone: "0892223344",
    appointmentTime: {
      start: "2025-10-07T07:30:00Z",
      end: "2025-10-07T08:00:00Z",
    }, // 10:30 - 11:00 EEST
    serviceName: "Сваляне на гел лак",
    status: "missed",
    notes: "Не се появи.",
    staff: "Ани",
  },
  {
    _id: "20251007_03",
    clientName: "Калин Радев",
    clientEmail: "k.radev@mail.bg",
    clientPhone: "0893334455",
    appointmentTime: {
      start: "2025-10-07T08:00:00Z",
      end: "2025-10-07T09:30:00Z",
    }, // 11:00 - 12:30 EEST
    serviceName: "Кичури и подстригване",
    status: "completed",
    staff: "Петя",
  },
  {
    _id: "20251007_04",
    clientName: "Людмила Вълкова",
    clientEmail: "l.valkova@mail.bg",
    clientPhone: "0894445566",
    appointmentTime: {
      start: "2025-10-07T10:00:00Z",
      end: "2025-10-07T11:00:00Z",
    }, // 13:00 - 14:00 EEST
    serviceName: "Масаж - Релаксиращ (60 мин)",
    status: "confirmed",
    staff: "Крум",
  },
  {
    _id: "20251007_05",
    clientName: "Марио Стоилов",
    clientEmail: "m.stoilov@mail.bg",
    clientPhone: "0895556677",
    appointmentTime: {
      start: "2025-10-07T12:00:00Z",
      end: "2025-10-07T12:45:00Z",
    }, // 15:00 - 15:45 EEST
    serviceName: "Мъжко бръснене",
    status: "pending",
    staff: "Петя",
  },
  {
    _id: "20251007_06",
    clientName: "Никол Георгиева",
    clientEmail: "n.georgieva@mail.bg",
    clientPhone: "0896667788",
    appointmentTime: {
      start: "2025-10-07T12:45:00Z",
      end: "2025-10-07T13:45:00Z",
    }, // 15:45 - 16:45 EEST
    serviceName: "Педикюр",
    status: "confirmed",
    staff: "Ани",
  },
  {
    _id: "20251007_07",
    clientName: "Огнян Пеев",
    clientEmail: "o.peev@mail.bg",
    clientPhone: "0897778899",
    appointmentTime: {
      start: "2025-10-07T13:45:00Z",
      end: "2025-10-07T14:15:00Z",
    }, // 16:45 - 17:15 EEST
    serviceName: "Подстригване",
    status: "completed",
    staff: "Крум",
  },
  {
    _id: "20251007_08",
    clientName: "Петя Ангелова",
    clientEmail: "p.angelova@mail.bg",
    clientPhone: "0898889900",
    appointmentTime: {
      start: "2025-10-07T14:15:00Z",
      end: "2025-10-07T15:15:00Z",
    }, // 17:15 - 18:15 EEST
    serviceName: "Ламиниране на мигли",
    status: "pending",
    staff: "Ани",
  },

  // --- Сряда, 08.10.2025 ---
  {
    _id: "20251008_01",
    clientName: "Радослав Динев",
    clientEmail: "r.dinev@mail.bg",
    clientPhone: "0871112233",
    appointmentTime: {
      start: "2025-10-08T07:00:00Z",
      end: "2025-10-08T08:30:00Z",
    }, // 10:00 - 11:30 EEST
    serviceName: "Терапия за коса",
    status: "confirmed",
    staff: "Петя",
  },
  {
    _id: "20251008_02",
    clientName: "Симона Янева",
    clientEmail: "s.yaneva@mail.bg",
    clientPhone: "0872223344",
    appointmentTime: {
      start: "2025-10-08T08:30:00Z",
      end: "2025-10-08T09:30:00Z",
    }, // 11:30 - 12:30 EEST
    serviceName: "Почистване на лице - Дълбоко",
    status: "pending",
    staff: "Крум",
  },
  {
    _id: "20251008_03",
    clientName: "Таня Колева",
    clientEmail: "t.koleva@mail.bg",
    clientPhone: "0873334455",
    appointmentTime: {
      start: "2025-10-08T10:00:00Z",
      end: "2025-10-08T11:00:00Z",
    }, // 13:00 - 14:00 EEST
    serviceName: "Маникюр",
    status: "confirmed",
    staff: "Ани",
  },
  {
    _id: "20251008_04",
    clientName: "Уляна Захариева",
    clientEmail: "u.zahar@mail.bg",
    clientPhone: "0874445566",
    appointmentTime: {
      start: "2025-10-08T12:00:00Z",
      end: "2025-10-08T13:00:00Z",
    }, // 15:00 - 16:00 EEST
    serviceName: "Масаж (60 мин)",
    status: "cancelled",
    notes: "Отменен по телефона, презаписан за петък.",
    staff: "Крум",
  },
  {
    _id: "20251008_05",
    clientName: "Васил Петков",
    clientEmail: "v.petkov@mail.bg",
    clientPhone: "0875556677",
    appointmentTime: {
      start: "2025-10-08T13:00:00Z",
      end: "2025-10-08T13:30:00Z",
    }, // 16:00 - 16:30 EEST
    serviceName: "Подстригване",
    status: "completed",
    staff: "Петя",
  },
  {
    _id: "20251008_06",
    clientName: "Весела Димитрова",
    clientEmail: "v.dimitrova@mail.bg",
    clientPhone: "0876667788",
    appointmentTime: {
      start: "2025-10-08T13:30:00Z",
      end: "2025-10-08T14:30:00Z",
    }, // 16:30 - 17:30 EEST
    serviceName: "Боядисване",
    status: "confirmed",
    notes: "Нов цвят, по-светъл от преди.",
    staff: "Петя",
  },
  {
    _id: "20251008_07",
    clientName: "Галин Иванов",
    clientEmail: "g.ivanov@mail.bg",
    clientPhone: "0877778899",
    appointmentTime: {
      start: "2025-10-08T14:30:00Z",
      end: "2025-10-08T15:00:00Z",
    }, // 17:30 - 18:00 EEST
    serviceName: "Оформяне на брада",
    status: "pending",
    staff: "Крум",
  },
  {
    _id: "20251008_08",
    clientName: "Деница Атанасова",
    clientEmail: "d.atanasova@mail.bg",
    clientPhone: "0878889900",
    appointmentTime: {
      start: "2025-10-08T15:00:00Z",
      end: "2025-10-08T16:00:00Z",
    }, // 18:00 - 19:00 EEST
    serviceName: "Педикюр",
    status: "confirmed",
    staff: "Ани",
  },

  // --- Четвъртък, 09.10.2025 ---
  {
    _id: "20251009_01",
    clientName: "Елена Борисова",
    clientEmail: "e.borisova@mail.bg",
    clientPhone: "0889990011",
    appointmentTime: {
      start: "2025-10-09T06:00:00Z",
      end: "2025-10-09T07:30:00Z",
    }, // 09:00 - 10:30 EEST
    serviceName: "Терапия и прическа",
    status: "confirmed",
    staff: "Петя",
  },
  {
    _id: "20251009_02",
    clientName: "Живко Колев",
    clientEmail: "zh.kolev@mail.bg",
    clientPhone: "0880001122",
    appointmentTime: {
      start: "2025-10-09T07:30:00Z",
      end: "2025-10-09T08:00:00Z",
    }, // 10:30 - 11:00 EEST
    serviceName: "Подстригване",
    status: "completed",
    staff: "Крум",
  },
  {
    _id: "20251009_03",
    clientName: "Ивона Георгиева",
    clientEmail: "i.georgieva@mail.bg",
    clientPhone: "0881234567",
    appointmentTime: {
      start: "2025-10-09T08:00:00Z",
      end: "2025-10-09T09:00:00Z",
    }, // 11:00 - 12:00 EEST
    serviceName: "Маникюр - Френски",
    status: "confirmed",
    notes: "Моля, да е много прецизен френският.",
    staff: "Ани",
  },
  {
    _id: "20251009_04",
    clientName: "Катерина Петрова",
    clientEmail: "k.petrova@mail.bg",
    clientPhone: "0887654321",
    appointmentTime: {
      start: "2025-10-09T09:30:00Z",
      end: "2025-10-09T10:30:00Z",
    }, // 12:30 - 13:30 EEST
    serviceName: "Масаж (60 мин)",
    status: "pending",
    staff: "Крум",
  },
  {
    _id: "20251009_05",
    clientName: "Любомир Тодоров",
    clientEmail: "l.todorov@mail.bg",
    clientPhone: "0888901234",
    appointmentTime: {
      start: "2025-10-09T12:00:00Z",
      end: "2025-10-09T13:30:00Z",
    }, // 15:00 - 16:30 EEST
    serviceName: "Почистване на лице и маска",
    status: "confirmed",
    staff: "Петя",
  },
  {
    _id: "20251009_06",
    clientName: "Мария Николова",
    clientEmail: "m.nikolova@mail.bg",
    clientPhone: "0880123456",
    appointmentTime: {
      start: "2025-10-09T13:30:00Z",
      end: "2025-10-09T14:30:00Z",
    }, // 16:30 - 17:30 EEST
    serviceName: "Педикюр",
    status: "pending",
    staff: "Ани",
  },
  {
    _id: "20251009_07",
    clientName: "Никола Стоянов",
    clientEmail: "n.stoyanov@mail.bg",
    clientPhone: "0882345678",
    appointmentTime: {
      start: "2025-10-09T14:30:00Z",
      end: "2025-10-09T15:00:00Z",
    }, // 17:30 - 18:00 EEST
    serviceName: "Подстригване",
    status: "completed",
    staff: "Крум",
  },
  {
    _id: "20251009_08",
    clientName: "Олга Димитрова",
    clientEmail: "o.dimitrova@mail.bg",
    clientPhone: "0883456789",
    appointmentTime: {
      start: "2025-10-09T15:00:00Z",
      end: "2025-10-09T16:00:00Z",
    }, // 18:00 - 19:00 EEST
    serviceName: "Боядисване",
    status: "missed",
    staff: "Петя",
  },

  // --- Петък, 10.10.2025 ---
  {
    _id: "20251010_01",
    clientName: "Пламен Илиев",
    clientEmail: "p.iliev@mail.bg",
    clientPhone: "0894567890",
    appointmentTime: {
      start: "2025-10-10T06:30:00Z",
      end: "2025-10-10T07:30:00Z",
    }, // 09:30 - 10:30 EEST
    serviceName: "Масаж - Спортен (60 мин)",
    status: "confirmed",
    notes: "Наблягане на гърба.",
    staff: "Крум",
  },
  {
    _id: "20251010_02",
    clientName: "Румяна Георгиева",
    clientEmail: "r.georgieva@mail.bg",
    clientPhone: "0895678901",
    appointmentTime: {
      start: "2025-10-10T07:30:00Z",
      end: "2025-10-10T08:30:00Z",
    }, // 10:30 - 11:30 EEST
    serviceName: "Подстригване и прическа",
    status: "pending",
    staff: "Петя",
  },
  {
    _id: "20251010_03",
    clientName: "Стефан Асенов",
    clientEmail: "s.asenov@mail.bg",
    clientPhone: "0896789012",
    appointmentTime: {
      start: "2025-10-10T08:30:00Z",
      end: "2025-10-10T09:30:00Z",
    }, // 11:30 - 12:30 EEST
    serviceName: "Педикюр",
    status: "confirmed",
    staff: "Ани",
  },
  {
    _id: "20251010_04",
    clientName: "Татяна Бонева",
    clientEmail: "t.boneva@mail.bg",
    clientPhone: "0897890123",
    appointmentTime: {
      start: "2025-10-10T10:00:00Z",
      end: "2025-10-10T11:00:00Z",
    }, // 13:00 - 14:00 EEST
    serviceName: "Маникюр - Класически",
    status: "completed",
    staff: "Ани",
  },
  {
    _id: "20251010_05",
    clientName: "Уляна Захариева",
    clientEmail: "u.zahar@mail.bg",
    clientPhone: "0874445566",
    appointmentTime: {
      start: "2025-10-10T12:00:00Z",
      end: "2025-10-10T13:00:00Z",
    }, // 15:00 - 16:00 EEST (Презаписан час)
    serviceName: "Масаж (60 мин)",
    status: "confirmed",
    staff: "Крум",
  },
  {
    _id: "20251010_06",
    clientName: "Филип Райков",
    clientEmail: "f.raykov@mail.bg",
    clientPhone: "0898901234",
    appointmentTime: {
      start: "2025-10-10T13:00:00Z",
      end: "2025-10-10T14:30:00Z",
    }, // 16:00 - 17:30 EEST
    serviceName: "Боядисване",
    status: "pending",
    notes: "Светло кафяво.",
    staff: "Петя",
  },
  {
    _id: "20251010_07",
    clientName: "Христина Петрова",
    clientEmail: "h.petrova@mail.bg",
    clientPhone: "0899012345",
    appointmentTime: {
      start: "2025-10-10T14:30:00Z",
      end: "2025-10-10T15:30:00Z",
    }, // 17:30 - 18:30 EEST
    serviceName: "Почистване на лице",
    status: "confirmed",
    staff: "Крум",
  },
  {
    _id: "20251010_08",
    clientName: "Цветан Генов",
    clientEmail: "c.genov@mail.bg",
    clientPhone: "0890123456",
    appointmentTime: {
      start: "2025-10-10T15:30:00Z",
      end: "2025-10-10T16:00:00Z",
    }, // 18:30 - 19:00 EEST
    serviceName: "Мъжко подстригване",
    status: "pending",
    staff: "Петя",
  },
];
