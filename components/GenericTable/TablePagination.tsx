import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PaginationState } from "./types";

interface TablePaginationProps {
  pagination: PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  totalResults: number;
  totalPages: number;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  pagination,
  setPagination,
  totalResults,
  totalPages,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30 rounded-b-2xl">
      <div className="flex-1 text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-0">
        {t("Showing")} <span className="font-semibold text-gray-900 dark:text-gray-100">{pagination.pageIndex * pagination.pageSize + 1}</span> -{" "}
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          {Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalResults)}
        </span>{" "}
        {t("of")} <span className="font-semibold text-gray-900 dark:text-gray-100">{totalResults}</span> {t("results")}.
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative group">
          <select
            value={`${pagination.pageSize}`}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setPagination((prev) => ({
                ...prev,
                pageSize: Number(e.target.value),
                pageIndex: 0,
              }));
            }}
            className="appearance-none pl-4 pr-10 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
          >
            {[5, 10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={`${pageSize}`}>
                {pageSize} {t("per page")}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 group-hover:text-blue-500 transition-colors">
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
          <button
            className="p-1.5 cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-gray-600 dark:text-gray-300"
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                pageIndex: prev.pageIndex - 1,
              }))
            }
            disabled={pagination.pageIndex === 0}
            title={t("Previous Page")}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="h-4 w-[1px] bg-gray-200 dark:bg-gray-700 mx-1" />
          <button
            className="p-1.5 cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-gray-600 dark:text-gray-300"
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                pageIndex: prev.pageIndex + 1,
              }))
            }
            disabled={pagination.pageIndex >= totalPages - 1}
            title={t("Next Page")}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
