import React from "react";

export interface CellProps<T> {
  row: {
    original: T;
  };
}

export interface Column<T> {
  accessorKey: keyof T | "actions" | string;
  header: string;
  cell: (props: CellProps<T>) => React.ReactNode;
  editableCell?: (
    props: CellProps<T>,
    onUpdate: (accessorKey: keyof T | string, value: any) => void
  ) => React.ReactNode;
  enableHiding?: boolean;
  defaultWidth?: number;
}

export type RowDensity = "normal" | "compact" | "spacious";

export interface SortingState {
  id: string | null;
  direction: "asc" | "desc" | null;
}

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}
