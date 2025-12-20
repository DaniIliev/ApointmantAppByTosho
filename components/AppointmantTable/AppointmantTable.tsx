"use client";

import { Appointment, AppointmentStatus } from "@/Global/Types/types";
import { CellProps, Column, GenericTable } from "../GenericTable/GenericTable";
import { useTranslation } from "react-i18next";
import { Clock, CalendarIcon, Trash2, Eye, Pencil } from "lucide-react";
import { formatDateAndTime } from "@/Global/Utils/commonFn";
import { CustomTooltip } from "../customUIComponents/CustomTooltip";
import { StatusChip } from "../customUIComponents/StatusChip";

type AppointmentsTableProps = {
  data: Appointment[];
  onOpenViewModal: (appointment: Appointment) => void;
  onOpenEditModal: (appointment: Appointment) => void;
  onDeleteAppointment: (appointmentId: string) => void | Promise<void>;
};

export default function AppointmentsTable({
  data,
  onOpenViewModal,
  onOpenEditModal,
  onDeleteAppointment,
}: AppointmentsTableProps) {
  const { t } = useTranslation();
  const handleOpenViewModal = (appointment: Appointment): void => {
    onOpenViewModal(appointment);
  };

  const columns: Column<Appointment>[] = [
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
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: t("Status"),
      cell: ({ row }: CellProps<Appointment>) => (
        <div className="flex items-center gap-2">
          <StatusChip status={row.original.status as AppointmentStatus} />
        </div>
      ),
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
            onClick={() => onOpenEditModal(row.original)}
            tooltipText={t("Edit")}
            icon={<Pencil />}
          />
          <CustomTooltip
            onClick={() => onDeleteAppointment(row.original._id)}
            tooltipText={t("Delete")}
            icon={<Trash2 className=" text-red-500" />}
          />
        </div>
      ),
      enableHiding: false,
    },
  ];

  const tableData: Appointment[] = data.map((apt) => ({
    ...apt,
    date: apt.appointmentTime.start,
    time: formatDateAndTime(apt.appointmentTime.start, "time"),
  }));

  return (
    <div>
      <GenericTable
        data={tableData}
        columns={columns}
        onOpenViewModal={handleOpenViewModal}
      />
    </div>
  );
}
