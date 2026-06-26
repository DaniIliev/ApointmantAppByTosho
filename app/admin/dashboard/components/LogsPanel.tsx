import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, RefreshCw, ChevronRight, Terminal } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

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

interface LogsPanelProps {
  logsData: { logs: LogEntry[]; totalPages: number };
  loadingLogs: boolean;
  logLevel: string;
  setLogLevel: (l: string) => void;
  logCategory: string;
  setLogCategory: (c: string) => void;
  logSearch: string;
  setLogSearch: (s: string) => void;
  logPage: number;
  setLogPage: (p: number) => void;
  fetchLogs: () => void;
  selectedLog: LogEntry | null;
  setSelectedLog: (log: LogEntry | null) => void;
}

export default function LogsPanel({
  logsData,
  loadingLogs,
  logLevel,
  setLogLevel,
  logCategory,
  setLogCategory,
  logSearch,
  setLogSearch,
  logPage,
  setLogPage,
  fetchLogs,
  selectedLog,
  setSelectedLog,
}: LogsPanelProps) {
  const { t } = useTranslation();
  const [copiedLogId, setCopiedLogId] = React.useState<string | null>(null);

  const handleLogsSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLogPage(1);
    fetchLogs();
  };

  const copyToClipboard = (text: string, logId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLogId(logId);
    toast.success(t("Copied stacktrace to clipboard"));
    setTimeout(() => setCopiedLogId(null), 2500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
      {/* Left Side: Filter Form & Logs list */}
      <div className="lg:col-span-8 space-y-4">
        
        {/* Logs filter bar */}
        <form onSubmit={handleLogsSearchSubmit} className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-card/30 backdrop-blur-lg flex flex-col md:flex-row gap-3">
          
          {/* Search Field */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              placeholder={t("Search by message, url, stack...")}
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-card/40 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            {/* Level select */}
            <div className="flex items-center gap-1.5 border border-gray-100 dark:border-gray-800 rounded-xl px-2 bg-white dark:bg-card/40">
              <Filter className="w-3.5 h-3.5 text-text-secondary" />
              <select
                value={logLevel}
                onChange={(e) => {
                  setLogLevel(e.target.value);
                  setLogPage(1);
                }}
                className="h-10 text-xs font-semibold text-text-primary bg-transparent focus:outline-none cursor-pointer pr-1"
              >
                <option value="all">{t("All Levels")}</option>
                <option value="error">🔴 {t("Error")}</option>
                <option value="warn">🟡 {t("Warning")}</option>
                <option value="info">🟢 {t("Info")}</option>
                <option value="metric">🔵 {t("Metric")}</option>
              </select>
            </div>

            {/* Category select */}
            <div className="flex items-center gap-1.5 border border-gray-100 dark:border-gray-800 rounded-xl px-2 bg-white dark:bg-card/40">
              <select
                value={logCategory}
                onChange={(e) => {
                  setLogCategory(e.target.value);
                  setLogPage(1);
                }}
                className="h-10 text-xs font-semibold text-text-primary bg-transparent focus:outline-none cursor-pointer pr-1"
              >
                <option value="all">{t("All Categories")}</option>
                <option value="api_error">{t("API Errors")}</option>
                <option value="api_performance">{t("Performance")}</option>
                <option value="general">{t("General")}</option>
              </select>
            </div>

            <Button type="submit" className="h-10 bg-primary hover:bg-primary-dark px-5">
              {t("Search")}
            </Button>
          </div>
        </form>

        {/* Logs list representation */}
        <Card className="border border-gray-100 dark:border-gray-800 shadow-md">
          <CardContent className="p-0">
            {loadingLogs ? (
              <div className="py-24 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                <span className="text-xs text-text-secondary font-medium">{t("Querying logs collection...")}</span>
              </div>
            ) : logsData.logs.length === 0 ? (
              <div className="py-24 text-center text-text-secondary italic">
                {t("No log matching criteria found")}
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800/80">
                {logsData.logs.map((log) => {
                  let badgeStyle = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
                  if (log.level === "error") {
                    badgeStyle = "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 font-bold";
                  } else if (log.level === "warn") {
                    badgeStyle = "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400";
                  } else if (log.level === "metric") {
                    badgeStyle = "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400";
                  } else if (log.level === "info") {
                    badgeStyle = "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400";
                  }

                  const isSelected = selectedLog?._id === log._id;

                  return (
                    <div
                      key={log._id}
                      onClick={() => setSelectedLog(log)}
                      className={`p-4 transition-all duration-200 cursor-pointer flex items-start justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-card/10 ${
                        isSelected ? "bg-primary/5 border-l-4 border-primary" : ""
                      }`}
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${badgeStyle}`}>
                            {log.level}
                          </span>
                          <span className="text-[10px] font-medium text-text-secondary opacity-75">
                            📂 {log.category}
                          </span>
                          <span className="text-[10px] text-text-secondary opacity-60">
                            ⏱️ {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        
                        <p className="text-sm font-medium font-mono text-text-primary break-words leading-relaxed">
                          {log.message}
                        </p>

                        {log.metadata.url && (
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-text-secondary bg-gray-100/30 dark:bg-gray-800/20 px-2 py-0.5 rounded w-max">
                            <span className="font-bold text-primary uppercase">{log.metadata.method}</span>
                            <span className="truncate max-w-[320px]">{log.metadata.url}</span>
                            {log.metadata.status && (
                              <span className={`ml-1 font-bold ${log.metadata.status >= 400 ? "text-rose-500" : "text-emerald-500"}`}>
                                ({log.metadata.status})
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-text-secondary opacity-40 shrink-0 self-center" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Logs Pagination */}
        {logsData.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button
              size="sm"
              variant="outline"
              disabled={logPage === 1 || loadingLogs}
              onClick={() => setLogPage(Math.max(logPage - 1, 1))}
            >
              {t("Previous")}
            </Button>
            <span className="text-xs text-text-secondary">
              {t("Page")} {logPage} {t("of")} {logsData.totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={logPage === logsData.totalPages || loadingLogs}
              onClick={() => setLogPage(Math.min(logPage + 1, logsData.totalPages))}
            >
              {t("Next")}
            </Button>
          </div>
        )}

      </div>

      {/* Right Side: Log Inspector */}
      <div className="lg:col-span-4 space-y-4">
        <Card className="border border-gray-100 dark:border-gray-800 shadow-lg h-full min-h-[500px] sticky top-4 bg-white/50 dark:bg-card/25 backdrop-blur-xl">
          <CardContent className="p-5 flex flex-col h-full space-y-4">
            
            <div className="border-b border-gray-100 dark:border-gray-800 pb-3 flex justify-between items-center">
              <h3 className="font-extrabold text-base text-text-primary flex items-center gap-1.5">
                <Terminal className="w-5 h-5 text-primary" />
                {t("Log Inspector")}
              </h3>
              {selectedLog && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedLog(null)}
                  className="text-xs text-text-secondary"
                >
                  {t("Clear")}
                </Button>
              )}
            </div>

            {selectedLog ? (
              <div className="space-y-4 overflow-y-auto flex-1 max-h-[640px] pr-1">
                
                <div className="space-y-1">
                  <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">{t("Message")}</span>
                  <p className="text-sm font-semibold font-mono text-text-primary break-words bg-gray-50 dark:bg-gray-950 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                    {selectedLog.message}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 dark:bg-gray-950/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                  <div>
                    <span className="text-[10px] text-text-secondary font-bold uppercase block">{t("Level")}</span>
                    <span className="font-semibold uppercase text-primary">{selectedLog.level}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-secondary font-bold uppercase block">{t("Category")}</span>
                    <span className="font-semibold">{selectedLog.category}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-text-secondary font-bold uppercase block">{t("Timestamp")}</span>
                    <span className="font-mono text-text-secondary">{new Date(selectedLog.timestamp).toLocaleString()}</span>
                  </div>
                  {selectedLog.metadata.userId && (
                    <div className="col-span-2">
                      <span className="text-[10px] text-text-secondary font-bold uppercase block">{t("Acting User ID")}</span>
                      <span className="font-mono text-xs">{selectedLog.metadata.userId}</span>
                    </div>
                  )}
                </div>

                {/* HTTP metadata */}
                {selectedLog.metadata.url && (
                  <div className="space-y-2 text-xs bg-primary/5 p-3 rounded-xl border border-primary/10">
                    <span className="text-[10px] text-primary font-bold uppercase tracking-wider block">{t("API Context")}</span>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-[9px] text-text-secondary font-semibold uppercase">{t("Method")}</span>
                        <p className="font-mono font-bold text-primary">{selectedLog.metadata.method}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-text-secondary font-semibold uppercase">{t("Status")}</span>
                        <p className={`font-mono font-bold ${selectedLog.metadata.status && selectedLog.metadata.status >= 400 ? "text-rose-500" : "text-emerald-500"}`}>
                          {selectedLog.metadata.status}
                        </p>
                      </div>
                      <div>
                        <span className="text-[9px] text-text-secondary font-semibold uppercase">{t("Duration")}</span>
                        <p className="font-mono font-bold text-text-primary">{selectedLog.metadata.durationMs}ms</p>
                      </div>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-primary/5">
                      <span className="text-[9px] text-text-secondary font-semibold uppercase block">{t("Request URL")}</span>
                      <p className="font-mono break-all text-[11px]">{selectedLog.metadata.url}</p>
                    </div>
                    {selectedLog.metadata.ip && (
                      <div className="col-span-2 pt-1 border-t border-primary/5">
                        <span className="text-[9px] text-text-secondary font-semibold uppercase block">{t("Caller Details")}</span>
                        <p className="font-mono break-all text-[10px] opacity-80">{selectedLog.metadata.ip} | {selectedLog.metadata.userAgent}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Stacktrace / Detailed Payload */}
                {selectedLog.metadata.stack && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">{t("Stacktrace Diagnostics")}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(selectedLog.metadata.stack || "", selectedLog._id)}
                        className="h-6 text-[10px] font-bold border border-rose-500/10 text-rose-500 hover:bg-rose-500/5 px-2.5 rounded-lg"
                      >
                        {copiedLogId === selectedLog._id ? t("Copied") : t("Copy Stack")}
                      </Button>
                    </div>
                    <pre className="text-[10px] font-mono p-3 bg-red-500/5 dark:bg-rose-950/20 text-rose-500 border border-rose-500/10 rounded-xl overflow-x-auto max-h-[300px] leading-relaxed select-all">
                      {selectedLog.metadata.stack}
                    </pre>
                  </div>
                )}

                {selectedLog.metadata.payload && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">{t("Error Context Payload")}</span>
                    <pre className="text-[10px] font-mono p-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-x-auto max-h-[200px] leading-relaxed">
                      {selectedLog.metadata.payload}
                    </pre>
                  </div>
                )}

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                <Terminal className="w-10 h-10 text-text-secondary opacity-30 mb-2" />
                <p className="text-sm font-semibold text-text-secondary">{t("No Log Selected")}</p>
                <p className="text-xs text-text-secondary opacity-60 mt-1 max-w-[180px]">
                  {t("Click any log entry on the left list to inspect diagnostic metadata details")}
                </p>
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
