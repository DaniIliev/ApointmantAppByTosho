declare module "react-grid-layout" {
  import type React from "react";

  export interface Layout {
    x: number;
    y: number;
    w: number;
    h: number;
    i: string;
    static?: boolean;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
    moved?: boolean;
  }

  export interface GridLayoutProps {
    className?: string;
    layout: Layout[];
    onLayoutChange?: (newLayout: Layout[]) => void;
    width?: number;
    rowHeight?: number;
    cols?: number;
    compactType?: "vertical" | "horizontal" | null;
    preventCollision?: boolean;
    isResizable?: boolean;
    isDraggable?: boolean;
    useCSSTransforms?: boolean;
    containerPadding?: [number, number];
    margin?: [number, number];
    draggableHandle?: string;
    children?: React.ReactNode;
  }

  const GridLayout: React.ComponentType<
    React.PropsWithChildren<GridLayoutProps>
  >;
  export default GridLayout;
}

declare module "react-resizable" {
  export interface ResizeCallbackData {
    node: HTMLElement;
    size: { width: number; height: number };
    handle: string;
  }
  export interface DragCallbackData {
    node: HTMLElement;
    x: number;
    y: number;
    deltaX: number;
    deltaY: number;
    lastX: number;
    lastY: number;
  }
}
