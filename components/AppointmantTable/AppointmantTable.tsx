"use client";

import { Appointment, AppointmentStatus } from "@/Global/Types/types";
import { CellProps, Column, GenericTable } from "../GenericTable/GenericTable";
import { useTranslation } from "react-i18next";
import {
  Clock,
  CalendarIcon,
  FileText,
  Trash2,
  Edit,
  Eye,
  Pencil,
} from "lucide-react";
import { getStatusColor } from "@/Global/Utils/statusIndicator";
import { formatDateAndTime } from "@/Global/Utils/commonFn";
import { CustomTooltip } from "../customUIComponents/CustomTooltip";
import { StatusChip } from "../customUIComponents/StatusChip";

type AppointmentsTableProps = {
  data: Appointment[];
  onOpenViewModal: (appointment: Appointment) => void;
};

export default function AppointmentsTable({
  data,
  onOpenViewModal,
}: AppointmentsTableProps) {
  const { t } = useTranslation();
  //   {
  //     id: "1",
  //     clientName: "Иван Петров",
  //     date: "2023-11-20T10:00:00Z",
  //     time: "10:00 AM",
  //     service: "Подстригване",
  //     status: "completed",
  //     clientEmail: "",
  //     clientPhone: "",
  //   },
  //   {
  //     id: "2",
  //     clientName: "Мария Георгиева",
  //     date: "2023-11-21T14:30:00Z",
  //     time: "02:30 PM",
  //     service: "Боядисване",
  //     status: "upcoming",
  //     clientEmail: "",
  //     clientPhone: "",
  //   },
  //   {
  //     id: "3",
  //     clientName: "Георги Колев",
  //     date: "2023-11-19T09:00:00Z",
  //     time: "09:00 AM",
  //     service: "Маникюр",
  //     status: "cancelled",
  //     clientEmail: "",
  //     clientPhone: "",
  //   },
  //   {
  //     id: "4",
  //     clientName: "Анна Иванова",
  //     date: "2023-11-25T11:00:00Z",
  //     time: "11:00 AM",
  //     service: "Масаж",
  //     status: "upcoming",
  //     clientEmail: "",
  //     clientPhone: "",
  //   },
  //   {
  //     id: "5",
  //     clientName: "Петър Димитров",
  //     date: "2023-11-18T16:00:00Z",
  //     time: "04:00 PM",
  //     service: "Фризура",
  //     status: "completed",
  //     clientEmail: "",
  //     clientPhone: "",
  //   },
  //   {
  //     id: "6",
  //     clientName: "Елена Стоянова",
  //     date: "2023-11-22T15:00:00Z",
  //     time: "03:00 PM",
  //     service: "Подстригване",
  //     status: "upcoming",
  //     clientEmail: "",
  //     clientPhone: "",
  //   },
  //   {
  //     id: "7",
  //     clientName: "Николай Николов",
  //     date: "2023-11-17T13:00:00Z",
  //     time: "01:00 PM",
  //     service: "Фризура",
  //     status: "completed",
  //     clientEmail: "",
  //     clientPhone: "",
  //   },
  //   {
  //     id: "8",
  //     clientName: "Десислава Петкова",
  //     date: "2023-11-23T10:30:00Z",
  //     time: "10:30 AM",
  //     service: "Боядисване",
  //     status: "upcoming",
  //     clientEmail: "",
  //     clientPhone: "",
  //   },
  //   {
  //     id: "9",
  //     clientName: "Александър Иванов",
  //     date: "2023-11-16T17:00:00Z",
  //     time: "05:00 PM",
  //     service: "Маникюр",
  //     status: "cancelled",
  //     clientEmail: "",
  //     clientPhone: "",
  //   },
  //   {
  //     id: "10",
  //     clientName: "Симона Василева",
  //     date: "2023-11-24T12:00:00Z",
  //     time: "12:00 PM",
  //     service: "Масаж",
  //     status: "upcoming",
  //     clientEmail: "",
  //     clientPhone: "",
  //   },
  //   {
  //     id: "11",
  //     clientName: "Ивайло Борисов",
  //     date: "2023-11-15T11:30:00Z",
  //     time: "11:30 AM",
  //     service: "Подстригване",
  //     status: "completed",
  //     clientEmail: "",
  //     clientPhone: "",
  //   },
  // ];

  const handleOpenViewModal = (appointment: Appointment): void => {
    console.log("View details for:", appointment);
    // Добавете логика за отваряне на модален прозорец тук
    // onOpenViewModal(appointment);
  };

  const columns: Column<any>[] = [
    {
      accessorKey: "clientName",
      header: t("Client Name"),
      cell: ({ row }: CellProps<Appointment>) => {
        const appointment = row.original;
        return (
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">
              {appointment.clientName}
            </h3>
            <span className={`px-2 py-0.5 text-xs rounded-full`}>
              <StatusChip status={appointment.status as AppointmentStatus} />
              {/* {t(
                appointment.status.charAt(0).toUpperCase() +
                  appointment.status.slice(1)
              )} */}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "date",
      header: t("Date"),
      cell: ({ row }: CellProps<Appointment>) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <CalendarIcon className="h-3 w-3" />
          <span>
            {formatDateAndTime(row.original.appointmentTime.start, "date")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "time",
      header: t("Time"),
      cell: ({ row }: CellProps<Appointment>) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>
            {formatDateAndTime(row.original.appointmentTime.start, "time")}
            {"-"}
            {formatDateAndTime(row.original.appointmentTime.end, "time")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "service",
      header: t("Service"),
      cell: ({ row }: CellProps<Appointment>) => (
        <span>{row.original.serviceName}</span>
      ),
    },
    {
      accessorKey: "actions",
      header: t("Actions"),
      cell: ({ row }: CellProps<Appointment>) => (
        <div className="flex items-center gap-0.5 mobile-actions">
          <CustomTooltip
            onClick={() => handleOpenViewModal(row.original)}
            tooltipText={t("View Details")}
            icon={<Eye />}
          />
          <CustomTooltip
            onClick={() => console.log("Edit")}
            tooltipText={t("Edit")}
            icon={<Pencil />}
          />
          <CustomTooltip
            onClick={() => console.log("Edit")}
            tooltipText={t("Delete")}
            icon={<Trash2 className=" text-red-500" />}
          />
        </div>
      ),
      enableHiding: false,
    },
  ];

  return (
    <div>
      <GenericTable
        data={data}
        columns={columns}
        onOpenViewModal={handleOpenViewModal}
      />
    </div>
  );
}
