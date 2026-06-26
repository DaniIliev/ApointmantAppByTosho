"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MobileTable } from "./MobileTable";

// Internal Components
import { Toolbar } from "./Toolbar";
import { TableHeader } from "./TableHeader";
import { TablePagination } from "./TablePagination";

// Types and Utils
import { RowDensity, SortingState, PaginationState, Column } from "./types";
import { exportToCsv } from "./utils";

export type { CellProps, Column } from "./types";

interface GenericTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onOpenViewModal?: (item: T) => void;
  editable?: boolean;
  onSave?: (updatedData: T[]) => void;
  renderRowDetails?: (
    item: T,
    columns: Column<T>[],
    columnVisibility: Record<string, boolean>,
    columnWidths: Record<string, number>,
  ) => React.ReactNode;
  isAccordionRow?: (item: T) => boolean;
  renderAccordionHeader?: (item: T) => React.ReactNode;
}

export const GenericTable = <T extends Record<string, any>>({
  data,
  columns,
  onOpenViewModal,
  editable,
  onSave,
  renderRowDetails,
  isAccordionRow,
  renderAccordionHeader,
}: GenericTableProps<T>) => {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [sorting, setSorting] = useState<SortingState>({
    id: null,
    direction: null,
  });
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >(columns.reduce((acc, col) => ({ ...acc, [col.accessorKey]: true }), {}));
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowDensity, setRowDensity] = useState<RowDensity>("compact");
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tempData, setTempData] = useState<T[]>(data);
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
    columns.reduce(
      (acc, col) => ({
        ...acc,
        [col.accessorKey as string]: col.defaultWidth || 150,
      }),
      {},
    ),
  );

  const tableRef = useRef<HTMLTableElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const [resizeState, setResizeState] = useState<{
    isResizing: boolean;
    startX: number;
    startWidth: number;
    columnId: string | null;
  }>({
    isResizing: false,
    startX: 0,
    startWidth: 0,
    columnId: null,
  });

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    const handleFullScreenChange = () =>
      setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
  }, []);

  useEffect(() => {
    setTempData(data);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [data, globalFilter, dateFilter, sorting.id, sorting.direction]);

  const toggleFullScreen = () => {
    if (!isFullScreen) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable fullscreen mode: ${err.message}`,
        );
      });
    } else {
      document.exitFullscreen();
    }
  };

  const getFilteredData = () => {
    let tempFilteredData = data;

    if (dateFilter !== "all") {
      tempFilteredData = tempFilteredData.filter((item) => {
        const dateValue = item.date as string;
        if (!dateValue) return false;

        const itemDate = new Date(dateValue);
        itemDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(today.getDate() - today.getDay());

        const nextWeekStart = new Date(thisWeekStart);
        nextWeekStart.setDate(thisWeekStart.getDate() + 7);

        const thisMonthStart = new Date(
          today.getFullYear(),
          today.getMonth(),
          1,
        );
        const nextMonthStart = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          1,
        );

        switch (dateFilter) {
          case "today":
            return itemDate.getTime() === today.getTime();
          case "tomorrow":
            return itemDate.getTime() === tomorrow.getTime();
          case "this_week":
            return itemDate >= thisWeekStart && itemDate < nextWeekStart;
          case "next_week":
            return (
              itemDate >= nextWeekStart &&
              itemDate <
                new Date(
                  nextWeekStart.getFullYear(),
                  nextWeekStart.getMonth(),
                  nextWeekStart.getDate() + 7,
                )
            );
          case "this_month":
            return (
              itemDate.getMonth() === thisMonthStart.getMonth() &&
              itemDate.getFullYear() === thisMonthStart.getFullYear()
            );
          case "next_month":
            return (
              itemDate.getMonth() === nextMonthStart.getMonth() &&
              itemDate.getFullYear() === nextMonthStart.getFullYear()
            );
          case "future":
            return itemDate.getTime() >= nextMonthStart.getTime();
          default:
            return true;
        }
      });
    }

    if (globalFilter) {
      tempFilteredData = tempFilteredData.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(globalFilter.toLowerCase()),
        ),
      );
    }
    return tempFilteredData;
  };

  const filteredData = getFilteredData();

  const sortedData = [...filteredData].sort((a, b) => {
    const { id, direction } = sorting;
    if (!id || !direction) return 0;
    const aValue = a[id as keyof T];
    const bValue = b[id as keyof T];

    if (aValue === undefined || bValue === undefined) return 0;
    if (aValue < bValue) return direction === "asc" ? -1 : 1;
    if (aValue > bValue) return direction === "asc" ? 1 : -1;
    return 0;
  });

  const paginatedData = sortedData.slice(
    pagination.pageIndex * pagination.pageSize,
    (pagination.pageIndex + 1) * pagination.pageSize,
  );

  const getRowClass = (): string => {
    switch (rowDensity) {
      case "compact":
        return "h-11";
      case "spacious":
        return "h-20";
      default:
        return "h-14";
    }
  };

  const getCellClass = (): string => {
    switch (rowDensity) {
      case "compact":
        return "py-2.5";
      case "spacious":
        return "py-6";
      default:
        return "py-4";
    }
  };

  const handleExport = (): void => {
    const headers = columns
      .map((col) => col.header)
      .filter((h) => h !== "Actions");
    exportToCsv(sortedData, headers, "appointments");
  };

  const totalPages = Math.ceil(filteredData.length / pagination.pageSize);

  const handleSort = (columnId: string): void => {
    setSorting((prev) => {
      if (prev.id === columnId) {
        if (prev.direction === "asc")
          return { id: columnId, direction: "desc" };
        if (prev.direction === "desc") return { id: null, direction: null };
      }
      return { id: columnId, direction: "asc" };
    });
  };

  const handleUpdate = (
    rowIndex: number,
    accessorKey: keyof T | string,
    value: any,
  ) => {
    setTempData((prev) =>
      prev.map((row, index) =>
        index === rowIndex ? { ...row, [accessorKey]: value } : row,
      ),
    );
  };

  const handleSave = () => {
    if (onSave) onSave(tempData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempData(data);
    setIsEditing(false);
  };

  const handleMouseDown = (e: React.MouseEvent, accessorKey: string) => {
    e.preventDefault();
    setResizeState({
      isResizing: true,
      startX: e.clientX,
      startWidth: columnWidths[accessorKey],
      columnId: accessorKey,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeState.isResizing || !resizeState.columnId) return;
      const newWidth =
        resizeState.startWidth + (e.clientX - resizeState.startX);
      if (newWidth > 50) {
        setColumnWidths((prev) => ({
          ...prev,
          [resizeState.columnId!]: newWidth,
        }));
      }
    };

    const handleMouseUp = () => {
      if (resizeState.isResizing) {
        setResizeState({
          isResizing: false,
          startX: 0,
          startWidth: 0,
          columnId: null,
        });
      }
    };

    if (resizeState.isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "default";
    };
  }, [resizeState]);

  if (isMobile) {
    return (
      <MobileTable
        data={paginatedData}
        columns={columns}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        sorting={sorting}
        handleSort={handleSort}
        pagination={pagination}
        setPagination={setPagination}
        totalPages={totalPages}
        isAccordionRow={isAccordionRow}
        renderAccordionHeader={renderAccordionHeader}
        renderRowDetails={renderRowDetails}
      />
    );
  }

  return (
    <div
      className={`p-0 transition-all duration-500 ${isFullScreen ? "fixed inset-0 z-[100] bg-white dark:bg-gray-950 overflow-auto" : ""}`}
    >
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl bg-white dark:bg-card/30 backdrop-blur-xl flex flex-col h-full">
        <Toolbar
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          setPageIndex={(index) =>
            setPagination((p) => ({ ...p, pageIndex: index }))
          }
          editable={editable}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          handleSave={handleSave}
          handleCancel={handleCancel}
          columns={columns}
          setDateFilter={setDateFilter}
          columnVisibility={columnVisibility}
          setColumnVisibility={setColumnVisibility}
          rowDensity={rowDensity}
          setRowDensity={setRowDensity}
          isFullScreen={isFullScreen}
          toggleFullScreen={toggleFullScreen}
          handleExport={handleExport}
        />

        <div
          className="flex-1 overflow-x-auto custom-scrollbar"
          ref={tableContainerRef}
        >
          <table
            className="w-full text-left table-fixed border-collapse"
            ref={tableRef}
          >
            <TableHeader
              columns={columns}
              columnVisibility={columnVisibility}
              columnWidths={columnWidths}
              sorting={sorting}
              handleSort={handleSort}
              resizeState={resizeState}
              handleMouseDown={handleMouseDown}
              tableContainerRef={tableContainerRef}
            />
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {paginatedData.length ? (
                paginatedData.map((row, rowIndex) => {
                  const sortedRow =
                    sortedData[
                      pagination.pageIndex * pagination.pageSize + rowIndex
                    ];
                  const originalIndex = tempData.findIndex(
                    (item) => item === sortedRow,
                  );
                  const canExpandRow =
                    !!renderRowDetails &&
                    (isAccordionRow ? isAccordionRow(row) : true);

                  return (
                    <React.Fragment key={rowIndex}>
                      <tr
                        className={`group border-b border-gray-100 dark:border-gray-800/50 hover:bg-blue-50/30 dark:hover:bg-blue-900/5 transition-all duration-200 ${getRowClass()} ${canExpandRow && expandedRows[rowIndex] ? "bg-blue-50/20 dark:bg-blue-900/10" : ""}`}
                      >
                        {columns
                          .filter(
                            (c) => columnVisibility[c.accessorKey as string],
                          )
                          .map((column, colIndex) => (
                            <td
                              key={colIndex}
                              className={`px-4 ${getCellClass()} text-sm text-gray-600 dark:text-gray-300 relative`}
                              style={{
                                width:
                                  columnWidths[column.accessorKey as string],
                              }}
                              onClick={() =>
                                canExpandRow &&
                                setExpandedRows((prev) => ({
                                  ...prev,
                                  [rowIndex]: !prev[rowIndex],
                                }))
                              }
                            >
                              <div className="flex items-center gap-3">
                                {colIndex === 0 && canExpandRow && (
                                  <div className="cursor-pointer text-primary hover:scale-110 transition-transform">
                                    {expandedRows[rowIndex] ? (
                                      <ChevronDown size={14} />
                                    ) : (
                                      <ChevronRight size={14} />
                                    )}
                                  </div>
                                )}
                                <div className="truncate flex-1">
                                  {isEditing && column.editableCell
                                    ? column.editableCell(
                                        { row: { original: row } },
                                        (accessorKey, value) =>
                                          handleUpdate(
                                            originalIndex !== -1
                                              ? originalIndex
                                              : rowIndex,
                                            accessorKey,
                                            value,
                                          ),
                                      )
                                    : column.cell({ row: { original: row } })}
                                </div>
                              </div>
                            </td>
                          ))}
                      </tr>
                      {canExpandRow && expandedRows[rowIndex] && (
                        <tr className="bg-gray-50/50 dark:bg-gray-900/30 animate-in fade-in slide-in-from-top-1 duration-300 border-b border-gray-100 dark:border-gray-800">
                          <td
                            colSpan={
                              columns.filter(
                                (c) =>
                                  columnVisibility[c.accessorKey as string],
                              ).length
                            }
                            className="p-0"
                          >
                            {renderRowDetails(
                              row,
                              columns,
                              columnVisibility,
                              columnWidths,
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="h-40 text-center text-gray-400 dark:text-gray-500 italic"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <svg
                        className="w-10 h-10 mb-2 opacity-20"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      {t("No results.")}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          pagination={pagination}
          setPagination={setPagination}
          totalResults={filteredData.length}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
};
