import React from "react";
import { Search, Save, X, Pencil, Minimize, Maximize, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DateFilter } from "./smallCompoennts/DateFilter";
import { ColumnControls } from "./ColumnControls";
import { DensityMenu } from "./DensityMenu";
import { Column, RowDensity } from "./types";

interface ToolbarProps<T> {
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  setPageIndex: (index: number) => void;
  editable?: boolean;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  handleSave: () => void;
  handleCancel: () => void;
  columns: Column<T>[];
  setDateFilter: (filter: string) => void;
  columnVisibility: Record<string, boolean>;
  setColumnVisibility: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  rowDensity: RowDensity;
  setRowDensity: (density: RowDensity) => void;
  isFullScreen: boolean;
  toggleFullScreen: () => void;
  handleExport: () => void;
}

export const Toolbar = <T extends Record<string, any>>({
  globalFilter,
  setGlobalFilter,
  setPageIndex,
  editable,
  isEditing,
  setIsEditing,
  handleSave,
  handleCancel,
  columns,
  setDateFilter,
  columnVisibility,
  setColumnVisibility,
  rowDensity,
  setRowDensity,
  isFullScreen,
  toggleFullScreen,
  handleExport,
}: ToolbarProps<T>) => {
  const { t } = useTranslation();

  return (
    <div className="relative z-30 flex flex-col md:flex-row gap-4 py-4 px-4 justify-between items-center border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-card/50 backdrop-blur-sm rounded-t-2xl">
      <div className="relative flex-1 w-full md:w-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
        <input
          type="text"
          placeholder={t("Filter items...")}
          value={globalFilter}
          onChange={(e) => {
            setGlobalFilter(e.target.value);
            setPageIndex(0);
          }}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm shadow-sm"
        />
      </div>
      <div className="flex gap-2 items-center w-full md:w-auto justify-end">
        {editable && (
          <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800/50 p-1 rounded-lg border border-gray-100 dark:border-gray-700">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="p-1.5 rounded-md flex items-center hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 transition-colors"
                  title={t("Save")}
                >
                  <Save className="h-4 w-4" />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-1.5 rounded-md flex items-center hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition-colors"
                  title={t("Cancel")}
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 rounded-md flex items-center hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                title={t("Edit")}
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
        
        {columns.some((col) => col.accessorKey === "date") && (
          <DateFilter onDateFilterChange={setDateFilter} />
        )}

        <div className="flex items-center gap-2">
          <ColumnControls
            columns={columns}
            columnVisibility={columnVisibility}
            setColumnVisibility={setColumnVisibility}
          />
          
          <DensityMenu
            rowDensity={rowDensity}
            setRowDensity={setRowDensity}
          />

          <button
            onClick={toggleFullScreen}
            className="p-2 border rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={isFullScreen ? t("Exit Full Screen") : t("Full Screen")}
          >
            {isFullScreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </button>

          <button
            onClick={handleExport}
            className="p-2 border rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={t("Download Table as CSV")}
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
