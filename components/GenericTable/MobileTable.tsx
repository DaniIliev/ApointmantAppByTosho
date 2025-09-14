import React from "react";
import { useTranslation } from "react-i18next";
import { Column } from "./GenericTable";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { DateFilter } from "./smallCompoennts/DateFilter";

interface MobileTableProps<T> {
  data: T[];
  columns: Column<T>[];
  globalFilter: string;
  setGlobalFilter: (filter: string) => void;
  // New props for date filtering
  dateFilter: string;
  setDateFilter: (filter: string) => void;
  sorting: {
    id: string | null;
    direction: "asc" | "desc" | null;
  };
  handleSort: (columnId: string) => void;
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  setPagination: React.Dispatch<
    React.SetStateAction<{
      pageIndex: number;
      pageSize: number;
    }>
  >;
  totalPages: number;
}

export const MobileTable = <T extends Record<string, any>>({
  data,
  columns,
  globalFilter,
  setGlobalFilter,
  dateFilter, // Destructure new prop
  setDateFilter, // Destructure new prop
  pagination,
  setPagination,
  totalPages,
}: MobileTableProps<T>) => {
  const { t } = useTranslation();

  const statusColumn = columns.find(
    (col) =>
      col.accessorKey === "status" || col.header.toLowerCase() === "status"
  );
  const actionColumn = columns.find((col) => col.accessorKey === "actions");

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder={t("Filter items...")}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {columns.some((col) => col.accessorKey === "date") && (
          <DateFilter onDateFilterChange={setDateFilter} />
        )}
      </div>

      {data.length > 0 ? (
        data.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="rounded-xl border shadow-lg p-4 bg-white dark:bg-gray-800/70"
          >
            {statusColumn && (
              <div className="flex justify-between items-center pb-2 mb-2 border-b border-gray-200 dark:border-gray-700">
                <span className="font-semibold text-gray-600 dark:text-gray-400">
                  {statusColumn.header}
                </span>
                <div className="text-right text-gray-900 dark:text-gray-100">
                  {statusColumn.cell({ row: { original: row } })}
                </div>
              </div>
            )}

            {columns
              .filter(
                (c) => c.accessorKey !== "actions" && c.accessorKey !== "status"
              )
              .map((column, colIndex) => (
                <div
                  key={colIndex}
                  className="flex justify-between items-center py-2 border-b last:border-b-0"
                >
                  <span className="font-semibold text-gray-600 dark:text-gray-400">
                    {column.header}
                  </span>
                  <div className="text-right text-gray-900 dark:text-gray-100">
                    {column.cell({ row: { original: row } })}
                  </div>
                </div>
              ))}

            {actionColumn && (
              <div className="flex justify-between items-center pt-2 mt-2 ">
                <span className="font-semibold text-gray-600 dark:text-gray-400">
                  {"Actions"}
                </span>
                {actionColumn.cell({ row: { original: row } })}
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="text-center text-gray-500 py-10">
          {t("No results.")}
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex-1 text-sm text-muted-foreground">
          {t("Showing")} {pagination.pageIndex + 1} {t("of")} {totalPages}{" "}
          {t("pages")}.
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="cursor-pointer rounded-lg px-4 py-2 border bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                pageIndex: prev.pageIndex - 1,
              }))
            }
            disabled={pagination.pageIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            className="cursor-pointer rounded-lg px-4 py-2 border bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                pageIndex: prev.pageIndex + 1,
              }))
            }
            disabled={pagination.pageIndex >= totalPages - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
// import React from "react";
// import { useTranslation } from "react-i18next";
// import { Column, CellProps } from "./GenericTable";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// interface MobileTableProps<T> {
//   data: T[];
//   columns: Column<T>[];
//   globalFilter: string;
//   setGlobalFilter: (filter: string) => void;
//   // Passing all controls for filtering, sorting and pagination
//   sorting: {
//     id: string | null;
//     direction: "asc" | "desc" | null;
//   };
//   handleSort: (columnId: string) => void;
//   pagination: {
//     pageIndex: number;
//     pageSize: number;
//   };
//   setPagination: React.Dispatch<
//     React.SetStateAction<{
//       pageIndex: number;
//       pageSize: number;
//     }>
//   >;
//   totalPages: number;
// }

// export const MobileTable = <T extends Record<string, any>>({
//   data,
//   columns,
//   globalFilter,
//   setGlobalFilter,
//   pagination,
//   setPagination,
//   totalPages,
// }: MobileTableProps<T>) => {
//   const { t } = useTranslation();

//   // Find the 'status' column and the 'actions' column
//   const statusColumn = columns.find(
//     (col) =>
//       col.accessorKey === "status" || col.header.toLowerCase() === "status"
//   );
//   const actionColumn = columns.find((col) => col.accessorKey === "actions");

//   return (
//     <div className="p-4 space-y-4">
//       <div className="relative">
//         <svg
//           xmlns="http://www.w3.org/2000/svg"
//           width="24"
//           height="24"
//           viewBox="0 0 24 24"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth="2"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           className="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
//         >
//           <circle cx="11" cy="11" r="8" />
//           <path d="m21 21-4.3-4.3" />
//         </svg>
//         <input
//           type="text"
//           placeholder={t("Filter items...")}
//           value={globalFilter}
//           onChange={(e) => setGlobalFilter(e.target.value)}
//           className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />
//       </div>

//       {data.length > 0 ? (
//         data.map((row, rowIndex) => (
//           <div
//             key={rowIndex}
//             className="rounded-xl border shadow-lg p-4 bg-white dark:bg-gray-800/70"
//           >
//             {/* Display status at the top */}
//             {statusColumn && (
//               <div className="flex justify-between items-center pb-2 mb-2 border-b border-gray-200 dark:border-gray-700">
//                 <span className="font-semibold text-gray-600 dark:text-gray-400">
//                   {statusColumn.header}
//                 </span>
//                 <div className="text-right text-gray-900 dark:text-gray-100">
//                   {statusColumn.cell({ row: { original: row } })}
//                 </div>
//               </div>
//             )}

//             {/* Display other columns */}
//             {columns
//               .filter(
//                 (c) => c.accessorKey !== "actions" && c.accessorKey !== "status"
//               )
//               .map((column, colIndex) => (
//                 <div
//                   key={colIndex}
//                   className="flex justify-between items-center py-2 border-b last:border-b-0"
//                 >
//                   <span className="font-semibold text-gray-600 dark:text-gray-400">
//                     {column.header}
//                   </span>
//                   <div className="text-right text-gray-900 dark:text-gray-100">
//                     {column.cell({ row: { original: row } })}
//                   </div>
//                 </div>
//               ))}

//             {/* Display actions at the bottom */}
//             {actionColumn && (
//               <div className="flex justify-between items-center pt-2 mt-2 ">
//                 <span className="font-semibold text-gray-600 dark:text-gray-400">
//                   {"Actions"}
//                 </span>
//                 {actionColumn.cell({ row: { original: row } })}
//               </div>
//             )}
//           </div>
//         ))
//       ) : (
//         <div className="text-center text-gray-500 py-10">
//           {t("No results.")}
//         </div>
//       )}

//       {/* Pagination controls */}
//       <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-gray-700">
//         <div className="flex-1 text-sm text-muted-foreground">
//           {t("Showing")} {pagination.pageIndex + 1} {t("of")} {totalPages}{" "}
//           {t("pages")}.
//         </div>
//         <div className="flex items-center space-x-2">
//           <button
//             className="cursor-pointer rounded-lg px-4 py-2 border bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
//             onClick={() =>
//               setPagination((prev) => ({
//                 ...prev,
//                 pageIndex: prev.pageIndex - 1,
//               }))
//             }
//             disabled={pagination.pageIndex === 0}
//           >
//             <ChevronLeft className="h-4 w-4" />
//           </button>
//           <button
//             className="cursor-pointer rounded-lg px-4 py-2 border bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
//             onClick={() =>
//               setPagination((prev) => ({
//                 ...prev,
//                 pageIndex: prev.pageIndex + 1,
//               }))
//             }
//             disabled={pagination.pageIndex >= totalPages - 1}
//           >
//             <ChevronRight className="h-4 w-4" />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };
