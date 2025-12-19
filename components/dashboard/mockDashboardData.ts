"use client";

/**
 * SIMPLIFIED UNIFIED DATA STRUCTURE FOR DASHBOARD
 *
 * Structure:
 * - Single format for all data
 * - Time/filter sent to backend, returns data for that period
 * - No pre-built week/month/year - generated on demand
 * - Support for multiple dimensions (by service, by staff, by source, etc)
 * - Each response includes: date (ISO), label (for display), and metrics
 */

// Mock data generators - simulating backend API responses
// In production, these will be replaced with actual API calls

/**
 * Get appointments data for a specific time period
 * @param startDate - Start date (ISO format: YYYY-MM-DD)
 * @param endDate - End date (ISO format: YYYY-MM-DD)
 * @param groupBy - "day" | "week" | "month" (how to group the data)
 */
export const getAppointmentsTimeSeries = (
  startDate: string,
  endDate: string,
  groupBy: "day" | "week" | "month" = "day"
): Record<string, unknown>[] => {
  // Mock data for a week starting Monday
  if (groupBy === "day") {
    return [
      {
        date: "2025-12-08",
        label: "Mon",
        count: 12,
        completed: 10,
        cancelled: 2,
      },
      {
        date: "2025-12-09",
        label: "Tue",
        count: 15,
        completed: 14,
        cancelled: 1,
      },
      {
        date: "2025-12-10",
        label: "Wed",
        count: 18,
        completed: 17,
        cancelled: 1,
      },
      {
        date: "2025-12-11",
        label: "Thu",
        count: 20,
        completed: 19,
        cancelled: 1,
      },
      {
        date: "2025-12-12",
        label: "Fri",
        count: 22,
        completed: 20,
        cancelled: 2,
      },
      {
        date: "2025-12-13",
        label: "Sat",
        count: 25,
        completed: 23,
        cancelled: 2,
      },
      {
        date: "2025-12-14",
        label: "Sun",
        count: 8,
        completed: 8,
        cancelled: 0,
      },
    ];
  }

  if (groupBy === "week") {
    return [
      { date: "2025-12-01", label: "Week 1", count: 82, completed: 76 },
      { date: "2025-12-08", label: "Week 2", count: 95, completed: 88 },
      { date: "2025-12-15", label: "Week 3", count: 103, completed: 98 },
      { date: "2025-12-22", label: "Week 4", count: 89, completed: 84 },
    ];
  }

  return [
    { date: "2025-01-01", label: "Jan", count: 380, completed: 350 },
    { date: "2025-02-01", label: "Feb", count: 420, completed: 395 },
    { date: "2025-03-01", label: "Mar", count: 450, completed: 425 },
    { date: "2025-04-01", label: "Apr", count: 480, completed: 455 },
    { date: "2025-05-01", label: "May", count: 520, completed: 495 },
    { date: "2025-06-01", label: "Jun", count: 550, completed: 520 },
  ];
};

/**
 * Get appointments breakdown by service
 */
export const getAppointmentsByService = (): Record<string, unknown>[] => {
  return [
    { service: "Haircut", count: 85, revenue: 8500 },
    { service: "Coloring", count: 45, revenue: 9000 },
    { service: "Massage", count: 32, revenue: 4000 },
    { service: "Facial", count: 28, revenue: 3500 },
    { service: "Manicure", count: 15, revenue: 1500 },
  ];
};

/**
 * Get appointments for a specific staff member
 * Parameters are documented for backend integration even if unused in mock
 */
export const getAppointmentsByStaff = (
  staffId: string
): Record<string, unknown>[] => {
  const staffData: Record<string, Record<string, unknown>[]> = {
    Daniel: [
      { date: "2025-12-08", label: "Mon", count: 4 },
      { date: "2025-12-09", label: "Tue", count: 5 },
      { date: "2025-12-10", label: "Wed", count: 6 },
      { date: "2025-12-11", label: "Thu", count: 7 },
      { date: "2025-12-12", label: "Fri", count: 8 },
      { date: "2025-12-13", label: "Sat", count: 9 },
      { date: "2025-12-14", label: "Sun", count: 2 },
    ],
    Sarah: [
      { date: "2025-12-08", label: "Mon", count: 4 },
      { date: "2025-12-09", label: "Tue", count: 5 },
      { date: "2025-12-10", label: "Wed", count: 5 },
      { date: "2025-12-11", label: "Thu", count: 6 },
      { date: "2025-12-12", label: "Fri", count: 7 },
      { date: "2025-12-13", label: "Sat", count: 8 },
      { date: "2025-12-14", label: "Sun", count: 2 },
    ],
    John: [
      { date: "2025-12-08", label: "Mon", count: 2 },
      { date: "2025-12-09", label: "Tue", count: 3 },
      { date: "2025-12-10", label: "Wed", count: 4 },
      { date: "2025-12-11", label: "Thu", count: 4 },
      { date: "2025-12-12", label: "Fri", count: 4 },
      { date: "2025-12-13", label: "Sat", count: 5 },
      { date: "2025-12-14", label: "Sun", count: 2 },
    ],
    Emma: [
      { date: "2025-12-08", label: "Mon", count: 2 },
      { date: "2025-12-09", label: "Tue", count: 2 },
      { date: "2025-12-10", label: "Wed", count: 3 },
      { date: "2025-12-11", label: "Thu", count: 3 },
      { date: "2025-12-12", label: "Fri", count: 3 },
      { date: "2025-12-13", label: "Sat", count: 3 },
      { date: "2025-12-14", label: "Sun", count: 0 },
    ],
  };

  return staffData[staffId] || [];
};

/**
 * Get clients data for a specific time period
 */
export const getClientsTimeSeries = (
  startDate: string,
  endDate: string,
  groupBy: "day" | "week" | "month" = "day"
): Record<string, unknown>[] => {
  if (groupBy === "day") {
    return [
      { date: "2025-12-08", label: "Mon", new_clients: 2, total: 17 },
      { date: "2025-12-09", label: "Tue", new_clients: 3, total: 21 },
      { date: "2025-12-10", label: "Wed", new_clients: 4, total: 24 },
      { date: "2025-12-11", label: "Thu", new_clients: 2, total: 18 },
      { date: "2025-12-12", label: "Fri", new_clients: 5, total: 27 },
      { date: "2025-12-13", label: "Sat", new_clients: 6, total: 31 },
      { date: "2025-12-14", label: "Sun", new_clients: 1, total: 11 },
    ];
  }

  if (groupBy === "week") {
    return [
      { date: "2025-12-01", label: "Week 1", new_clients: 18 },
      { date: "2025-12-08", label: "Week 2", new_clients: 22 },
      { date: "2025-12-15", label: "Week 3", new_clients: 25 },
      { date: "2025-12-22", label: "Week 4", new_clients: 20 },
    ];
  }

  return [
    { date: "2025-01-01", label: "Jan", new_clients: 65 },
    { date: "2025-02-01", label: "Feb", new_clients: 78 },
    { date: "2025-03-01", label: "Mar", new_clients: 92 },
    { date: "2025-04-01", label: "Apr", new_clients: 85 },
    { date: "2025-05-01", label: "May", new_clients: 110 },
    { date: "2025-06-01", label: "Jun", new_clients: 125 },
  ];
};

/**
 * Get clients by source
 */
export const getClientsBySource = (): Record<string, unknown>[] => {
  return [
    { source: "Direct", count: 145 },
    { source: "Referral", count: 98 },
    { source: "Social Media", count: 87 },
    { source: "Google", count: 65 },
    { source: "Walk-in", count: 20 },
  ];
};

/**
 * Get staff performance metrics
 */
export const getStaffPerformance = (): Record<string, unknown>[] => {
  return [
    {
      name: "Daniel",
      appointments: 62,
      rating: 4.8,
      revenue: 8500,
      utilization: 95,
    },
    {
      name: "Sarah",
      appointments: 58,
      rating: 4.6,
      revenue: 7800,
      utilization: 90,
    },
    {
      name: "John",
      appointments: 35,
      rating: 4.5,
      revenue: 4200,
      utilization: 65,
    },
    {
      name: "Emma",
      appointments: 25,
      rating: 4.7,
      revenue: 2800,
      utilization: 48,
    },
  ];
};

/**
 * Get rating trends for a specific staff member
 * Parameters are documented for backend integration even if unused in mock
 */
export const getStaffRatings = (staffId: string): Record<string, unknown>[] => {
  const staffData: Record<string, Record<string, unknown>[]> = {
    Daniel: [
      { date: "2025-12-08", label: "Mon", rating: 4.7 },
      { date: "2025-12-09", label: "Tue", rating: 4.8 },
      { date: "2025-12-10", label: "Wed", rating: 4.9 },
      { date: "2025-12-11", label: "Thu", rating: 4.8 },
      { date: "2025-12-12", label: "Fri", rating: 4.8 },
      { date: "2025-12-13", label: "Sat", rating: 4.9 },
      { date: "2025-12-14", label: "Sun", rating: 4.8 },
    ],
    Sarah: [
      { date: "2025-12-08", label: "Mon", rating: 4.5 },
      { date: "2025-12-09", label: "Tue", rating: 4.6 },
      { date: "2025-12-10", label: "Wed", rating: 4.6 },
      { date: "2025-12-11", label: "Thu", rating: 4.7 },
      { date: "2025-12-12", label: "Fri", rating: 4.6 },
      { date: "2025-12-13", label: "Sat", rating: 4.6 },
      { date: "2025-12-14", label: "Sun", rating: 4.5 },
    ],
    John: [
      { date: "2025-12-08", label: "Mon", rating: 4.4 },
      { date: "2025-12-09", label: "Tue", rating: 4.5 },
      { date: "2025-12-10", label: "Wed", rating: 4.5 },
      { date: "2025-12-11", label: "Thu", rating: 4.5 },
      { date: "2025-12-12", label: "Fri", rating: 4.6 },
      { date: "2025-12-13", label: "Sat", rating: 4.5 },
      { date: "2025-12-14", label: "Sun", rating: 4.4 },
    ],
    Emma: [
      { date: "2025-12-08", label: "Mon", rating: 4.6 },
      { date: "2025-12-09", label: "Tue", rating: 4.7 },
      { date: "2025-12-10", label: "Wed", rating: 4.8 },
      { date: "2025-12-11", label: "Thu", rating: 4.7 },
      { date: "2025-12-12", label: "Fri", rating: 4.7 },
      { date: "2025-12-13", label: "Sat", rating: 4.8 },
      { date: "2025-12-14", label: "Sun", rating: 4.6 },
    ],
  };

  return staffData[staffId] || [];
};

/**
 * Get revenue data for a specific time period
 */
export const getRevenueTimeSeries = (
  startDate: string,
  endDate: string,
  groupBy: "day" | "week" | "month" = "day"
): Record<string, unknown>[] => {
  if (groupBy === "day") {
    return [
      { date: "2025-12-08", label: "Mon", revenue: 1200, target: 1500 },
      { date: "2025-12-09", label: "Tue", revenue: 1450, target: 1500 },
      { date: "2025-12-10", label: "Wed", revenue: 1680, target: 1500 },
      { date: "2025-12-11", label: "Thu", revenue: 1850, target: 1500 },
      { date: "2025-12-12", label: "Fri", revenue: 2100, target: 1500 },
      { date: "2025-12-13", label: "Sat", revenue: 2400, target: 2000 },
      { date: "2025-12-14", label: "Sun", revenue: 950, target: 1000 },
    ];
  }

  if (groupBy === "week") {
    return [
      { date: "2025-12-01", label: "Week 1", revenue: 8200, target: 10500 },
      { date: "2025-12-08", label: "Week 2", revenue: 9500, target: 10500 },
      { date: "2025-12-15", label: "Week 3", revenue: 10800, target: 10500 },
      { date: "2025-12-22", label: "Week 4", revenue: 8900, target: 10500 },
    ];
  }

  return [
    { date: "2025-01-01", label: "Jan", revenue: 35000, target: 30000 },
    { date: "2025-02-01", label: "Feb", revenue: 38500, target: 30000 },
    { date: "2025-03-01", label: "Mar", revenue: 42000, target: 35000 },
    { date: "2025-04-01", label: "Apr", revenue: 45000, target: 35000 },
    { date: "2025-05-01", label: "May", revenue: 48500, target: 40000 },
    { date: "2025-06-01", label: "Jun", revenue: 52000, target: 40000 },
  ];
};

/**
 * Get revenue by service
 */
export const getRevenueByService = (): Record<string, unknown>[] => {
  return [
    { service: "Haircut", revenue: 8500 },
    { service: "Coloring", revenue: 9000 },
    { service: "Massage", revenue: 4000 },
    { service: "Facial", revenue: 3500 },
    { service: "Manicure", revenue: 1500 },
  ];
};

/**
 * Get revenue by staff
 */
export const getRevenueByStaff = (): Record<string, unknown>[] => {
  return [
    { staff: "Daniel", revenue: 12800 },
    { staff: "Sarah", revenue: 11200 },
    { staff: "John", revenue: 6300 },
    { staff: "Emma", revenue: 4200 },
  ];
};

/**
 * Get service popularity
 */
export const getServicePopularity = (): Record<string, unknown>[] => {
  return [
    { service: "Haircut", bookings: 85 },
    { service: "Coloring", bookings: 45 },
    { service: "Massage", bookings: 32 },
    { service: "Facial", bookings: 28 },
    { service: "Manicure", bookings: 15 },
  ];
};

/**
 * Get service metrics
 */
export const getServiceMetrics = (): Record<string, unknown>[] => {
  return [
    {
      service: "Haircut",
      duration: 30,
      price: 100,
      rating: 4.7,
    },
    {
      service: "Coloring",
      duration: 120,
      price: 200,
      rating: 4.6,
    },
    {
      service: "Massage",
      duration: 60,
      price: 125,
      rating: 4.8,
    },
    {
      service: "Facial",
      duration: 45,
      price: 125,
      rating: 4.5,
    },
    {
      service: "Manicure",
      duration: 30,
      price: 100,
      rating: 4.4,
    },
  ];
};

// ==================== UNIFIED GET DASHBOARD DATA ====================

/**
 * Unified function to fetch all dashboard data
 *
 * Parameters are flexible:
 * - getDashboardData(dataSource, dimension, [startDate], [endDate], [groupBy])
 *
 * Examples:
 * - getDashboardData("appointments", "time_series")  // defaults to day, current week
 * - getDashboardData("appointments", "time_series", "2025-12-08", "2025-12-14", "day")
 * - getDashboardData("appointments", "by_service")  // no dates needed
 * - getDashboardData("appointments", "by_staff", "Daniel", "2025-12-08", "2025-12-14")
 * - getDashboardData("staff", "performance")
 * - getDashboardData("revenue", "time_series", "2025-12-01", "2025-12-31", "month")
 */
export const getDashboardData = (
  dataSource: string,
  dimension: string,
  param1?: string,
  param2?: string,
  param3?: string
): Record<string, unknown>[] => {
  switch (dataSource) {
    // ===== APPOINTMENTS =====
    case "appointments":
      if (dimension === "time_series") {
        const startDate = param1 || "2025-12-08";
        const endDate = param2 || "2025-12-14";
        const groupBy = (param3 || "day") as "day" | "week" | "month";
        return getAppointmentsTimeSeries(startDate, endDate, groupBy);
      }
      if (dimension === "by_service") {
        return getAppointmentsByService();
      }
      if (dimension === "by_staff") {
        const staffId = param1 || "Daniel";
        return getAppointmentsByStaff(staffId);
      }
      return [];

    // ===== CLIENTS =====
    case "clients":
      if (dimension === "time_series") {
        const startDate = param1 || "2025-12-08";
        const endDate = param2 || "2025-12-14";
        const groupBy = (param3 || "day") as "day" | "week" | "month";
        return getClientsTimeSeries(startDate, endDate, groupBy);
      }
      if (dimension === "by_source") {
        return getClientsBySource();
      }
      return [];

    // ===== STAFF =====
    case "staff":
      if (dimension === "performance") {
        return getStaffPerformance();
      }
      if (dimension === "ratings") {
        const staffId = param1 || "Daniel";
        return getStaffRatings(staffId);
      }
      return [];

    // ===== REVENUE =====
    case "revenue":
      if (dimension === "time_series") {
        const startDate = param1 || "2025-12-08";
        const endDate = param2 || "2025-12-14";
        const groupBy = (param3 || "day") as "day" | "week" | "month";
        return getRevenueTimeSeries(startDate, endDate, groupBy);
      }
      if (dimension === "by_service") {
        return getRevenueByService();
      }
      if (dimension === "by_staff") {
        return getRevenueByStaff();
      }
      return [];

    // ===== SERVICES =====
    case "services":
      if (dimension === "popularity") {
        return getServicePopularity();
      }
      if (dimension === "metrics") {
        return getServiceMetrics();
      }
      return [];

    default:
      return [];
  }
};
