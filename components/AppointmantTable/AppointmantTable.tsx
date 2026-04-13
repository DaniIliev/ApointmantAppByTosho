"use client";

import { Appointment, AppointmentStatus } from "@/Global/Types/types";
import {
  CellProps,
  Column,
  GenericTable,
  Column as GenericColumn,
} from "../GenericTable/GenericTable";
import { useTranslation } from "react-i18next";
import {
  Clock,
  CalendarIcon,
  Trash2,
  Eye,
  Pencil,
  CreditCard,
  Users,
} from "lucide-react";
import { formatDateAndTime } from "@/Global/Utils/commonFn";
import {
  groupAppointments,
  GroupedAppointment,
} from "@/Global/Utils/groupingUtils";
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

  const columns: Column<any>[] = [
    {
      accessorKey: "clientName",
      header: t("Client Name"),
      cell: ({ row }: CellProps<any>) => {
        const item = row.original;
        if (item.isGroup) {
          return (
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-1.5 rounded-lg">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <span className="font-bold text-primary">
                {item.count} {t("Participants")}
              </span>
            </div>
          );
        }
        return (
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{item.clientName}</h3>
            {(item.paymentStatus === "captured" ||
              item.paymentStatus === "authorized" ||
              item.serviceName === "card") && (
              <CreditCard className="h-4 w-4 text-green-500" />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: t("Status"),
      cell: ({ row }: CellProps<any>) => {
        if (row.original.isGroup)
          return <span className="text-muted-foreground">-</span>;
        return (
          <div className="flex items-center gap-2">
            <StatusChip status={row.original.status as AppointmentStatus} />
          </div>
        );
      },
    },
    {
      accessorKey: "paymentStatus",
      header: t("Payment"),
      cell: ({ row }: CellProps<any>) => {
        if (row.original.isGroup)
          return <span className="text-muted-foreground">-</span>;
        if (row.original.kind === "work_block")
          return <span className="text-muted-foreground">-</span>;
        const paymentStatus = row.original.paymentStatus;
        const serviceName = row.original.serviceName;

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
      cell: ({ row }: CellProps<any>) => {
        const apt = row.original.isGroup
          ? row.original.mainAppointment
          : row.original;
        return (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <CalendarIcon className="h-3 w-3" />
            <span>{formatDateAndTime(apt.appointmentTime.start, "date")}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "time",
      header: t("Time"),
      cell: ({ row }: CellProps<any>) => {
        const apt = row.original.isGroup
          ? row.original.mainAppointment
          : row.original;
        return (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              {formatDateAndTime(apt.appointmentTime.start, "time")}
              {"-"}
              {formatDateAndTime(apt.appointmentTime.end, "time")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "service",
      header: t("Service"),
      cell: ({ row }: CellProps<any>) => {
        const apt = row.original.isGroup
          ? row.original.mainAppointment
          : row.original;
        return <span>{apt.serviceName}</span>;
      },
    },
    {
      accessorKey: "actions",
      header: t("Actions"),
      cell: ({ row }: CellProps<any>) => {
        if (row.original.isGroup) return null;
        if (row.original.kind === "work_block") {
          return (
            <div className="flex items-center gap-0.5 mobile-actions">
              <CustomTooltip
                onClick={() => handleOpenViewModal(row.original)}
                tooltipText={t("View Details")}
                icon={<Eye />}
              />
              {user && (user.role === "business" || user.role == "staff") && (
                <CustomTooltip
                  onClick={() => onDeleteAppointment(row.original._id)}
                  tooltipText={t("Delete")}
                  icon={<Trash2 className=" text-red-500" />}
                />
              )}
            </div>
          );
        }
        return (
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
        );
      },
      enableHiding: false,
    },
  ];

  const groupedData = groupAppointments(data);

  const tableData = groupedData.map((item: any) => {
    const apt = item.isGroup ? item.mainAppointment : item;
    return {
      ...item,
      date: apt.appointmentTime.start,
      time: formatDateAndTime(apt.appointmentTime.start, "time"),
    };
  });

  const renderRowDetails = (
    item: any,
    allColumns: Column<any>[],
    columnVisibility: Record<string, boolean>,
    columnWidths: Record<string, number>,
  ) => {
    if (!item.isGroup) return null;

    const visibleColumns = allColumns.filter(
      (c) => columnVisibility[c.accessorKey as string],
    );

    return (
      <div className="bg-primary/[0.02] border-b border-gray-100 dark:border-gray-800">
        <table className="w-full table-fixed">
          <tbody>
            {item.appointments.map((participant: Appointment) => (
              <tr
                key={participant._id}
                className="hover:bg-primary/[0.05] transition-colors border-l-4 border-primary/20"
              >
                {visibleColumns.map((col, idx) => {
                  const width = columnWidths[col.accessorKey as string];
                  let content = null;

                  if (col.accessorKey === "clientName") {
                    content = (
                      <div className="pl-6 py-3">
                        <span className="font-semibold text-sm">
                          {participant.clientName}
                        </span>
                      </div>
                    );
                  } else if (col.accessorKey === "status") {
                    content = (
                      <div className="flex items-center gap-2">
                        <StatusChip
                          status={participant.status as AppointmentStatus}
                        />
                      </div>
                    );
                  } else if (col.accessorKey === "paymentStatus") {
                    // Reuse column logic or keep simple
                    content = <span className="text-sm opacity-60">-</span>;
                  } else if (col.accessorKey === "actions") {
                    content = (
                      <div className="flex items-center gap-0.5">
                        <CustomTooltip
                          onClick={() => handleOpenViewModal(participant)}
                          tooltipText={t("View")}
                          icon={<Eye size={14} />}
                        />
                        <CustomTooltip
                          onClick={() => onOpenEditModal(participant)}
                          tooltipText={t("Edit")}
                          icon={<Pencil size={14} />}
                        />
                        {user &&
                          (user.role === "business" ||
                            user.role == "staff") && (
                            <CustomTooltip
                              onClick={() =>
                                onDeleteAppointment(participant._id)
                              }
                              tooltipText={t("Delete")}
                              icon={
                                <Trash2 size={14} className="text-red-500" />
                              }
                            />
                          )}
                      </div>
                    );
                  } else {
                    // Fallback to empty for date/time/service as they are shared by the group header
                    content = <span className="text-xs opacity-40">-</span>;
                  }

                  return (
                    <td
                      key={idx}
                      className="px-4 py-2 whitespace-nowrap overflow-hidden text-ellipsis"
                      style={{ width }}
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile View Accordion Content */}
        <div className="md:hidden space-y-3">
          {item.appointments.map((participant: Appointment) => (
            <div
              key={participant._id}
              className="rounded-xl border shadow-sm p-4 bg-white dark:bg-gray-800/70"
            >
              <div className="flex justify-between items-center pb-2 mb-2 border-b border-gray-200 dark:border-gray-700">
                <span className="font-semibold text-gray-600 dark:text-gray-400">
                  {t("Status")}
                </span>
                <div className="flex justify-end text-right text-gray-900 dark:text-gray-100">
                  <StatusChip
                    status={participant.status as AppointmentStatus}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-semibold text-gray-600 dark:text-gray-400">
                  {t("Client Name")}
                </span>
                <div className="flex flex-col items-end text-right text-gray-900 dark:text-gray-100">
                  <span className="font-bold">{participant.clientName}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {participant.email}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 mt-2">
                <span className="font-semibold text-gray-600 dark:text-gray-400">
                  {t("Actions")}
                </span>
                <div className="flex items-center gap-0.5">
                  <CustomTooltip
                    onClick={() => handleOpenViewModal(participant)}
                    tooltipText={t("View")}
                    icon={<Eye size={16} />}
                  />
                  <CustomTooltip
                    onClick={() => onOpenEditModal(participant)}
                    tooltipText={t("Edit")}
                    icon={<Pencil size={16} />}
                  />
                  {user &&
                    (user.role === "business" || user.role == "staff") && (
                      <CustomTooltip
                        onClick={() => onDeleteAppointment(participant._id)}
                        tooltipText={t("Delete")}
                        icon={<Trash2 size={16} className="text-red-500" />}
                      />
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const isAccordionRow = (item: any) => !!item.isGroup;

  const renderAccordionHeader = (item: any) => {
    const apt = item.mainAppointment;
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-1.5 rounded-lg">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <span className="font-bold text-primary">
            {item.count} {t("Participants")}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-3 w-3" />
            <span>{formatDateAndTime(apt.appointmentTime.start, "date")}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatDateAndTime(apt.appointmentTime.start, "time")}</span>
          </div>
          <div className="flex items-center gap-1 col-span-2">
            <span className="font-medium text-foreground">
              {apt.serviceName}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <GenericTable
        data={tableData}
        columns={columns}
        onOpenViewModal={handleOpenViewModal}
        renderRowDetails={renderRowDetails as any}
        isAccordionRow={isAccordionRow}
        renderAccordionHeader={renderAccordionHeader}
      />
    </div>
  );
}
