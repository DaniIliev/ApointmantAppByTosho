"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  Bell,
  BarChart3,
  Palette,
  CheckCircle2,
  TrendingUp,
  Zap,
  Shield,
  Check,
  DollarSign,
  CheckCircle,
  ArrowRight,
  PlayCircle,
} from "lucide-react";
// import { KPICard } from "@/components/performance/KPICard";
import { PerformanceChart } from "@/components/performance/PerformanceChart";
import { PerformanceData } from "../performance/page";
import { usePaddingControl } from "@/context/PaddingContext";
import { useEffect } from "react";
import { BenefitsSection } from "@/components/sections/benefits-section";
import PricingSection from "@/components/Pricing/PricingSection";
import { useTranslation } from "react-i18next";
import {
  LEFT_NAV_CLOSED_WIDTH_CLASS,
  LEFT_NAV_OPEN_WIDTH_CLASS,
} from "@/components/ClientLayout";
import { Footer } from "react-day-picker";

export default function BusinessLandingPage() {
  const { t } = useTranslation();
  const { setRemovePadding } = usePaddingControl();
  useEffect(() => {
    setRemovePadding(true);
    return () => {
      setRemovePadding(false);
    };
  }, [setRemovePadding]);
  return (
    <div className="min-h-screen bg-background">
      <section className="relative min-h- h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-background/95 z-10" />
          <img
            src="/image.png"
            alt="Background"
            className="w-full h-full object-cover animate-subtle-zoom"
          />
        </div>
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-20">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-balance text-white drop-shadow-lg">
              {t("Transform Your Business with AppointDI")}
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-white/95 text-balance max-w-3xl mx-auto drop-shadow-md">
              {t(
                "Schedule faster, empower your team, and grow with our all-in-one platform."
              )}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="text-base sm:text-lg px-7 py-6 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-transform theme-gradient-primary text-white ring-1 ring-white/20"
              >
                <span className="mr-2">{t("Join Us")}</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-base sm:text-lg px-7 py-6 bg-white/10 text-white border-primary/30 hover:bg-white/20 hover:scale-[1.02] transition-all backdrop-blur-md shadow-xl"
              >
                <PlayCircle className="h-5 w-5 mr-2" />
                {t("Watch Demo")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <BenefitsSection type="feature" />

      {/* Benefits Section */}
      <section id="benefits" className="bg-muted/30 py-20 md:py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance">
                  {t("Why Businesses Choose AppointDI")}
                </h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-semibold mb-2">
                        {t("Save Time & Reduce No-Shows")}
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        {t(
                          "Automated notifications and confirmations reduce no-shows by up to 60%, saving you time and money."
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-semibold mb-2">
                        {t("Increase Revenue")}
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        {t(
                          "Fill more appointment slots, track popular services, and optimize pricing based on real performance data."
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-semibold mb-2">
                        {t("Empower Your Team")}
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        {t(
                          "Give staff members control over their schedules and appointments while maintaining business oversight."
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-semibold mb-2">
                        {t("Professional & Reliable")}
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        {t(
                          "Provide clients with a seamless booking experience that reflects your business's professionalism."
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <Card className="overflow-hidden shadow-xl border-2 hover:shadow-2xl transition-shadow duration-500">
                  <CardContent className="p-0 pb-0">
                    <img
                      src="benefits.jpg"
                      alt="Performance analytics dashboard with charts and metrics"
                      className="w-full h-auto"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* <section
        id="analytics"
        className="bg-gray-50 dark:bg-gray-900 py-8 md:py-12  "
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-primary text-balance">
              {t("Unlock the Power of Data 🚀")}
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground text-balance max-w-3xl mx-auto mt-6">
              {t(
                "Transform your operations with precise insights into revenue, service popularity, and client engagement – all in one intuitive dashboard."
              )}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 md:mt-8 mb-6 md:mb-10">
            <KPICard
              title={t("Total Appointments")}
              value={mockPerformanceData.kpiData.totalAppointments}
              change={mockPerformanceData.kpiData.changes.totalAppointments}
              icon={<Calendar />}
              className="shadow-xl"
            />
            <KPICard
              title={t("Total Revenue")}
              value={`$${mockPerformanceData.kpiData.totalRevenue.toLocaleString()}`}
              change={mockPerformanceData.kpiData.changes.totalRevenue}
              icon={<DollarSign />}
              className="shadow-xl"
            />
            <KPICard
              title={t("Client Retention Rate")}
              value={`${mockPerformanceData.kpiData.clientRetentionRate.toFixed(
                1
              )}%`}
              icon={<Users />}
              className="shadow-xl"
            />
            <KPICard
              title={t("No-Show Reduction")}
              value={`60%`}
              icon={<CheckCircle />}
              className="shadow-xl"
            />
          </div>
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <PerformanceChart
                title={t("Appointments Over Time")}
                data={mockPerformanceData.appointmentsOverTime}
                type="line"
                dataKeys={["total", "completed", "cancelled"]}
                xAxisKey="name"
                colors={["#3b61c0", "#22c55e", "#ef4444"]}
              />
              <PerformanceChart
                title={t("Revenue Trends")}
                data={mockPerformanceData.revenueOverTime}
                type="line"
                dataKey="value"
                xAxisKey="name"
                colors={["#00bfff"]}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <PerformanceChart
                title={t("Service Popularity")}
                data={mockPerformanceData.servicePopularity}
                type="bar"
                dataKey="value"
                xAxisKey="name"
              />
              <PerformanceChart
                title={t("Revenue by Service Category")}
                data={mockPerformanceData.revenueByService}
                type="bar"
                dataKey="value"
                xAxisKey="name"
                colors={["#f59e0b"]}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PerformanceChart
                title={t("Appointment Status Distribution")}
                data={mockPerformanceData.appointmentStatus}
                type="pie"
                dataKey="value"
                colors={["#22c55e", "#ef4444"]}
              />
              <PerformanceChart
                title={t("Client Types Distribution")}
                data={mockPerformanceData.clientTypes}
                type="pie"
                dataKey="value"
              />
            </div>
          </div>
        </div>
      </section> */}
      <PricingSection />

      {/* Kanban Board (Task Manager) Section */}
      <section className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance mb-4">
              {t("Organize Work Effortlessly with Our Kanban Board")}
            </h2>
            {/* Kanban Board Visual Image */}
            <div className="flex justify-center mb-6">
              <img
                src="/kanban-preview.png"
                alt={t("Kanban Board Example") as string}
                className="rounded-xl shadow-lg border w-full max-w-3xl object-cover"
                style={{ maxHeight: 340 }}
              />
            </div>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              {t(
                "Stay on top of every task, deadline, and project with our intuitive Kanban Board. Designed for teams and individuals, it helps you visualize work, track progress, and boost productivity—all in one place."
              )}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <div className="flex flex-col items-center">
                <Check className="h-10 w-10 text-primary mb-2" />
                <h3 className="font-semibold text-lg mb-1">
                  {t("Drag & Drop Tasks")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(
                    "Easily move tasks between columns to reflect their status. Simple, fast, and visual."
                  )}
                </p>
              </div>
              <div className="flex flex-col items-center">
                <BarChart3 className="h-10 w-10 text-primary mb-2" />
                <h3 className="font-semibold text-lg mb-1">
                  {t("Track Progress")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(
                    "See what’s in progress, completed, or overdue at a glance. Perfect for managing team workloads."
                  )}
                </p>
              </div>
              <div className="flex flex-col items-center">
                <Users className="h-10 w-10 text-primary mb-2" />
                <h3 className="font-semibold text-lg mb-1">
                  {t("Collaborate in Real Time")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(
                    "Assign tasks, add comments, and keep everyone in sync—no matter where you work from."
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-10 md:py-10">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary">
              {t("Ready to Transform Your Business?")}
            </h2>
            <p className="text-base sm:text-lg text-primary-foreground/90 text-balance">
              {t(
                "Join thousands of businesses that have streamlined their operations and increased revenue with AppointFlow"
              )}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                size="lg"
                className="text-base sm:text-lg px-7 py-6 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-transform theme-gradient-primary text-white ring-1 ring-white/20"
              >
                <span className="mr-2">{t("Join Us")}</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-base sm:text-lg px-7 py-6 bg-white/10 text-white border-primary/30 hover:bg-white/20 hover:scale-[1.02] transition-all backdrop-blur-md shadow-xl"
              >
                <PlayCircle className="h-5 w-5 mr-2" />
                {t("Watch Demo")}
              </Button>
            </div>
          </div>
        </div>
      </section>
      {/* <div
        className={`
                            transition-all duration-300         ${
                              isLeftNavOpen
                                ? LEFT_NAV_OPEN_WIDTH_CLASS
                                : LEFT_NAV_CLOSED_WIDTH_CLASS
                            }`}
      > */}
      {/* <Footer /> */}
      {/* </div> */}
    </div>
  );
}
const mockPerformanceData: PerformanceData = {
  kpiData: {
    // Текущи Стойности
    totalAppointments: 450,
    totalRevenue: 28750.55,
    completedAppointments: 380,
    cancelledAppointments: 70,
    averageServicePrice: 75.66,
    clientRetentionRate: 78.5,
    newClientsAcquired: 35,

    // Динамични Промени (Changes)
    changes: {
      // 🟢 Увеличение
      totalAppointments: { value: 15.2, type: "increase" },
      // 🟢 Увеличение
      totalRevenue: { value: 8.7, type: "increase" },
      // 🟡 Неутрална промяна (стойност 0)
      completedAppointments: { value: 0, type: "neutral" },
      cancelledAppointments: { value: 25.0, type: "increase" },
      averageServicePrice: { value: 4.1, type: "decrease" },
      newClientsAcquired: { value: 150.0, type: "increase" },
    },
  },

  // Данни за Графики (Опростени Mock Data)
  appointmentsOverTime: [
    { name: "Mon", total: 65, completed: 50, cancelled: 15 },
    { name: "Tue", total: 72, completed: 68, cancelled: 4 },
    { name: "Wed", total: 80, completed: 75, cancelled: 5 },
    { name: "Thu", total: 55, completed: 45, cancelled: 10 },
    { name: "Fri", total: 90, completed: 85, cancelled: 5 },
    { name: "Sat", total: 88, completed: 80, cancelled: 8 },
  ],
  revenueOverTime: [
    { name: "Jan", value: 5000 },
    { name: "Feb", value: 6500 },
    { name: "Mar", value: 7200 },
    { name: "Apr", value: 8500 },
    { name: "May", value: 9100 },
  ],
  servicePopularity: [
    { name: "Haircut", value: 150 },
    { name: "Coloring", value: 90 },
    { name: "Massage", value: 70 },
    { name: "Facial", value: 50 },
    { name: "Manicure", value: 45 },
  ],
  clientTypes: [
    { name: "Returning Clients", value: 300 },
    { name: "New Clients", value: 100 },
  ],
  appointmentStatus: [
    { name: "Completed", value: 380 },
    { name: "Cancelled", value: 70 },
  ],
  revenueByService: [
    { name: "Haircut", value: 9500 },
    { name: "Coloring", value: 12000 },
    { name: "Massage", value: 4000 },
    { name: "Facial", value: 3250 },
  ],
};
