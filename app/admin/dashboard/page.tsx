"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Briefcase, Terminal, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import ProtectedRoute from "@/components/guards/ProtectedRoute";
import callApi from "@/app/Api/callApi";

// Modular subcomponents
import DashboardHeader from "./components/DashboardHeader";
import MetricsGrid from "./components/MetricsGrid";
import AnalyticsCharts from "./components/AnalyticsCharts";
import BusinessesPanel from "./components/BusinessesPanel";
import LogsPanel from "./components/LogsPanel";

type DashboardStats = {
  totalUsers: number;
  totalBusinesses: number;
  totalAppointments: number;
  activePlans: Record<string, number>;
  avgResponseTime: number;
  errorRate: number;
  errorCount24h: number;
  totalRequests24h: number;
  plansThisMonth: number;
  activeSubscribers: number;
  hourlyData: Array<{
    time: string;
    requests: number;
    errors: number;
    responseTime: number;
  }>;
};

type LogEntry = {
  _id: string;
  level: string;
  category: string;
  message: string;
  timestamp: string;
  metadata: {
    url?: string;
    method?: string;
    status?: number;
    durationMs?: number;
    userId?: string;
    ip?: string;
    userAgent?: string;
    payload?: string;
    stack?: string;
    errorName?: string;
  };
};

type BusinessEntry = {
  _id: string;
  businessName: string;
  ownerEmail: string;
  ownerName: string;
  plan: string;
  subscriptionStatus: string;
  planExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
  locationsCount: number;
  staffCount: number;
  appointmentsCount: number;
};

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"overview" | "businesses" | "logs">("overview");

  // State
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [businesses, setBusinesses] = useState<BusinessEntry[]>([]);
  const [logsData, setLogsData] = useState<{ logs: LogEntry[]; totalPages: number }>({ logs: [], totalPages: 0 });
  
  // Log filter states
  const [logLevel, setLogLevel] = useState<string>("all");
  const [logCategory, setLogCategory] = useState<string>("all");
  const [logSearch, setLogSearch] = useState<string>("");
  const [logPage, setLogPage] = useState<number>(1);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  // Loading and refreshing states
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);

  // Fetch Dashboard Stats
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const data = await callApi("/api/admin/dashboard-stats", "GET");
      setStats(data);
    } catch (e) {
      console.error("Failed to load dashboard metrics:", e);
      toast.error(t("Failed to load dashboard metrics"));
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch Businesses
  const fetchBusinesses = async () => {
    setLoadingBusinesses(true);
    try {
      const data = await callApi("/api/admin/businesses", "GET");
      setBusinesses(data);
    } catch (e) {
      console.error("Failed to load business entries:", e);
      toast.error(t("Failed to load businesses"));
    } finally {
      setLoadingBusinesses(false);
    }
  };

  // Fetch System Logs
  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const queryParams = new URLSearchParams({
        level: logLevel,
        category: logCategory,
        search: logSearch,
        page: String(logPage),
        limit: "25",
      });
      const data = await callApi(`/api/admin/logs?${queryParams.toString()}`, "GET");
      setLogsData(data);
    } catch (e) {
      console.error("Failed to load system logs:", e);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleGlobalRefresh = () => {
    fetchStats();
    fetchBusinesses();
    fetchLogs();
  };

  useEffect(() => {
    fetchStats();
    fetchBusinesses();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [logLevel, logCategory, logPage]);

  return (
    <ProtectedRoute requiredRoles={["admin"]}>
      <div className="space-y-8">
        
        {/* Upper Dashboard Glassmorphic Header */}
        <DashboardHeader onRefresh={handleGlobalRefresh} />

        {/* Dynamic Framer Motion Tab Switcher */}
        <div className="flex border-b border-gray-100 dark:border-gray-800 pb-px gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: "overview", label: t("Overview & Metrics"), icon: Activity },
            { id: "businesses", label: t("Businesses & Plans"), icon: Briefcase },
            { id: "logs", label: t("System Logs & Errors"), icon: Terminal },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex items-center gap-2 px-6 py-3.5 text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                  isActive ? "text-primary" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab contents */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            
            {/* 1. OVERVIEW & METRICS TAB */}
            {activeTab === "overview" && (
              <motion.div
                key="overview-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Metrics Stats Grid */}
                <MetricsGrid stats={stats} loading={loadingStats} />

                {/* ECharts Visualizations */}
                <AnalyticsCharts stats={stats} loading={loadingStats} />
              </motion.div>
            )}

            {/* 2. BUSINESSES & PLANS TAB */}
            {activeTab === "businesses" && (
              <motion.div
                key="businesses-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <BusinessesPanel businesses={businesses} loading={loadingBusinesses} />
              </motion.div>
            )}

            {/* 3. SYSTEM LOGS & ERROR TRACKING TAB */}
            {activeTab === "logs" && (
              <motion.div
                key="logs-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <LogsPanel
                  logsData={logsData}
                  loadingLogs={loadingLogs}
                  logLevel={logLevel}
                  setLogLevel={setLogLevel}
                  logCategory={logCategory}
                  setLogCategory={setLogCategory}
                  logSearch={logSearch}
                  setLogSearch={setLogSearch}
                  logPage={logPage}
                  setLogPage={setLogPage}
                  fetchLogs={fetchLogs}
                  selectedLog={selectedLog}
                  setSelectedLog={setSelectedLog}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </ProtectedRoute>
  );
}
