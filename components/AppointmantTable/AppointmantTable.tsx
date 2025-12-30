"use client";

import { Appointment, AppointmentStatus } from "@/Global/Types/types";
import { CellProps, Column, GenericTable } from "../GenericTable/GenericTable";
import { useTranslation } from "react-i18next";
import {
  Clock,
  CalendarIcon,
  Trash2,
  Eye,
  Pencil,
  CreditCard,
} from "lucide-react";
import { formatDateAndTime } from "@/Global/Utils/commonFn";
import { CustomTooltip } from "../customUIComponents/CustomTooltip";
import { StatusChip } from "../customUIComponents/StatusChip";
import { useAuthContext } from "@/context/AuthContext";

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
  const { user } = useAuthContext();
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
            {(appointment.paymentStatus === "captured" ||
              appointment.paymentStatus === "authorized" ||
              appointment.serviceName === "card") && (
              <CreditCard className="h-4 w-4 text-green-500" />
            )}
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
      accessorKey: "paymentStatus",
      header: t("Payment"),
      cell: ({ row }: CellProps<Appointment>) => {
        const paymentStatus = row.original.paymentStatus;
        const serviceName = row.original.serviceName;

        // Check if it's card payment by serviceName or paymentStatus
        const isPaidOnline =
          paymentStatus === "captured" ||
          paymentStatus === "authorized" ||
          serviceName === "card";

        if (!paymentStatus || paymentStatus === "not_required") {
          if (serviceName === "card") {
            return (
              <div className="flex items-center gap-1">
                <CreditCard className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">
                  {t("Paid Online")}
                </span>
              </div>
            );
          }
          return (
            <span className="text-sm text-muted-foreground">{t("Cash")}</span>
          );
        }
        if (paymentStatus === "captured" || paymentStatus === "authorized") {
          return (
            <div className="flex items-center gap-1">
              <CreditCard className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600 font-medium">
                {t("Paid Online")}
              </span>
            </div>
          );
        }
        if (paymentStatus === "pending") {
          return (
            <span className="text-sm text-yellow-600">{t("Pending")}</span>
          );
        }
        if (paymentStatus === "refunded") {
          return <span className="text-sm text-blue-600">{t("Refunded")}</span>;
        }
        if (paymentStatus === "failed" || paymentStatus === "cancelled") {
          return <span className="text-sm text-red-600">{t("Failed")}</span>;
        }
        return <span className="text-sm text-muted-foreground">-</span>;
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
            onClick={() => onOpenEditModal(row.original)}
            tooltipText={t("Edit")}
            icon={<Pencil />}
          />
          {user && (user.role === "business" || user.role == "staff") && (
            <CustomTooltip
              onClick={() => onDeleteAppointment(row.original._id)}
              tooltipText={t("Delete")}
              icon={<Trash2 className=" text-red-500" />}
            />
          )}
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
