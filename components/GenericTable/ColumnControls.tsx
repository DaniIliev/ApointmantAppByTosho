import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Column } from "./types";
import { Columns3 } from "lucide-react";

interface ColumnControlsProps<T> {
  columns: Column<T>[];
  columnVisibility: Record<string, boolean>;
  setColumnVisibility: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export const ColumnControls = <T extends Record<string, any>>({
  columns,
  columnVisibility,
  setColumnVisibility,
}: ColumnControlsProps<T>) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleHideAllColumns = (): void => {
    const newVisibility: Record<string, boolean> = {};
    columns.forEach((col) => {
      newVisibility[col.accessorKey as string] = false;
    });
    setColumnVisibility(newVisibility);
  };

  const handleShowAllColumns = (): void => {
    const newVisibility: Record<string, boolean> = {};
    columns.forEach((col) => {
      newVisibility[col.accessorKey as string] = true;
    });
    setColumnVisibility(newVisibility);
  };

  const toggleColumn = (accessorKey: string) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [accessorKey]: !prev[accessorKey],
    }));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="p-2 border rounded-lg flex items-center bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        title={t("Columns")}
      >
        <Columns3  className="h-4 w-4"/>
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 p-4 rounded-xl border shadow-xl bg-white dark:bg-gray-800/95 backdrop-blur-md z-100 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex justify-between mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
            <button
              onClick={handleHideAllColumns}
              className="text-xs font-semibold text-blue-500 hover:text-blue-600 transition-colors"
            >
              {t("Hide all")}
            </button>
            <button
              onClick={handleShowAllColumns}
              className="text-xs font-semibold text-blue-500 hover:text-blue-600 transition-colors"
            >
              {t("Show all")}
            </button>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto px-1">
            {columns
              .filter((c) => c.accessorKey !== "actions")
              .map((column, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between group cursor-pointer"
                  onClick={() => toggleColumn(column.accessorKey as string)}
                >
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                    {column.header}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={columnVisibility[column.accessorKey as string] !== false}
                      onChange={() => toggleColumn(column.accessorKey as string)}
                    />
                    <div className="w-10 h-5 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
