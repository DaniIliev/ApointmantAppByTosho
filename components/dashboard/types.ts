export type ChartType = "line" | "bar" | "column" | "pie" | "linebar" | "hbar";
export type DashboardItemType = ChartType | "kpi";

export interface GridLayoutConfig {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ResponsiveLayout {
  desktop?: GridLayoutConfig;
  mobile?: GridLayoutConfig;
}

export interface KPIConfig {
  id: string;
  type: "kpi";
  kpiType:
    | "totalAppointments"
    | "totalRevenue"
    | "completedAppointments"
    | "cancelledAppointments"
    | "averageServicePrice"
    | "clientRetentionRate"
    | "newClientsAcquired";
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: "increase" | "decrease" | "neutral";
  };
  icon?: React.ReactNode;
  configuration?: {
    staffId?: string;
    locationId?: string;
  };
  layout?: GridLayoutConfig;
  responsiveLayout?: ResponsiveLayout;
}

export interface ChartConfig {
  id: string;
  title: string;
  type: ChartType;
  dataKey?: string;
  dataKeys?: string[];
  xAxisKey?: string;
  colors?: string[];
  data?: Record<string, unknown>[];
  configuration?: {
    dataSource: string;
    timeRange?: string;
    appointmentFilter?: string;
    staffFilter?: string;
    clientsFilter?: string;
    metric?: string;
    dimension?: string;
    groupBy?: "day" | "week" | "month";
    staffId?: string;
    serviceId?: string;
    status?: string;
    from?: string;
    to?: string;
    locationId?: string;
    // LineBar specific: compare current vs previous week
    compareWeeks?: boolean;
  };
  seriesConfig?: {
    barSeries?: string[];
    lineSeries?: string[];
  };
  layout?: GridLayoutConfig;
  responsiveLayout?: ResponsiveLayout;
}

export type DashboardItem = ChartConfig | KPIConfig;

export interface GridLayout {
  x: number;
  y: number;
  w: number;
  h: number;
  i: string;
  static?: boolean;
}

export interface MockChartData {
  name: string;
  revenue?: number;
  appointments?: number;
  completed?: number;
  cancelled?: number;
  newClients?: number;
  [key: string]: string | number | undefined;
}
