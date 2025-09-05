"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnFiltersState,
  getPaginationRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  CalendarIcon,
  FileText,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Appointment, AppointmentStatus } from "@/Global/Types/types";

// Define the component's props
type AppointmentsTableProps = {
  data: Appointment[];
  onOpenViewModal: (appointment: Appointment) => void;
};

// Helper function to get status color
const getStatusColor = (status: AppointmentStatus) => {
  switch (status) {
    case "upcoming":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "completed":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
};

export const AppointmentsTable = ({
  data,
  onOpenViewModal,
}: AppointmentsTableProps) => {
  const { t } = useTranslation();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const columns: ColumnDef<Appointment>[] = [
    {
      accessorKey: "clientName",
      header: t("Client Name"),
      cell: ({ row }) => {
        const appointment = row.original;
        return (
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">
              {appointment.clientName}
            </h3>
            <Badge
              className={`${getStatusColor(
                appointment.status
              )} px-2 py-0.5 text-xs rounded-full`}
            >
              {t(
                appointment.status.charAt(0).toUpperCase() +
                  appointment.status.slice(1)
              )}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "date",
      header: t("Date"),
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <CalendarIcon className="h-3 w-3" />
          <span>{new Date(row.original.date).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      accessorKey: "time",
      header: t("Time"),
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{row.original.time}</span>
        </div>
      ),
    },
    {
      accessorKey: "service",
      header: t("Service"),
      cell: ({ row }) => (
        <span className="font-medium text-primary">{row.original.service}</span>
      ),
    },
    {
      id: "actions",
      header: t("Actions"),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            {/* View Details */}
            <Tooltip>
              <TooltipTrigger
                asChild
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => onOpenViewModal(row.original)}
                >
                  <FileText className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("View Details")}</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                asChild
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("Edit")}</p>
              </TooltipContent>
            </Tooltip>

            {/* Delete */}
            <Tooltip>
              <TooltipTrigger
                asChild
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("Delete")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    state: {
      columnFilters,
      pagination,
    },
  });

  return (
    <div className="rounded-xl border shadow-lg bg-card/70 backdrop-blur-lg border-primary/20">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {t("No results.")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {t("Showing")} {table.getState().pagination.pageIndex + 1} {t("of")}{" "}
          {table.getPageCount()} {t("pages")}.
        </div>
        <div className="flex items-center space-x-2">
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="w-[127px], cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize} {t("per page")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            className="cursor-pointer"
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            className="cursor-pointer"
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
// "use client";

// import { useState } from "react";
// import { useTranslation } from "react-i18next";
// import {
//   ColumnDef,
//   flexRender,
//   getCoreRowModel,
//   useReactTable,
//   ColumnFiltersState,
// } from "@tanstack/react-table";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Clock, CalendarIcon, FileText, Trash2, Edit } from "lucide-react";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { Appointment, AppointmentStatus } from "@/Global/Types/types";

// // Define the component's props
// type AppointmentsTableProps = {
//   data: Appointment[];
//   onOpenViewModal: (appointment: Appointment) => void;
// };

// // Helper function to get status color
// const getStatusColor = (status: AppointmentStatus) => {
//   switch (status) {
//     case "upcoming":
//       return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
//     case "completed":
//       return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
//     case "cancelled":
//       return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
//     default:
//       return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
//   }
// };

// export const AppointmentsTable = ({
//   data,
//   onOpenViewModal,
// }: AppointmentsTableProps) => {
//   const { t } = useTranslation();
//   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

//   const columns: ColumnDef<Appointment>[] = [
//     {
//       accessorKey: "clientName",
//       header: t("Client Name"),
//       cell: ({ row }) => {
//         const appointment = row.original;
//         return (
//           <div className="flex items-center gap-2">
//             <h3 className="font-semibold text-foreground">
//               {appointment.clientName}
//             </h3>
//             <Badge
//               className={`${getStatusColor(
//                 appointment.status
//               )} px-2 py-0.5 text-xs rounded-full`}
//             >
//               {t(
//                 appointment.status.charAt(0).toUpperCase() +
//                   appointment.status.slice(1)
//               )}
//             </Badge>
//           </div>
//         );
//       },
//     },
//     {
//       accessorKey: "date",
//       header: t("Date"),
//       cell: ({ row }) => (
//         <div className="flex items-center gap-1 text-sm text-muted-foreground">
//           <CalendarIcon className="h-3 w-3" />
//           <span>{new Date(row.original.date).toLocaleDateString()}</span>
//         </div>
//       ),
//     },
//     {
//       accessorKey: "time",
//       header: t("Time"),
//       cell: ({ row }) => (
//         <div className="flex items-center gap-1 text-sm text-muted-foreground">
//           <Clock className="h-3 w-3" />
//           <span>{row.original.time}</span>
//         </div>
//       ),
//     },
//     {
//       accessorKey: "service",
//       header: t("Service"),
//       cell: ({ row }) => (
//         <span className="font-medium text-primary">{row.original.service}</span>
//       ),
//     },
//     {
//       id: "actions",
//       header: t("Actions"),
//       cell: ({ row }) => (
//         <div className="flex items-center gap-2">
//           <TooltipProvider>
//             {/* View Details */}
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Button
//                   variant="ghost"
//                   className="h-8 w-8 p-0"
//                   onClick={() => onOpenViewModal(row.original)}
//                 >
//                   <FileText className="h-4 w-4" />
//                 </Button>
//               </TooltipTrigger>
//               <TooltipContent>
//                 <p>{t("View Details")}</p>
//               </TooltipContent>
//             </Tooltip>

//             {/* Edit */}
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Button variant="ghost" className="h-8 w-8 p-0">
//                   <Edit className="h-4 w-4" />
//                 </Button>
//               </TooltipTrigger>
//               <TooltipContent>
//                 <p>{t("Edit")}</p>
//               </TooltipContent>
//             </Tooltip>

//             {/* Delete */}
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Button variant="ghost" className="h-8 w-8 p-0">
//                   <Trash2 className="h-4 w-4 text-red-500" />
//                 </Button>
//               </TooltipTrigger>
//               <TooltipContent>
//                 <p>{t("Delete")}</p>
//               </TooltipContent>
//             </Tooltip>
//           </TooltipProvider>
//         </div>
//       ),
//     },
//   ];

//   const table = useReactTable({
//     data,
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//     onColumnFiltersChange: setColumnFilters,
//     state: {
//       columnFilters,
//     },
//   });

//   return (
//     <div className="rounded-xl border shadow-lg bg-card/70 backdrop-blur-lg border-primary/20">
//       <Table>
//         <TableHeader>
//           {table.getHeaderGroups().map((headerGroup) => (
//             <TableRow key={headerGroup.id}>
//               {headerGroup.headers.map((header) => (
//                 <TableHead key={header.id}>
//                   {header.isPlaceholder
//                     ? null
//                     : flexRender(
//                         header.column.columnDef.header,
//                         header.getContext()
//                       )}
//                 </TableHead>
//               ))}
//             </TableRow>
//           ))}
//         </TableHeader>
//         <TableBody>
//           {table.getRowModel().rows?.length ? (
//             table.getRowModel().rows.map((row) => (
//               <TableRow
//                 key={row.id}
//                 data-state={row.getIsSelected() && "selected"}
//               >
//                 {row.getVisibleCells().map((cell) => (
//                   <TableCell key={cell.id}>
//                     {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                   </TableCell>
//                 ))}
//               </TableRow>
//             ))
//           ) : (
//             <TableRow>
//               <TableCell colSpan={columns.length} className="h-24 text-center">
//                 {t("No results.")}
//               </TableCell>
//             </TableRow>
//           )}
//         </TableBody>
//       </Table>
//     </div>
//   );
// };
