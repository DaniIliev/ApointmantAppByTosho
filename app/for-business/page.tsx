"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/scroll-reveal";
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
} from "lucide-react";
import { KPICard } from "@/components/performance/KPICard";
import { PerformanceChart } from "@/components/performance/PerformanceChart";
import { PerformanceData } from "../performance/page";
import { usePaddingControl } from "@/context/PaddingContext";
import { useEffect } from "react";
import { BenefitsSection } from "@/components/sections/benefits-section";

export default function BusinessLandingPage() {
  const { setRemovePadding } = usePaddingControl();
  useEffect(() => {
    setRemovePadding(true);
    return () => {
      setRemovePadding(false);
    };
  }, [setRemovePadding]);
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-background/95 z-10" />
          <img
            src="/image.png"
            alt="Background"
            className="w-full h-full object-cover animate-subtle-zoom"
          />
        </div>

        {/* Animated Gradient Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float-delayed" />

        {/* Content */}
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <ScrollReveal className="fade-up" delay={200}>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance text-white drop-shadow-lg">
                Transform Your Business with Smart Appointment Management
              </h1>
            </ScrollReveal>
            <ScrollReveal className="fade-up" delay={300}>
              <p className="text-xl md:text-2xl text-white/95 text-balance max-w-3xl mx-auto drop-shadow-md">
                Streamline scheduling, empower your team, and grow your business
                with our all-in-one appointment platform designed for modern
                service businesses.
              </p>
            </ScrollReveal>
            <ScrollReveal className="fade-up" delay={400}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 hover:scale-105 transition-transform shadow-xl"
                >
                  Start Free Trial
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary hover:scale-105 transition-all shadow-xl"
                >
                  Watch Demo
                </Button>
              </div>
            </ScrollReveal>
            <ScrollReveal className="fade-up" delay={500}>
              <p className="text-sm text-white/90">
                No credit card required • 14-day free trial
              </p>
            </ScrollReveal>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/70 rounded-full animate-scroll" />
          </div>
        </div>
      </section>

      <BenefitsSection type="feature" />

      {/* Benefits Section */}
      <section id="benefits" className="bg-muted/30 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <ScrollReveal className="slide-right">
                <div className="space-y-8">
                  <h2 className="text-4xl md:text-5xl font-bold text-balance">
                    Why Businesses Choose AppointDI
                  </h2>
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          Save Time & Reduce No-Shows
                        </h3>
                        <p className="text-muted-foreground">
                          Automated notifications and confirmations reduce
                          no-shows by up to 60%, saving you time and money.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <TrendingUp className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          Increase Revenue
                        </h3>
                        <p className="text-muted-foreground">
                          Fill more appointment slots, track popular services,
                          and optimize pricing based on real performance data.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          Empower Your Team
                        </h3>
                        <p className="text-muted-foreground">
                          Give staff members control over their schedules and
                          appointments while maintaining business oversight.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <Shield className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          Professional & Reliable
                        </h3>
                        <p className="text-muted-foreground">
                          Provide clients with a seamless booking experience
                          that reflects your business&apos;s professionalism.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal className="slide-left">
                <div className="space-y-6">
                  <Card className="overflow-hidden shadow-xl border-2 hover:shadow-2xl transition-shadow duration-500">
                    <CardContent className="p-0">
                      <img
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-uOlpWyeG2EK72LpwApFgaAXbD2veiP.png"
                        alt="Performance analytics dashboard with charts and metrics"
                        className="w-full h-auto"
                      />
                    </CardContent>
                  </Card>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>
      {/* New Analytics & Insights Section with Charts */}
      <section
        id="analytics"
        className="container mx-auto px-4 py-20 md:py-32 bg-background"
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            {/* ScrollReveal е запазен, ако го ползвате, иначе може да се премахне */}
            <ScrollReveal className="fade-up">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-primary text-balance">
                {/* Променено за по-голямо въздействие */}
                Отключете Силата на Данните 🚀
              </h2>
            </ScrollReveal>
            <ScrollReveal className="fade-up" delay={100}>
              <p className="text-xl text-muted-foreground text-balance max-w-3xl mx-auto">
                Преобразете операциите си с прецизни данни за приходи,
                популярност на услугите и ангажираност на клиентите – всичко в
                един интуитивен дашборд.
              </p>
            </ScrollReveal>
          </div>

          {/* KPI Grid (Използваме KPICard от предоставения код) */}
          {/* Използвам 'mockPerformanceData' за демонстрация на данните */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <ScrollReveal className="fade-up" delay={200}>
              <KPICard
                title="Общ Брой Записани Часове"
                value={mockPerformanceData.kpiData.totalAppointments}
                change={mockPerformanceData.kpiData.changes.totalAppointments}
                icon={<Calendar />}
                className="shadow-xl" // Добавяме стил
              />
            </ScrollReveal>
            <ScrollReveal className="fade-up" delay={300}>
              <KPICard
                title="Общи Приходи"
                value={`$${mockPerformanceData.kpiData.totalRevenue.toLocaleString()}`}
                change={mockPerformanceData.kpiData.changes.totalRevenue}
                icon={<DollarSign />}
                className="shadow-xl"
              />
            </ScrollReveal>
            <ScrollReveal className="fade-up" delay={400}>
              <KPICard
                title="Процент Задържане на Клиенти"
                value={`${mockPerformanceData.kpiData.clientRetentionRate.toFixed(
                  1
                )}%`}
                icon={<Users />}
                className="shadow-xl"
              />
            </ScrollReveal>
            <ScrollReveal className="fade-up" delay={500}>
              <KPICard
                title="Намаляване на Неявилите се"
                // За демо целите, показваме обратна логика на "Cancelled/No-Show"
                value={`60%`}
                // Може да не подаваме "change" или да създадем нов mock за този KPI
                icon={<CheckCircle />}
                className="shadow-xl"
              />
            </ScrollReveal>
          </div>

          {/* Charts Grid */}
          <div className="space-y-8">
            {/* Appointments & Revenue Over Time (Линейни графики) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ScrollReveal className="fade-in" delay={600}>
                <PerformanceChart
                  title="Записани Часове по Време"
                  data={mockPerformanceData.appointmentsOverTime}
                  type="line"
                  dataKeys={["total", "completed", "cancelled"]}
                  xAxisKey="name"
                  colors={["#3b61c0", "#22c55e", "#ef4444"]}
                />
              </ScrollReveal>
              <ScrollReveal className="fade-in" delay={700}>
                <PerformanceChart
                  title="Тенденции в Приходите"
                  data={mockPerformanceData.revenueOverTime}
                  type="line"
                  dataKey="value"
                  xAxisKey="name"
                  colors={["#00bfff"]}
                />
              </ScrollReveal>
            </div>

            {/* Popularity & Revenue by Service (Стълбовидни графики) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ScrollReveal className="fade-in" delay={800}>
                <PerformanceChart
                  title="Популярност на Услугите"
                  data={mockPerformanceData.servicePopularity}
                  type="bar"
                  dataKey="value"
                  xAxisKey="name"
                />
              </ScrollReveal>
              <ScrollReveal className="fade-in" delay={900}>
                <PerformanceChart
                  title="Приходи по Категории Услуги"
                  data={mockPerformanceData.revenueByService}
                  type="bar"
                  dataKey="value"
                  xAxisKey="name"
                  colors={["#f59e0b"]}
                />
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>
      <section id="pricing" className="bg-muted/30 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <ScrollReveal className="fade-up">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
                  Simple, Transparent Pricing
                </h2>
              </ScrollReveal>
              <ScrollReveal className="fade-up" delay={100}>
                <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
                  Choose the perfect plan for your business. All plans include a
                  14-day free trial.
                </p>
              </ScrollReveal>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <ScrollReveal className="fade-up" delay={100}>
                <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <CardContent className="p-8 space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">Starter</h3>
                      <p className="text-muted-foreground">
                        Perfect for small businesses
                      </p>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold">$29</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm">Up to 3 staff members</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm">Unlimited appointments</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm">Calendar & table views</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm">Email notifications</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm">Basic analytics</span>
                      </li>
                    </ul>
                    <Button className="w-full bg-transparent" variant="outline">
                      Start Free Trial
                    </Button>
                  </CardContent>
                </Card>
              </ScrollReveal>

              <ScrollReveal className="fade-up" delay={200}>
                <Card className="border-2 border-primary shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                  <CardContent className="p-8 space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">Professional</h3>
                      <p className="text-muted-foreground">
                        For growing businesses
                      </p>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold">$79</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm">Up to 10 staff members</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm">Unlimited appointments</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm">All view options</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm">
                          SMS & email notifications
                        </span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm">Advanced analytics</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm">Custom branding</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm">Priority support</span>
                      </li>
                    </ul>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      Start Free Trial
                    </Button>
                  </CardContent>
                </Card>
              </ScrollReveal>

              <ScrollReveal className="fade-up" delay={300}>
                <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <CardContent className="p-8 space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                      <p className="text-muted-foreground">
                        For large organizations
                      </p>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold">$199</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm">Unlimited staff members</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm">Unlimited appointments</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm">All features included</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm">Multi-location support</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm">API access</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm">
                          Dedicated account manager
                        </span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm">24/7 phone support</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm">Custom integrations</span>
                      </li>
                    </ul>
                    <Button className="w-full bg-transparent" variant="outline">
                      Contact Sales
                    </Button>
                  </CardContent>
                </Card>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <ScrollReveal className="fade-up">
              <h2 className="text-4xl md:text-5xl font-bold text-balance">
                Ready to Transform Your Business?
              </h2>
            </ScrollReveal>
            <ScrollReveal className="fade-up" delay={100}>
              <p className="text-xl text-primary-foreground/90 text-balance">
                Join thousands of businesses that have streamlined their
                operations and increased revenue with AppointFlow
              </p>
            </ScrollReveal>
            <ScrollReveal className="fade-up" delay={200}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8 py-6 hover:scale-105 transition-transform"
                >
                  Start Free Trial
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary hover:scale-105 transition-all"
                >
                  Schedule a Demo
                </Button>
              </div>
            </ScrollReveal>
            <ScrollReveal className="fade-up" delay={300}>
              <p className="text-sm text-primary-foreground/80">
                14-day free trial • No credit card required • Cancel anytime
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>
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
