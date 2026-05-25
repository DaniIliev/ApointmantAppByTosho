import { Card, CardContent } from "@/components/ui/card";
import { Users, Briefcase, Calendar, Activity, AlertTriangle, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

type DashboardStats = {
  totalUsers: number;
  totalBusinesses: number;
  totalAppointments: number;
  plansThisMonth: number;
  activeSubscribers: number;
  avgResponseTime: number;
  errorRate: number;
};

interface MetricsGridProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export default function MetricsGrid({ stats, loading }: MetricsGridProps) {
  const { t } = useTranslation();

  const cards = [
    {
      label: t("Total Registered Users"),
      value: stats?.totalUsers ?? "-",
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: t("Total Businesses"),
      value: stats?.totalBusinesses ?? "-",
      icon: Briefcase,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: t("Total Appointments"),
      value: stats?.totalAppointments ?? "-",
      icon: Calendar,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: t("Active Plans (This Month)"),
      value: stats?.plansThisMonth ?? "-",
      icon: TrendingUp,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: t("Avg Response Time"),
      value: stats ? `${stats.avgResponseTime}ms` : "-",
      icon: Activity,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
    },
    {
      label: t("24h API Error Rate"),
      value: stats ? `${stats.errorRate}%` : "-",
      icon: AlertTriangle,
      color: stats && stats.errorRate > 5 ? "text-rose-500 font-bold" : "text-rose-500",
      bg: stats && stats.errorRate > 5 ? "bg-rose-500/10 animate-pulse" : "bg-rose-500/10",
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5">
      {cards.map((card, idx) => {
        const CardIcon = card.icon;
        return (
          <Card key={idx} className="border border-gray-100 dark:border-gray-800/80 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-text-secondary leading-normal max-w-[80%]">
                  {card.label}
                </span>
                <div className={`p-2 rounded-xl ${card.bg}`}>
                  <CardIcon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
              <div>
                {loading ? (
                  <div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                ) : (
                  <span className={`text-2xl font-black text-text-primary tracking-tight ${card.color}`}>
                    {card.value}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
