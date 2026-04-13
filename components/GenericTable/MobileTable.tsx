import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Column } from "./types";
import { ChevronDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { DateFilter } from "./smallCompoennts/DateFilter";
import { motion, AnimatePresence } from "framer-motion";

export interface MobileTableProps<T> {
  data: T[];
  columns: Column<T>[];
  globalFilter: string;
  setGlobalFilter: (filter: string) => void;
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
  isAccordionRow?: (item: T) => boolean;
  renderAccordionHeader?: (item: T) => React.ReactNode;
  renderRowDetails?: (
    item: T,
    columns: Column<T>[],
    columnVisibility: Record<string, boolean>,
    columnWidths: Record<string, number>
  ) => React.ReactNode;
}

const MobileRowCard = <T extends Record<string, any>>({
  row,
  columns,
  statusColumn,
  actionColumn,
}: {
  row: T;
  columns: Column<T>[];
  statusColumn?: Column<T>;
  actionColumn?: Column<T>;
}) => {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl border shadow-lg p-4 bg-white dark:bg-gray-800/70">
      {statusColumn && (
        <div className="flex justify-between items-center pb-2 mb-2 border-b border-gray-200 dark:border-gray-700">
          <span className="font-semibold text-gray-600 dark:text-gray-400">
            {statusColumn.header}
          </span>
          <div className="flex justify-end text-right text-gray-900 dark:text-gray-100">
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
            <div className="flex justify-end text-right text-gray-900 dark:text-gray-100">
              {column.cell({ row: { original: row } })}
            </div>
          </div>
        ))}

      {actionColumn && (
        <div className="flex justify-between items-center pt-2 mt-2 ">
          <span className="font-semibold text-gray-600 dark:text-gray-400">
            {t("Actions")}
          </span>
          {actionColumn.cell({ row: { original: row } })}
        </div>
      )}
    </div>
  );
};

export const MobileTable = <T extends Record<string, any>>({
  data,
  columns,
  globalFilter,
  setGlobalFilter,
  dateFilter,
  setDateFilter,
  pagination,
  setPagination,
  totalPages,
  isAccordionRow,
  renderAccordionHeader,
  renderRowDetails,
}: MobileTableProps<T>) => {
  const { t } = useTranslation();
  const [expandedAccordions, setExpandedAccordions] = useState<Record<number, boolean>>({});

  const statusColumn = columns.find(
    (col) =>
      col.accessorKey === "status" || col.header.toLowerCase() === "status"
  );
  const actionColumn = columns.find((col) => col.accessorKey === "actions");

  const toggleAccordion = (index: number) => {
    setExpandedAccordions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

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
        data.map((row, rowIndex) => {
          const isAccordion = isAccordionRow?.(row);
          const isExpanded = expandedAccordions[rowIndex];

          if (isAccordion) {
            return (
              <div
                key={rowIndex}
                className="rounded-xl border shadow-lg overflow-hidden bg-white dark:bg-gray-800/70"
              >
                <div
                  onClick={() => toggleAccordion(rowIndex)}
                  className="p-4 cursor-pointer flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex-1">
                    {renderAccordionHeader?.(row)}
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="ml-2 text-gray-400"
                  >
                    <ChevronDown className="h-5 w-5" />
                  </motion.div>
                </div>
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/30 border-t">
                        {renderRowDetails?.(row, columns, {}, {})}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }

          return (
            <MobileRowCard
              key={rowIndex}
              row={row}
              columns={columns}
              statusColumn={statusColumn}
              actionColumn={actionColumn}
            />
          );
        })
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

