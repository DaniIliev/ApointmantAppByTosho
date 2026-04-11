"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Sparkles,
  TrendingUp,
  UserRound,
  Wallet,
} from "lucide-react";

import ProtectedRoute from "@/components/guards/ProtectedRoute";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Appointment } from "@/Global/Types/types";
import callApi from "@/app/Api/callApi";
import { useAuthContext } from "@/context/AuthContext";
import { usePageTitle } from "@/context/PageTitleContext";
import { useRightNav } from "@/context/RightNavContext";
import { formatDateAndTime } from "@/Global/Utils/commonFn";
import { useTranslation } from "react-i18next";

const ReactECharts = dynamic(() => import("echarts-for-react"), {
  ssr: false,
});

type QuickAction = {
  label: string;
  description: string;
  href: string;
  icon: React.ReactNode;
};

const staffAndBusinessRoles = ["business", "staff", "admin"] as const;
const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CHART_TRACK_HEIGHT = 138;

function getWeekStart(date: Date) {
  const start = new Date(date);
  const day = start.getDay();
  const mondayOffset = (day + 6) % 7;
  start.setDate(start.getDate() - mondayOffset);
  start.setHours(0, 0, 0, 0);
  return start;
}

function getAppointmentRevenue(appointment: Appointment) {
  const rawValue = Number(appointment.servicePrice ?? 0);
  return Number.isFinite(rawValue) ? rawValue : 0;
}

function getDeltaPercent(current: number, previous: number) {
  if (previous === 0 && current === 0) return 0;
  if (previous === 0) return 100;
  return Math.round(((current - previous) / previous) * 100);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("bg-BG", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

const statusBadgeClassMap: Record<string, string> = {
  confirmed: "bg-emerald-500/20 text-emerald-600",
  pending: "bg-amber-500/20 text-amber-600",
  completed: "bg-blue-500/20 text-blue-600",
  cancelled: "bg-rose-500/20 text-rose-600",
};

function HomePageContent() {
  const { user } = useAuthContext();
  const { t } = useTranslation();
  const { setPageTitle } = usePageTitle();
  const { setExtraRightNavMenu, setIsRightNavVisible } = useRightNav();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isTeamRole = staffAndBusinessRoles.includes(
    user?.role as (typeof staffAndBusinessRoles)[number],
  );

  useEffect(() => {
    setPageTitle(t("Home"));
    setExtraRightNavMenu(null);
    setIsRightNavVisible(false);

    return () => {
      setPageTitle(null);
      setExtraRightNavMenu(null);
      setIsRightNavVisible(false);
    };
  }, [setExtraRightNavMenu, setIsRightNavVisible, setPageTitle]);

  useEffect(() => {
    let mounted = true;

    const fetchHomeData = async () => {
      if (!isTeamRole) {
        if (mounted) {
          setAppointments([]);
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        const data = await callApi("/api/appointment/dashboard", "GET");
        if (mounted) {
          setAppointments(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to load home data:", error);
        if (mounted) {
          setAppointments([]);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchHomeData();

    return () => {
      mounted = false;
    };
  }, [isTeamRole]);

  const quickActions: QuickAction[] = useMemo(() => {
    if (isTeamRole) {
      return [
        {
          label: t("Dashboard"),
          description: t("Manage your schedule and appointments"),
          href: "/dashboard",
          icon: <CalendarDays className="h-4 w-4" />,
        },
        {
          label: t("Services"),
          description: t("Edit services and pricing"),
          href: "/appointment-types",
          icon: <Briefcase className="h-4 w-4" />,
        },
        {
          label: t("Team"),
          description: t("Review team and roles"),
          href: "/staff",
          icon: <UserRound className="h-4 w-4" />,
        },
      ];
    }

    return [
      {
        label: t("Explore Businesses"),
        description: t("Discover new available time slots"),
        href: "/for-business",
        icon: <Sparkles className="h-4 w-4" />,
      },
      {
        label: t("My Profile"),
        description: t("Update your profile"),
        href: "/profile",
        icon: <UserRound className="h-4 w-4" />,
      },
      {
        label: t("Pricing"),
        description: t("View plans and extras"),
        href: "/pricing",
        icon: <TrendingUp className="h-4 w-4" />,
      },
    ];
  }, [isTeamRole]);

  const stats = useMemo(() => {
    const now = new Date();
    const todayKey = now.toDateString();

    const currentWeekStart = getWeekStart(now);

    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekEnd.getDate() + 7);

    const previousWeekStart = new Date(currentWeekStart);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);

    const previousWeekEnd = new Date(currentWeekStart);

    const thisWeek = appointments.filter((appointment) => {
      const start = new Date(appointment.appointmentTime?.start || "");
      return start >= currentWeekStart && start < currentWeekEnd;
    });

    const previousWeek = appointments.filter((appointment) => {
      const start = new Date(appointment.appointmentTime?.start || "");
      return start >= previousWeekStart && start < previousWeekEnd;
    });

    const completed = thisWeek.filter((a) => a.status === "completed").length;
    const previousCompleted = previousWeek.filter(
      (a) => a.status === "completed",
    ).length;
    const pendingWeek = Math.max(thisWeek.length - completed, 0);
    const today = appointments.filter(
      (a) =>
        new Date(a.appointmentTime?.start || "").toDateString() === todayKey,
    ).length;

    const chartData = WEEKDAY_LABELS.map((label, index) => {
      const dayStart = new Date(currentWeekStart);
      dayStart.setDate(currentWeekStart.getDate() + index);

      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayStart.getDate() + 1);

      const dayItems = thisWeek.filter((item) => {
        const start = new Date(item.appointmentTime?.start || "");
        return start >= dayStart && start < dayEnd;
      });

      const dayCompleted = dayItems.filter(
        (item) => item.status === "completed",
      ).length;

      const dayPending = dayItems.filter(
        (item) => item.status === "pending",
      ).length;

      const dayCancelled = dayItems.filter(
        (item) => item.status === "cancelled",
      ).length;

      return {
        label,
        all: dayItems.length,
        completed: dayCompleted,
        pending: dayPending,
        cancelled: dayCancelled,
      };
    });

    const upcoming = appointments
      .filter((a) => {
        const start = new Date(a.appointmentTime?.start || "");
        return start > now && a.status !== "cancelled";
      })
      .sort(
        (first, second) =>
          new Date(first.appointmentTime?.start || "").getTime() -
          new Date(second.appointmentTime?.start || "").getTime(),
      );

    const thisWeekRevenue = thisWeek
      .filter((appointment) => appointment.status === "completed")
      .reduce(
        (sum, appointment) => sum + getAppointmentRevenue(appointment),
        0,
      );

    const previousWeekRevenue = previousWeek
      .filter((appointment) => appointment.status === "completed")
      .reduce(
        (sum, appointment) => sum + getAppointmentRevenue(appointment),
        0,
      );

    const appointmentsCompareMax = Math.max(
      1,
      thisWeek.length,
      previousWeek.length,
    );
    const revenueCompareMax = Math.max(1, thisWeekRevenue, previousWeekRevenue);

    const thisWeekAppointmentsWidth =
      (thisWeek.length / appointmentsCompareMax) * 100;
    const previousWeekAppointmentsWidth =
      (previousWeek.length / appointmentsCompareMax) * 100;

    const thisWeekRevenueWidth = (thisWeekRevenue / revenueCompareMax) * 100;
    const previousWeekRevenueWidth =
      (previousWeekRevenue / revenueCompareMax) * 100;

    return {
      weekTotal: thisWeek.length,
      completed,
      previousCompleted,
      pendingWeek,
      today,
      completionRate:
        thisWeek.length > 0
          ? Math.round((completed / thisWeek.length) * 100)
          : 0,
      nextItems: upcoming.slice(0, 4),
      nextItem: upcoming[0] ?? null,
      chartData,
      maxDayTotal: Math.max(
        1,
        ...chartData.flatMap((item) => [
          item.all,
          item.completed,
          item.pending,
          item.cancelled,
        ]),
      ),
      hasNoCompleted: completed === 0,
      thisWeekAppointments: thisWeek.length,
      previousWeekAppointments: previousWeek.length,
      appointmentsDeltaPercent: getDeltaPercent(
        thisWeek.length,
        previousWeek.length,
      ),
      thisWeekRevenue,
      previousWeekRevenue,
      revenueDeltaPercent: getDeltaPercent(
        thisWeekRevenue,
        previousWeekRevenue,
      ),
      thisWeekAppointmentsWidth,
      previousWeekAppointmentsWidth,
      thisWeekRevenueWidth,
      previousWeekRevenueWidth,
    };
  }, [appointments]);

  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  const displayName = fullName || user?.email || "there";

  return (
    <div className="space-y-5">
      <Card className="border-0 bg-gradient-to-br from-primary via-primary to-primary/75 text-white shadow-xl">
        <CardContent className="px-6 py-6 md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold md:text-3xl">
                {t("Hello")}, {displayName}
              </h1>
              <p className="max-w-2xl text-sm text-white/90 md:text-base">
                {t(
                  "Here you see the most important information for the day: quick actions, upcoming appointments and current progress.",
                )}
              </p>
            </div>
            <Link href="/dashboard">
              <Button className="bg-white text-primary hover:bg-white/90">
                {t("Open Dashboard")} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Weekly pulse</CardTitle>
              <CardDescription>
                {t("Total vs completed by day")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pb-6">
          {stats.weekTotal > 0 && (
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${stats.completionRate}%` }}
            />
          )}

          <div className="grid grid-cols-7 gap-1.5 md:gap-3">
            {stats.chartData.map((item) => {
              const rawTotalHeight =
                (item.all / stats.maxDayTotal) * CHART_TRACK_HEIGHT;
              const totalHeight =
                item.all > 0 ? Math.max(10, rawTotalHeight) : 0;
              const completedHeight =
                item.all === 0 ? 0 : (item.completed / item.all) * totalHeight;

              return (
                <div
                  key={item.label}
                  className="flex flex-col items-center gap-2 md:gap-3"
                >
                  <span className="text-base md:text-xl">{item.all}</span>
                  <div
                    className="relative flex w-7 items-end overflow-hidden rounded-[999px] bg-accent/30 md:w-12"
                    style={{ height: `${CHART_TRACK_HEIGHT}px` }}
                  >
                    <div
                      className="w-full rounded-[999px] bg-primary"
                      style={{ height: `${totalHeight}px` }}
                    >
                      <div
                        className="mt-auto w-full rounded-[999px] bg-primary"
                        style={{ height: `${completedHeight}px` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-extrabold leading-none text-foreground/85 md:text-lg">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

          {stats.weekTotal === 0 && (
            <div className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
              {t("You don't have any appointments for this week yet.")}
            </div>
          )}
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-semibold">
                  Appointments Momentum
                </CardTitle>
                <CardDescription className="text-xs">
                  This week vs last week
                </CardDescription>
              </div>
              <div className="flex justify-center gap-1">
                <div
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${stats.appointmentsDeltaPercent >= 0 ? "bg-emerald-500/15 text-emerald-600" : "bg-rose-500/15 text-rose-600"}`}
                >
                  {stats.appointmentsDeltaPercent >= 0 ? (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5" />
                  )}
                  {stats.appointmentsDeltaPercent >= 0 ? "+" : ""}
                  {stats.appointmentsDeltaPercent}%
                </div>
                <div className="rounded-lg bg-background/80 p-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>This week</span>
                  <span>{stats.thisWeekAppointments}</span>
                </div>
                <div className="h-2 rounded-full bg-accent/40">
                  <div
                    className="h-2 rounded-full bg-primary shadow-[0_0_12px_rgba(99,102,241,0.45)]"
                    style={{ width: `${stats.thisWeekAppointmentsWidth}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Last week</span>
                  <span>{stats.previousWeekAppointments}</span>
                </div>
                <div className="h-2 rounded-full bg-accent/40">
                  <div
                    className="h-2 rounded-full bg-muted-foreground/60"
                    style={{ width: `${stats.previousWeekAppointmentsWidth}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-semibold">
                  Revenue Momentum
                </CardTitle>
                <CardDescription className="text-xs">
                  Completed appointments only
                </CardDescription>
              </div>
              <div className="flex justify-center gap-1">
                <div
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${stats.revenueDeltaPercent >= 0 ? "bg-emerald-500/15 text-emerald-600" : "bg-rose-500/15 text-rose-600"}`}
                >
                  {stats.revenueDeltaPercent >= 0 ? (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5" />
                  )}
                  {stats.revenueDeltaPercent >= 0 ? "+" : ""}
                  {stats.revenueDeltaPercent}%
                </div>
                <div className="rounded-lg bg-background/80 p-2">
                  <Wallet className="h-4 w-4 text-primary" />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 pb-6">
            <div className="space-y-2">
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>This week</span>
                  <span>{formatCurrency(stats.thisWeekRevenue)}</span>
                </div>
                <div className="h-2 rounded-full bg-accent/40">
                  <div
                    className="h-2 rounded-full bg-primary shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                    style={{ width: `${stats.thisWeekRevenueWidth}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Last week</span>
                  <span>{formatCurrency(stats.previousWeekRevenue)}</span>
                </div>
                <div className="h-2 rounded-full bg-accent/40">
                  <div
                    className="h-2 rounded-full bg-muted-foreground/60"
                    style={{ width: `${stats.previousWeekRevenueWidth}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>{t("Quick actions")}</CardTitle>
            <CardDescription>
              {t("Most frequently used sections for your account")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pb-6">
            {quickActions.map((item) => (
              <Link
                href={item.href}
                key={item.href}
                className="group flex items-center justify-between rounded-xl border p-3 transition hover:border-primary/50 hover:bg-primary/5"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-semibold">{item.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle>{t("Upcoming appointments")}</CardTitle>
            <CardDescription>
              {stats.nextItem
                ? `${t("Next appointment")}: ${formatDateAndTime(stats.nextItem.appointmentTime.start, "dateTime")}`
                : t("You don't have any upcoming appointments at the moment")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pb-6">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : stats.nextItems.length > 0 ? (
              stats.nextItems.map((appointment) => {
                const status = appointment.status || "pending";
                const badgeClass =
                  statusBadgeClassMap[status] || "bg-zinc-500/20 text-zinc-600";

                return (
                  <div
                    key={appointment._id}
                    className="flex flex-col gap-3 rounded-xl border p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-semibold">{appointment.clientName}</p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.serviceName || "Appointment"} ·{" "}
                        {formatDateAndTime(
                          appointment.appointmentTime.start,
                          "dateTime",
                        )}
                      </p>
                    </div>
                    <Badge className={`w-fit capitalize ${badgeClass}`}>
                      {status}
                    </Badge>
                  </div>
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed p-6 text-center">
                <p className="font-semibold">
                  {t("Your schedule is clear")} ✨
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("Add a new appointment from Dashboard to get started.")}
                </p>
                <Link href="/dashboard" className="mt-4 inline-block">
                  <Button variant="outline">{t("Go to Dashboard")}</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <ProtectedRoute>
      <HomePageContent />
    </ProtectedRoute>
  );
}
