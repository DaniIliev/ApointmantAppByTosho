import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Download,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { MobileTable } from "./MobileTable"; // Import the new mobile component
import { DateFilter } from "./smallCompoennts/DateFilter";

export interface CellProps<T> {
  row: {
    original: T;
  };
}

export interface Column<T> {
  accessorKey: keyof T | "actions";
  header: string;
  cell: (props: CellProps<T>) => React.ReactNode;
  enableHiding?: boolean;
}

interface GenericTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onOpenViewModal: (item: T) => void;
}

const exportToCsv = <T extends Record<string, any>>(
  data: T[],
  headers: string[],
  fileName: string
): void => {
  const csvContent = `${headers.join(",")}\n${data
    .map((e) =>
      headers
        .map((header) => {
          const value = e[header.toLowerCase().replace(/ /g, "")];
          return `"${(value?.toString() || "").replace(/"/g, '""')}"`;
        })
        .join(",")
    )
    .join("\n")}`;

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${fileName}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const GenericTable = <T extends Record<string, any>>({
  data,
  columns,
}: GenericTableProps<T>) => {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [sorting, setSorting] = useState<{
    id: string | null;
    direction: "asc" | "desc" | null;
  }>({ id: null, direction: null });
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >(columns.reduce((acc, col) => ({ ...acc, [col.accessorKey]: true }), {}));
  const [pagination, setPagination] = useState<{
    pageIndex: number;
    pageSize: number;
  }>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowDensity, setRowDensity] = useState<
    "normal" | "compact" | "spacious"
  >("normal");
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [isColumnsDropdownOpen, setIsColumnsDropdownOpen] =
    useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsColumnsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const toggleFullScreen = () => {
    if (!isFullScreen) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable fullscreen mode: ${err.message}`
        );
      });
    } else {
      document.exitFullscreen();
    }
  };

  // New filtering logic
  const getFilteredData = () => {
    const now = new Date();
    let tempFilteredData = data;

    // Filter by date first
    if (dateFilter !== "all") {
      tempFilteredData = tempFilteredData.filter((item) => {
        const dateValue = item.date as string; // Assuming 'date' is the accessorKey
        if (!dateValue) return false;

        const itemDate = new Date(dateValue);
        itemDate.setHours(0, 0, 0, 0); // Normalize date to avoid time issues

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
          1
        );

        const nextMonthStart = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          1
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
                  nextWeekStart.getDate() + 7
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
            return itemDate > nextMonthStart;
          default:
            return true;
        }
      });
    }

    // Apply global filter
    if (globalFilter) {
      tempFilteredData = tempFilteredData.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(globalFilter.toLowerCase())
        )
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
    (pagination.pageIndex + 1) * pagination.pageSize
  );

  const getRowClass = (): string => {
    switch (rowDensity) {
      case "compact":
        return "h-10";
      case "spacious":
        return "h-20";
      default:
        return "h-14";
    }
  };

  const getCellClass = (): string => {
    switch (rowDensity) {
      case "compact":
        return "py-2";
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
        if (prev.direction === "asc") {
          return { id: columnId, direction: "desc" };
        } else if (prev.direction === "desc") {
          return { id: null, direction: null };
        }
      }
      return { id: columnId, direction: "asc" };
    });
  };

  const renderSortIcon = (columnId: string): React.ReactNode => {
    if (sorting.id === columnId) {
      return sorting.direction === "asc" ? (
        <ArrowUp className="h-4 w-4" />
      ) : (
        <ArrowDown className="h-4 w-4" />
      );
    }
    return <ArrowUpDown className="h-4 w-4" />;
  };

  const handleToggleDensity = (): void => {
    const densities: ("normal" | "spacious" | "compact")[] = [
      "normal",
      "spacious",
      "compact",
    ];
    const currentIndex = densities.indexOf(rowDensity);
    const nextIndex = (currentIndex + 1) % densities.length;
    setRowDensity(densities[nextIndex]);
  };

  const DensityIcon = (): React.ReactNode => {
    if (rowDensity === "compact") {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-rows-3"
        >
          <path d="M22 21H2M22 15H2M22 9H2" />
        </svg>
      );
    } else if (rowDensity === "spacious") {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-rows-2"
        >
          <path d="M22 14H2M22 8H2" />
        </svg>
      );
    } else {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-rows-4"
        >
          <path d="M22 20H2M22 16H2M22 12H2M22 8H2" />
        </svg>
      );
    }
  };

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
      />
    );
  }

  return (
    <div
      className={`p-4 transition-all duration-300 ${
        isFullScreen
          ? "fixed inset-0 z-50 bg-white dark:bg-gray-900 overflow-auto"
          : ""
      }`}
    >
      <div className="rounded-xl border shadow-lg bg-white dark:bg-gray-800/70 backdrop-blur-lg border-primary/20">
        <div className="flex flex-col md:flex-row gap-4 py-3 px-4 justify-between items-center border-b border-gray-200 dark:border-gray-700">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder={t("Filter items...")}
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 items-center">
            {columns.some((col) => col.accessorKey === "date") && (
              <DateFilter onDateFilterChange={setDateFilter} />
            )}
            <div className="relative" ref={dropdownRef}>
              <button
                className="p-2 border rounded-lg flex items-center bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setIsColumnsDropdownOpen(!isColumnsDropdownOpen)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-columns-3"
                >
                  <path d="M12 21V3M18 21V3M6 21V3" />
                </svg>
              </button>
              {isColumnsDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 p-4 rounded-xl border shadow-lg bg-white dark:bg-gray-800/70 backdrop-blur-lg">
                  <div className="flex justify-between mb-2">
                    <button
                      onClick={handleHideAllColumns}
                      className="text-sm text-blue-500 hover:underline"
                    >
                      {t("Hide all")}
                    </button>
                    <button
                      onClick={handleShowAllColumns}
                      className="text-sm text-blue-500 hover:underline"
                    >
                      {t("Show all")}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {columns
                      .filter((c) => c.accessorKey !== "actions")
                      .map((column, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm font-medium">
                            {column.header}
                          </span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={
                                columnVisibility[
                                  column.accessorKey as string
                                ] !== false
                              }
                              onChange={() =>
                                setColumnVisibility((prev) => ({
                                  ...prev,
                                  [column.accessorKey as string]:
                                    !prev[column.accessorKey as string],
                                }))
                              }
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleToggleDensity}
              className="p-2 border rounded-lg flex items-center bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <DensityIcon />
            </button>
            <div className="relative group">
              <button
                onClick={toggleFullScreen}
                className="p-2 border rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {isFullScreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </button>
              <div className="absolute top-full mt-2 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2">
                {isFullScreen ? t("Exit Full Screen") : t("Full Screen")}
              </div>
            </div>
            <div className="relative group">
              <button
                onClick={handleExport}
                className="p-2 border rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Download className="h-4 w-4" />
              </button>
              <div className="absolute top-full mt-2 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2">
                {t("Download Table as CSV")}
              </div>
            </div>
          </div>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr>
              {columns
                .filter((c) => columnVisibility[c.accessorKey as string])
                .map((column, index) => (
                  <th
                    key={index}
                    className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 border-b"
                  >
                    {column.accessorKey === "actions" ? (
                      <span>{column.header}</span>
                    ) : (
                      <button
                        onClick={() => handleSort(column.accessorKey as string)}
                        className="flex items-center gap-1 cursor-pointer"
                      >
                        <span>{column.header}</span>
                        {renderSortIcon(column.accessorKey as string)}
                      </button>
                    )}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length ? (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`border-b hover:bg-gray-50 dark:hover:bg-gray-700 ${getRowClass()}`}
                >
                  {columns
                    .filter((c) => columnVisibility[c.accessorKey as string])
                    .map((column, colIndex) => (
                      <td
                        key={colIndex}
                        className={`px-4 ${getCellClass()}`}
                        data-label={column.header}
                      >
                        {column.cell({ row: { original: row } })}
                      </td>
                    ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {t("No results.")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex-1 text-sm text-muted-foreground">
            {t("Showing")} {pagination.pageIndex + 1} {t("of")} {totalPages}{" "}
            {t("pages")}.
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <select
                value={`${pagination.pageSize}`}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setPagination((prev) => ({
                    ...prev,
                    pageSize: Number(e.target.value),
                  }));
                }}
                className="w-[127px] px-4 py-2 border rounded-lg appearance-none bg-white dark:bg-gray-800 cursor-pointer"
              >
                {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                  <option key={pageSize} value={`${pageSize}`}>
                    {pageSize} {t("per page")}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
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
    </div>
  );
};
