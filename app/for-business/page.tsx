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
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
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
                    Why Businesses Choose AppointFlow
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
                          that reflects your business's professionalism.
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

      {/* Analytics Section */}
      {/* <section id="analytics" className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <ScrollReveal className="fade-up">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
                Make Decisions Based on Data
              </h2>
            </ScrollReveal>
            <ScrollReveal className="fade-up" delay={100}>
              <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
                Comprehensive analytics dashboard gives you insights into every
                aspect of your business performance
              </p>
            </ScrollReveal>
          </div>

          <ScrollReveal className="fade-in">
            <Card className="overflow-hidden shadow-2xl border-2 mb-12 hover:shadow-3xl transition-shadow duration-500">
              <CardContent className="p-0">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-uOlpWyeG2EK72LpwApFgaAXbD2veiP.png"
                  alt="Analytics dashboard showing revenue charts, appointment metrics, and service popularity"
                  className="w-full h-auto"
                />
              </CardContent>
            </Card>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            <ScrollReveal className="fade-up" delay={100}>
              <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl font-bold text-primary mb-2">
                  78.5%
                </div>
                <div className="text-sm text-muted-foreground">
                  Average Client Retention Rate
                </div>
              </Card>
            </ScrollReveal>
            <ScrollReveal className="fade-up" delay={200}>
              <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl font-bold text-primary mb-2">
                  +150%
                </div>
                <div className="text-sm text-muted-foreground">
                  Revenue Growth in First Year
                </div>
              </Card>
            </ScrollReveal>
            <ScrollReveal className="fade-up" delay={300}>
              <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl font-bold text-primary mb-2">60%</div>
                <div className="text-sm text-muted-foreground">
                  Reduction in No-Shows
                </div>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section> */}
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
      // 🔴 Намаление (показва се като увеличение на %cancelled)
      cancelledAppointments: { value: 25.0, type: "increase" },
      // 🔴 Намаление (цената е паднала)
      averageServicePrice: { value: 4.1, type: "decrease" },
      // 🟢 Голямо увеличение
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
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Badge } from "@/components/ui/badge";
// import {
//   Calendar,
//   Users,
//   TrendingUp,
//   Clock,
//   Bell,
//   CreditCard,
//   BarChart3,
//   Shield,
//   Smartphone,
//   CheckCircle2,
//   ArrowRight,
//   Star,
//   Filter,
//   Mail,
//   UserPlus,
//   CalendarCheck,
//   Table,
//   Settings,
//   PieChart,
//   LineChart,
// } from "lucide-react";
// import Link from "next/link";

// export default function ForBusinessPage() {
//   return (
//     <div className="min-h-screen bg-background">
//       {/* Header */}
//       <header className="border-b border-border bg-card sticky top-0 z-50 backdrop-blur-sm bg-card/95 transition-all">
//         <div className="container mx-auto px-4 py-4 flex items-center justify-between">
//           <Link
//             href="/"
//             className="flex items-center gap-2 hover:opacity-80 transition-opacity"
//           >
//             <Calendar className="h-6 w-6 text-primary" />
//             <span className="text-xl font-semibold font-sans">BookEase</span>
//           </Link>
//           <nav className="hidden md:flex items-center gap-6">
//             <a
//               href="#features"
//               className="text-sm text-muted-foreground hover:text-foreground transition-colors"
//             >
//               Features
//             </a>
//             <a
//               href="#pricing"
//               className="text-sm text-muted-foreground hover:text-foreground transition-colors"
//             >
//               Pricing
//             </a>
//             <a
//               href="#testimonials"
//               className="text-sm text-muted-foreground hover:text-foreground transition-colors"
//             >
//               Testimonials
//             </a>
//             <Link
//               href="/"
//               className="text-sm text-muted-foreground hover:text-foreground transition-colors"
//             >
//               For Clients
//             </Link>
//           </nav>
//         </div>
//       </header>

//       {/* Hero Image Section */}
//       <section className="relative h-[400px] md:h-[500px] overflow-hidden">
//         <img
//           src="/business-owner-managing-appointments-on-tablet-in-.jpg"
//           alt="Business management"
//           className="w-full h-full object-cover"
//         />
//         <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
//       </section>

//       {/* Hero Section */}
//       <section className="relative -mt-64 md:-mt-80 py-20 md:py-32">
//         <div className="container mx-auto px-4">
//           <div className="max-w-4xl mx-auto text-center">
//             <Badge className="mb-6 bg-primary text-primary-foreground animate-in fade-in slide-in-from-bottom-4 duration-700">
//               For Business Owners
//             </Badge>
//             <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance font-sans animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
//               Grow your business with smart appointment management
//             </h1>
//             <p className="text-lg md:text-xl text-muted-foreground mb-8 text-balance leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
//               Join thousands of businesses using BookEase to automate
//               scheduling, reduce no-shows, and attract new clients. Start your
//               free trial today.
//             </p>
//             <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
//               <Button
//                 size="lg"
//                 className="text-lg px-8 hover:scale-105 transition-transform"
//               >
//                 Start Free Trial
//                 <ArrowRight className="h-5 w-5 ml-2" />
//               </Button>
//               <Button
//                 size="lg"
//                 variant="outline"
//                 className="text-lg px-8 bg-transparent hover:scale-105 transition-transform"
//               >
//                 Watch Demo
//               </Button>
//             </div>
//             <p className="text-sm text-muted-foreground mt-4 animate-in fade-in duration-700 delay-700">
//               No credit card required • 14-day free trial
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* Stats Section */}
//       <section className="py-16 border-y border-border bg-card">
//         <div className="container mx-auto px-4">
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
//             <div className="text-center hover:scale-105 transition-transform">
//               <div className="text-4xl font-bold text-primary mb-2 font-sans">
//                 10K+
//               </div>
//               <div className="text-sm text-muted-foreground">
//                 Active Businesses
//               </div>
//             </div>
//             <div className="text-center hover:scale-105 transition-transform">
//               <div className="text-4xl font-bold text-primary mb-2 font-sans">
//                 2M+
//               </div>
//               <div className="text-sm text-muted-foreground">
//                 Appointments Booked
//               </div>
//             </div>
//             <div className="text-center hover:scale-105 transition-transform">
//               <div className="text-4xl font-bold text-primary mb-2 font-sans">
//                 40%
//               </div>
//               <div className="text-sm text-muted-foreground">
//                 Fewer No-Shows
//               </div>
//             </div>
//             <div className="text-center hover:scale-105 transition-transform">
//               <div className="text-4xl font-bold text-primary mb-2 font-sans">
//                 4.9★
//               </div>
//               <div className="text-sm text-muted-foreground">
//                 Average Rating
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section id="features" className="py-20 bg-background">
//         <div className="container mx-auto px-4">
//           <div className="text-center mb-16">
//             <h2 className="text-3xl md:text-5xl font-bold mb-4 font-sans">
//               Complete appointment management platform
//             </h2>
//             <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
//               Everything you need to manage appointments, staff, and grow your
//               business
//             </p>
//           </div>

//           {/* Appointment Management */}
//           <div className="mb-20">
//             <div className="text-center mb-12">
//               <h3 className="text-2xl md:text-3xl font-bold mb-4 font-sans">
//                 Powerful Appointment Management
//               </h3>
//               <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
//                 Track, filter, and manage all your appointments in one place
//               </p>
//             </div>

//             {/* Feature Images */}
//             <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-6xl mx-auto">
//               <div className="rounded-xl overflow-hidden shadow-xl border border-border hover:scale-[1.02] transition-transform duration-300">
//                 <img
//                   src="/modern-appointment-calendar-interface-with-color-c.jpg"
//                   alt="Calendar view of appointments"
//                   className="w-full h-auto"
//                 />
//               </div>
//               <div className="rounded-xl overflow-hidden shadow-xl border border-border hover:scale-[1.02] transition-transform duration-300">
//                 <img
//                   src="/appointment-table-view-with-filters-status-columns.jpg"
//                   alt="Table view of appointments with filters"
//                   className="w-full h-auto"
//                 />
//               </div>
//             </div>

//             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
//               {[
//                 {
//                   icon: Calendar,
//                   title: "Calendar View",
//                   description:
//                     "Visualize all appointments in an intuitive calendar interface. See your entire schedule at a glance with color-coded appointments.",
//                 },
//                 {
//                   icon: Table,
//                   title: "Table View",
//                   description:
//                     "Switch to table view for detailed appointment lists. Sort, search, and manage appointments with powerful filtering options.",
//                 },
//                 {
//                   icon: Filter,
//                   title: "Advanced Filters",
//                   description:
//                     "Filter appointments by date, staff member, service type, status, and more. Find exactly what you need instantly.",
//                 },
//                 {
//                   icon: Bell,
//                   title: "Real-Time Notifications",
//                   description:
//                     "Get instant notifications when clients book appointments. Never miss a booking request with push and email alerts.",
//                 },
//                 {
//                   icon: CalendarCheck,
//                   title: "Appointment Confirmation",
//                   description:
//                     "Staff can review and confirm appointment requests. Maintain control over your schedule with approval workflows.",
//                 },
//                 {
//                   icon: Mail,
//                   title: "Automatic Email Confirmations",
//                   description:
//                     "Clients receive professional email confirmations after staff approval. Reduce confusion and no-shows with clear communication.",
//                 },
//               ].map((feature, index) => {
//                 const Icon = feature.icon;
//                 return (
//                   <Card
//                     key={index}
//                     className="border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
//                   >
//                     <CardContent className="p-6">
//                       <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4 transition-transform hover:scale-110">
//                         <Icon className="h-6 w-6" />
//                       </div>
//                       <h3 className="text-xl font-semibold mb-2 font-sans">
//                         {feature.title}
//                       </h3>
//                       <p className="text-muted-foreground leading-relaxed">
//                         {feature.description}
//                       </p>
//                     </CardContent>
//                   </Card>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Staff & Schedule Management */}
//           <div className="mb-20">
//             <div className="text-center mb-12">
//               <h3 className="text-2xl md:text-3xl font-bold mb-4 font-sans">
//                 Staff & Schedule Management
//               </h3>
//               <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
//                 Coordinate your team and manage schedules effortlessly
//               </p>
//             </div>

//             {/* Feature Images */}
//             <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-6xl mx-auto">
//               <div className="rounded-xl overflow-hidden shadow-xl border border-border hover:scale-[1.02] transition-transform duration-300">
//                 <img
//                   src="/staff-management-dashboard-with-team-members-profi.jpg"
//                   alt="Staff management interface"
//                   className="w-full h-auto"
//                 />
//               </div>
//               <div className="rounded-xl overflow-hidden shadow-xl border border-border hover:scale-[1.02] transition-transform duration-300">
//                 <img
//                   src="/weekly-schedule-calendar-showing-staff-availabilit.jpg"
//                   alt="Staff schedule management"
//                   className="w-full h-auto"
//                 />
//               </div>
//             </div>

//             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
//               {[
//                 {
//                   icon: UserPlus,
//                   title: "Add Staff Members",
//                   description:
//                     "Easily add and manage staff users. Assign roles, permissions, and service capabilities to each team member.",
//                 },
//                 {
//                   icon: Clock,
//                   title: "Business Schedule",
//                   description:
//                     "Set your business operating hours, holidays, and break times. Define when your business is available for bookings.",
//                 },
//                 {
//                   icon: Settings,
//                   title: "Individual Staff Schedules",
//                   description:
//                     "Each staff member can edit their own availability. Manage personal time off and working hours independently.",
//                 },
//                 {
//                   icon: Users,
//                   title: "Team Coordination",
//                   description:
//                     "View all staff schedules in one place. Coordinate team availability and prevent scheduling conflicts.",
//                 },
//                 {
//                   icon: Shield,
//                   title: "Role-Based Access",
//                   description:
//                     "Control what each staff member can see and do. Protect sensitive business information with permission levels.",
//                 },
//                 {
//                   icon: Smartphone,
//                   title: "Mobile Staff Access",
//                   description:
//                     "Staff can manage their schedules and appointments from anywhere using the mobile app.",
//                 },
//               ].map((feature, index) => {
//                 const Icon = feature.icon;
//                 return (
//                   <Card
//                     key={index}
//                     className="border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
//                   >
//                     <CardContent className="p-6">
//                       <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4 transition-transform hover:scale-110">
//                         <Icon className="h-6 w-6" />
//                       </div>
//                       <h3 className="text-xl font-semibold mb-2 font-sans">
//                         {feature.title}
//                       </h3>
//                       <p className="text-muted-foreground leading-relaxed">
//                         {feature.description}
//                       </p>
//                     </CardContent>
//                   </Card>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Performance Tracking */}
//           <div>
//             <div className="text-center mb-12">
//               <h3 className="text-2xl md:text-3xl font-bold mb-4 font-sans">
//                 Performance Tracking & Analytics
//               </h3>
//               <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
//                 Make data-driven decisions with comprehensive analytics
//               </p>
//             </div>

//             {/* Analytics Dashboard Image */}
//             <div className="mb-12 max-w-6xl mx-auto rounded-xl overflow-hidden shadow-2xl border border-border hover:scale-[1.02] transition-transform duration-500">
//               <img
//                 src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-10-05%20115659-5ANW40Z80wjv5FQls3V9pCkRfU3XFs.png"
//                 alt="Performance analytics dashboard with charts and metrics"
//                 className="w-full h-auto"
//               />
//             </div>

//             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
//               {[
//                 {
//                   icon: BarChart3,
//                   title: "Business Performance",
//                   description:
//                     "Track overall business metrics including total appointments, revenue, client retention, and growth trends.",
//                 },
//                 {
//                   icon: PieChart,
//                   title: "Staff Performance",
//                   description:
//                     "Monitor individual staff performance. See appointments completed, revenue generated, and client ratings per staff member.",
//                 },
//                 {
//                   icon: Filter,
//                   title: "Flexible Time Periods",
//                   description:
//                     "Filter analytics by day, week, month, quarter, or custom date ranges. Compare performance across different periods.",
//                 },
//                 {
//                   icon: LineChart,
//                   title: "Revenue Tracking",
//                   description:
//                     "Visualize revenue trends over time. Track income by service type, staff member, and time period.",
//                 },
//                 {
//                   icon: TrendingUp,
//                   title: "Growth Insights",
//                   description:
//                     "Identify trends and opportunities. See which services are most popular and when your busiest times are.",
//                 },
//                 {
//                   icon: CreditCard,
//                   title: "Financial Reports",
//                   description:
//                     "Generate detailed financial reports for accounting and tax purposes. Export data for further analysis.",
//                 },
//               ].map((feature, index) => {
//                 const Icon = feature.icon;
//                 return (
//                   <Card
//                     key={index}
//                     className="border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
//                   >
//                     <CardContent className="p-6">
//                       <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4 transition-transform hover:scale-110">
//                         <Icon className="h-6 w-6" />
//                       </div>
//                       <h3 className="text-xl font-semibold mb-2 font-sans">
//                         {feature.title}
//                       </h3>
//                       <p className="text-muted-foreground leading-relaxed">
//                         {feature.description}
//                       </p>
//                     </CardContent>
//                   </Card>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* How It Works */}
//       <section className="py-20 bg-secondary/20">
//         <div className="container mx-auto px-4">
//           <div className="text-center mb-16">
//             <h2 className="text-3xl md:text-5xl font-bold mb-4 font-sans">
//               Grow your business with BookEase
//             </h2>
//             <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
//               Powerful analytics and insights to help you make data-driven
//               decisions
//             </p>
//           </div>

//           {/* Dashboard Preview Image */}
//           <div className="max-w-6xl mx-auto mb-16 rounded-xl overflow-hidden shadow-2xl border border-border hover:scale-[1.02] transition-transform duration-500">
//             <img
//               src="/images/design-mode/Screenshot%202025-10-05%20115659.png"
//               alt="BookEase Business Dashboard Analytics"
//               className="w-full h-auto"
//             />
//           </div>

//           <div className="text-center mb-12">
//             <h3 className="text-2xl md:text-3xl font-bold mb-4 font-sans">
//               Get started in minutes
//             </h3>
//             <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
//               Simple setup process to get your business online
//             </p>
//           </div>

//           <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
//             {[
//               {
//                 step: "1",
//                 title: "Create Your Profile",
//                 description:
//                   "Add your business details, services, and staff information in just a few clicks.",
//               },
//               {
//                 step: "2",
//                 title: "Set Your Availability",
//                 description:
//                   "Configure your working hours, break times, and booking preferences.",
//               },
//               {
//                 step: "3",
//                 title: "Start Accepting Bookings",
//                 description:
//                   "Share your booking page and start receiving appointments immediately.",
//               },
//             ].map((step, index) => (
//               <div
//                 key={index}
//                 className="text-center hover:scale-105 transition-transform duration-300"
//               >
//                 <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4 font-sans hover:shadow-lg transition-shadow">
//                   {step.step}
//                 </div>
//                 <h3 className="text-xl font-semibold mb-2 font-sans">
//                   {step.title}
//                 </h3>
//                 <p className="text-muted-foreground leading-relaxed">
//                   {step.description}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Pricing Section */}
//       <section id="pricing" className="py-20 bg-background">
//         <div className="container mx-auto px-4">
//           <div className="text-center mb-16">
//             <h2 className="text-3xl md:text-5xl font-bold mb-4 font-sans">
//               Simple, transparent pricing
//             </h2>
//             <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
//               Choose the plan that fits your business needs
//             </p>
//           </div>

//           <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
//             {[
//               {
//                 name: "Starter",
//                 price: "$29",
//                 period: "/month",
//                 description:
//                   "Perfect for solo practitioners and small businesses",
//                 features: [
//                   "Up to 100 appointments/month",
//                   "1 staff member",
//                   "Online booking page",
//                   "Email reminders",
//                   "Basic analytics",
//                   "Mobile app access",
//                 ],
//                 popular: false,
//               },
//               {
//                 name: "Professional",
//                 price: "$79",
//                 period: "/month",
//                 description: "Ideal for growing businesses with multiple staff",
//                 features: [
//                   "Unlimited appointments",
//                   "Up to 5 staff members",
//                   "Custom booking page",
//                   "SMS & email reminders",
//                   "Advanced analytics",
//                   "Payment processing",
//                   "Priority support",
//                 ],
//                 popular: true,
//               },
//               {
//                 name: "Enterprise",
//                 price: "$199",
//                 period: "/month",
//                 description: "For large businesses with advanced needs",
//                 features: [
//                   "Everything in Professional",
//                   "Unlimited staff members",
//                   "Multiple locations",
//                   "API access",
//                   "Custom integrations",
//                   "Dedicated account manager",
//                   "White-label options",
//                 ],
//                 popular: false,
//               },
//             ].map((plan, index) => (
//               <Card
//                 key={index}
//                 className={`relative hover:scale-105 transition-all duration-300 ${
//                   plan.popular
//                     ? "border-2 border-primary shadow-lg"
//                     : "border-border hover:shadow-lg"
//                 }`}
//               >
//                 {plan.popular && (
//                   <div className="absolute -top-4 left-1/2 -translate-x-1/2">
//                     <Badge className="bg-primary text-primary-foreground px-4 py-1">
//                       Most Popular
//                     </Badge>
//                   </div>
//                 )}
//                 <CardContent className="p-8">
//                   <h3 className="text-2xl font-bold mb-2 font-sans">
//                     {plan.name}
//                   </h3>
//                   <p className="text-sm text-muted-foreground mb-6">
//                     {plan.description}
//                   </p>
//                   <div className="mb-6">
//                     <span className="text-4xl font-bold font-sans">
//                       {plan.price}
//                     </span>
//                     <span className="text-muted-foreground">{plan.period}</span>
//                   </div>
//                   <Button
//                     className="w-full mb-6 hover:scale-105 transition-transform"
//                     variant={plan.popular ? "default" : "outline"}
//                   >
//                     Start Free Trial
//                   </Button>
//                   <ul className="space-y-3">
//                     {plan.features.map((feature, featureIndex) => (
//                       <li
//                         key={featureIndex}
//                         className="flex items-start gap-2 text-sm"
//                       >
//                         <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
//                         <span>{feature}</span>
//                       </li>
//                     ))}
//                   </ul>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Testimonials */}
//       <section id="testimonials" className="py-20 bg-secondary/20">
//         <div className="container mx-auto px-4">
//           <div className="text-center mb-16">
//             <h2 className="text-3xl md:text-5xl font-bold mb-4 font-sans">
//               Loved by business owners
//             </h2>
//             <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
//               See what our customers have to say about BookEase
//             </p>
//           </div>

//           <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
//             {[
//               {
//                 name: "Sarah Martinez",
//                 business: "Luxe Hair Salon",
//                 quote:
//                   "BookEase has transformed how we manage appointments. We've seen a 40% reduction in no-shows and our clients love the convenience.",
//                 rating: 5,
//               },
//               {
//                 name: "Dr. James Chen",
//                 business: "Bright Smile Dental",
//                 quote:
//                   "The automated reminders and easy rescheduling have saved us countless hours. Our front desk staff can now focus on patient care.",
//                 rating: 5,
//               },
//               {
//                 name: "Emily Rodriguez",
//                 business: "Serenity Spa",
//                 quote:
//                   "We've attracted so many new clients through the platform. The analytics help us understand our business better and make smarter decisions.",
//                 rating: 5,
//               },
//             ].map((testimonial, index) => (
//               <Card
//                 key={index}
//                 className="border-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
//               >
//                 <CardContent className="p-6">
//                   <div className="flex gap-1 mb-4">
//                     {Array.from({ length: testimonial.rating }).map((_, i) => (
//                       <Star
//                         key={i}
//                         className="h-5 w-5 fill-primary text-primary"
//                       />
//                     ))}
//                   </div>
//                   <p className="text-muted-foreground mb-4 leading-relaxed">
//                     {testimonial.quote}
//                   </p>
//                   <div>
//                     <p className="font-semibold font-sans">
//                       {testimonial.name}
//                     </p>
//                     <p className="text-sm text-muted-foreground">
//                       {testimonial.business}
//                     </p>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="py-20 bg-gradient-to-br from-primary/10 via-accent/5 to-background">
//         <div className="container mx-auto px-4">
//           <Card className="max-w-4xl mx-auto border-2 border-primary/20 hover:shadow-2xl transition-shadow duration-300">
//             <CardContent className="p-8 md:p-12">
//               <div className="text-center mb-8">
//                 <h2 className="text-3xl md:text-4xl font-bold mb-4 font-sans">
//                   Ready to grow your business?
//                 </h2>
//                 <p className="text-lg text-muted-foreground">
//                   Start your 14-day free trial today. No credit card required.
//                 </p>
//               </div>

//               <form className="max-w-md mx-auto space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="business-name">Business Name</Label>
//                   <Input
//                     id="business-name"
//                     placeholder="Enter your business name"
//                     className="transition-all focus:scale-[1.02]"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="email">Email Address</Label>
//                   <Input
//                     id="email"
//                     type="email"
//                     placeholder="you@business.com"
//                     className="transition-all focus:scale-[1.02]"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="phone">Phone Number</Label>
//                   <Input
//                     id="phone"
//                     type="tel"
//                     placeholder="(555) 123-4567"
//                     className="transition-all focus:scale-[1.02]"
//                   />
//                 </div>
//                 <Button
//                   className="w-full hover:scale-105 transition-transform"
//                   size="lg"
//                 >
//                   Start Free Trial
//                   <ArrowRight className="h-5 w-5 ml-2" />
//                 </Button>
//                 <p className="text-xs text-center text-muted-foreground">
//                   By signing up, you agree to our Terms of Service and Privacy
//                   Policy
//                 </p>
//               </form>
//             </CardContent>
//           </Card>
//         </div>
//       </section>
//     </div>
//   );
// }
