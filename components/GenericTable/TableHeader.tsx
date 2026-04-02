import React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Column, SortingState } from "./types";

interface TableHeaderProps<T> {
  columns: Column<T>[];
  columnVisibility: Record<string, boolean>;
  columnWidths: Record<string, number>;
  sorting: SortingState;
  handleSort: (columnId: string) => void;
  resizeState: {
    isResizing: boolean;
    columnId: string | null;
  };
  handleMouseDown: (e: React.MouseEvent, accessorKey: string) => void;
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
}

export const TableHeader = <T extends Record<string, any>>({
  columns,
  columnVisibility,
  columnWidths,
  sorting,
  handleSort,
  resizeState,
  handleMouseDown,
  tableContainerRef,
}: TableHeaderProps<T>) => {
  const renderSortIcon = (columnId: string): React.ReactNode => {
    if (sorting.id === columnId) {
      return sorting.direction === "asc" ? (
        <ArrowUp className="h-4 w-4 text-blue-500" />
      ) : (
        <ArrowDown className="h-4 w-4 text-blue-500" />
      );
    }
    return <ArrowUpDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />;
  };

  return (
    <thead className="sticky top-0 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-md z-20 shadow-sm">
      <tr>
        {columns
          .filter((c) => columnVisibility[c.accessorKey as string])
          .map((column, index) => (
            <th
              key={index}
              className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 relative group transition-colors"
              style={{
                width: columnWidths[column.accessorKey as string],
              }}
            >
              <div className="flex items-center gap-1.5 whitespace-nowrap overflow-hidden text-ellipsis">
                {column.accessorKey === "actions" ? (
                  <span>{column.header}</span>
                ) : (
                  <button
                    onClick={() => handleSort(column.accessorKey as string)}
                    className="flex items-center gap-1.5 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                  >
                    <span>{column.header}</span>
                    {renderSortIcon(column.accessorKey as string)}
                  </button>
                )}
              </div>

              {/* Resizer */}
              <div
                onMouseDown={(e) => handleMouseDown(e, column.accessorKey as string)}
                className={`absolute top-0 right-0 h-full cursor-col-resize z-30 transition-all duration-100 ${
                  resizeState.isResizing && resizeState.columnId === column.accessorKey
                    ? "w-1 bg-transparent"
                    : "w-2 bg-transparent hover:bg-blue-400/30 dark:hover:bg-blue-400/20"
                }`}
                style={{ width: "10px" }}
              >
                {!(resizeState.isResizing && resizeState.columnId === column.accessorKey) && (
                  <div className="absolute top-0 right-0 h-full w-[1px] bg-gray-200 dark:bg-gray-700 group-hover:bg-blue-400 transition-all duration-200" />
                )}
              </div>

              {/* Active Resize Line */}
              {resizeState.isResizing && resizeState.columnId === column.accessorKey && (
                <div
                  className="absolute top-0 right-0 w-0.5 bg-blue-500 dark:bg-blue-400 z-40 pointer-events-none shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                  style={{
                    height: `${tableContainerRef.current?.scrollHeight || 100}px`,
                    transform: `translateX(50%)`,
                  }}
                />
              )}
            </th>
          ))}
      </tr>
    </thead>
  );
};
