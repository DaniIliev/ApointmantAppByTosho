"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Users,
  BarChart3,
  Palette,
  CheckCircle2,
  TrendingUp,
  Zap,
  Shield,
  Check,
  ArrowRight,
  QrCode,
  Smartphone,
  MessageSquare,
  Bell,
  CalendarCheck,
  Phone,
  ListChecks,
} from "lucide-react";
import { usePaddingControl } from "@/context/PaddingContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import PricingSection from "@/components/Pricing/PricingSection";
import { useTranslation } from "react-i18next";
import { AnalyticsPreview } from "@/components/for-business/AnalyticsPreview";
import { KanbanPreview } from "@/components/for-business/KanbanPreview";
import { CalendarPreview } from "@/components/for-business/CalendarPreview";
import { LocationCard } from "@/components/business/LocationCard";

export default function BusinessLandingPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { setRemovePadding } = usePaddingControl();

  useEffect(() => {
    setRemovePadding(true);
    return () => {
      setRemovePadding(false);
    };
  }, [setRemovePadding]);
  return (
    <div>
      <section className="relative overflow-hidden py-16">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-background to-background" />
        <div className="absolute inset-0 -z-10 opacity-40 [background-image:radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.18)_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="absolute -left-16 top-0 -z-10 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-0 top-20 -z-10 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -z-10 h-40 w-[32rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center relative">
            <div className="absolute left-1/2 top-0 -z-10 h-56 w-56 -translate-x-1/2 rounded-full bg-white/50 blur-3xl dark:bg-white/5" />

            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/80 px-4 py-2 shadow-sm backdrop-blur mb-4">
              <span className="theme-logo-mask" aria-hidden="true" />
              <span className="text-sm font-semibold text-primary">
                AppointDI
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-5xl font-bold tracking-tight text-text-primary mb-4">
              {t("Smart Scheduling for Multi‑Location Businesses")}
            </h1>

            <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
              {t(
                "Manage staff, services and bookings across multiple locations — all from one account.",
              )}
            </p>

            <div className="flex items-center justify-center gap-3">
              <Button size="default" onClick={() => router.push("/register")}>
                {t("Get started")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Mock Locations Promo */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <h2 className="text-4xl sm:text-5xl font-bold">
              {t("Multiple locations, one dashboard")}
            </h2>
            <p className="text-base text-muted-foreground mt-4">
              {t(
                "Create locations for every branch — staff, services and opening hours are managed centrally.",
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {[
              {
                _id: "mock-1",
                name: "Central Salon",
                address: "",
                city: "Sofia",
                country: "Bulgaria",
                imageUrl: "",
              },
              {
                _id: "mock-3",
                name: "Beachside Barber",
                address: "",
                city: "Varna",
                country: "Bulgaria",
                imageUrl: "",
              },
            ].map((loc) => (
              <div key={loc._id} onClick={() => router.push("/register")}>
                <LocationCard location={loc} showActions={false} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features for Beauty Salons */}

      <section className="bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center space-y-4">
            <h2 className="text-4xl sm:text-5xl md:text-5xl font-bold text-balance">
              {t("Everything Clients And Staff Need")}
            </h2>
            <p className="text-base text-muted-foreground max-w-3xl mx-auto">
              {t(
                "Booking via link, QR in the salon, or directly from the phone — with a helpful AI assistant.",
              )}
            </p>
          </div>

          {/* Booking methods & client tools (non-uniform presentation) */}
          <div className="mt-8 grid lg:grid-cols-2  gap-8 items-center justify-center">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <QrCode className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">{t("Book via QR or Link")}</h3>
                  <p className="text-base text-muted-foreground">
                    {t(
                      "Clients book from a shared link or by scanning a QR code displayed in your salon.",
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Smartphone className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">{t("Mobile Friendly")}</h3>
                  <p className="text-base text-muted-foreground">
                    {t(
                      "Optimized for phones, so clients quickly pick a service and a free slot.",
                    )}
                  </p>
                </div>
              </div>
              {/* <div className="flex items-start gap-3">
                <MessageSquare className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">{t("AI Chatbot Help")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t(
                      "Guides clients with questions, services, and finding a suitable time.",
                    )}
                  </p>
                </div>
              </div> */}
            </div>
            {/* Interactive public page preview */}
            {/* <div className="mx-auto w-full max-w-2xl">
              <PublicPagePreview />
            </div> */}
          </div>

          {/* Process & operations strip */}
          <div className="mt-10 rounded-lg bg-primary/5 border border-primary/20 p-5">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start gap-2">
                <CalendarCheck className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-base font-semibold">
                    {t("Client Portal")}
                  </p>
                  <p className="text-base text-muted-foreground">
                    {t("Clients review bookings and cancel on their own.")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Bell className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-base font-semibold">
                    {t("Notifications & Approvals")}
                  </p>
                  <p className="text-base text-muted-foreground">
                    {t("Get notified, approve or decline appointments.")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Zap className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-base font-semibold">
                    {t("Automatic Reminders")}
                  </p>
                  <p className="text-base text-muted-foreground">
                    {t("Reduce missed visits with timely reminders.")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Team & services (split layout) */}
          <div className="mt-12 grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Users className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">
                    {t("Multiple Staff & Schedules")}
                  </h3>
                  <p className="text-base text-muted-foreground">
                    {t(
                      "Add many staff members with their own working hours and breaks.",
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">
                    {t("Services Assigned To Staff")}
                  </h3>
                  <p className="text-base text-muted-foreground">
                    {t(
                      "Create services and assign them to specific staff members.",
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ListChecks className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">
                    {t("Centralized Appointment Management")}
                  </h3>
                  <p className="text-base text-muted-foreground">
                    {t(
                      "Manage all bookings in one place—create, review, approve or decline.",
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">
                    {t("Staff Can Book For Clients")}
                  </h3>
                  <p className="text-base text-muted-foreground">
                    {t(
                      "Take bookings on behalf of clients when they call or visit the salon.",
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BarChart3 className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">{t("Analytics")}</h3>
                  <p className="text-base text-muted-foreground">
                    {t(
                      "See popular services, staff workload, and trends over time.",
                    )}
                  </p>
                </div>
              </div>
            </div>
            {/* Interactive Calendar Preview */}
            <div className="mx-auto w-full">
              <CalendarPreview />
            </div>
          </div>
        </div>
      </section>
      {/* Analytics & Performance Module Section */}
      <section className="bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                {t("Visualize Your Business Performance")}
              </h2>
              <p className="text-base text-muted-foreground text-balance max-w-3xl mx-auto">
                {t(
                  "Create custom analytics dashboards with drag-and-drop charts. Build the perfect view of your business data with our flexible, responsive grid layout.",
                )}
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold mb-2">
                      {t("Customizable Chart Types")}
                    </h3>
                    <p className="text-base text-muted-foreground">
                      {t(
                        "Choose from line, bar, pie, and combined charts. Visualize appointments, revenue, services, and more with your preferred chart style.",
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <Palette className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold mb-2">
                      {t("Drag & Drop Grid Layout")}
                    </h3>
                    <p className="text-base text-muted-foreground">
                      {t(
                        "Arrange your dashboard exactly how you want. Resize and reposition charts with intuitive drag-and-drop. Your layout automatically adapts to mobile devices.",
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold mb-2">
                      {t("Real-Time KPI Cards")}
                    </h3>
                    <p className="text-base text-muted-foreground">
                      {t(
                        "Track key metrics at a glance with live KPI cards. Monitor total appointments, revenue, client retention, and more with automatic change indicators.",
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold mb-2">
                      {t("Filter by Date & Staff")}
                    </h3>
                    <p className="text-base text-muted-foreground">
                      {t(
                        "Analyze data by custom date ranges or individual staff members. Get the insights that matter most to your business decisions.",
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <AnalyticsPreview />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto text-center space-y-6">
            <h2 className="max-w-5xl text-4xl sm:text-5xl md:text-5xl align-center font-bold text-balance mb-10 mx-auto">
              {t("Organize work easily with Kanban")}
            </h2>
            {/* Kanban Board Interactive Preview */}
            <div className="flex justify-center mb-6">
              <div className="w-full">
                <KanbanPreview />
              </div>
            </div>
            <p className="text-base text-muted-foreground max-w-3xl mx-auto">
              {t(
                "Stay on top of every task, deadline, and project with our intuitive Kanban Board. Designed for teams and individuals, it helps you visualize work, track progress, and boost productivity—all in one place.",
              )}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <div className="flex flex-col items-center">
                <Check className="h-10 w-10 text-primary mb-2" />
                <h3 className="font-semibold text-base mb-2">
                  {t("Drag & Drop Tasks")}
                </h3>
                <p className="text-base text-muted-foreground">
                  {t(
                    "Easily move tasks between columns to reflect their status. Simple, fast, and visual.",
                  )}
                </p>
              </div>
              <div className="flex flex-col items-center">
                <BarChart3 className="h-10 w-10 text-primary mb-2" />
                <h3 className="font-semibold text-base mb-2">
                  {t("Track Progress")}
                </h3>
                <p className="text-base text-muted-foreground">
                  {t(
                    "See what’s in progress, completed, or overdue at a glance. Perfect for managing team workloads.",
                  )}
                </p>
              </div>
              <div className="flex flex-col items-center">
                <Users className="h-10 w-10 text-primary mb-2" />
                <h3 className="font-semibold text-base mb-2">
                  {t("Collaborate in Real Time")}
                </h3>
                <p className="text-base text-muted-foreground">
                  {t(
                    "Assign tasks, add comments, and keep everyone in sync—no matter where you work from.",
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Why Businesses Choose AppointDI */}
      <section className="bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-card/60 shadow-xl backdrop-blur">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
            <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-primary/15 blur-2xl" />
            <div className="absolute -right-16 bottom-0 h-36 w-36 rounded-full bg-accent/20 blur-3xl" />

            <div className="relative p-8 md:p-12 space-y-8">
              <div className="text-center space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-primary/80">
                  {t("Results")}
                </p>
                <h2 className="text-4xl sm:text-5xl md:text-5xl font-bold text-balance">
                  {t("Why Businesses Choose AppointDI")}
                </h2>
                <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                  {t(
                    "From fewer no-shows to happier staff, see how the platform impacts daily operations and growth.",
                  )}
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <Card className="p-4 md:p-5 border-primary/20 bg-gradient-to-br from-background/60 to-background shadow-sm">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-14 w-14 text-primary" />
                    <div>
                      <h4 className="text-base font-semibold text-primary mb-1">
                        {t("Save Time & Reduce No-Shows")}
                      </h4>
                      <p className="text-base text-muted-foreground">
                        {t(
                          "Automated notifications and confirmations cut no-shows and save staff time.",
                        )}
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 md:p-5 border-primary/20 bg-gradient-to-br from-background/60 to-background shadow-sm">
                  <div className="flex items-start align-center gap-3">
                    <TrendingUp className="h-7 w-14 text-primary" />
                    <div>
                      <h4 className="text-base font-semibold text-primary mb-2">
                        {t("Increase Revenue")}
                      </h4>
                      <p className="text-base text-muted-foreground">
                        {t(
                          "Fill more slots and optimize services with performance insights.",
                        )}
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 md:p-5 border-primary/20 bg-gradient-to-br from-background/60 to-background shadow-sm">
                  <div className="flex items-start gap-3">
                    <Users className="h-7 w-12 text-primary" />
                    <div>
                      <h4 className="text-base font-semibold text-primary mb-2">
                        {t("Empower Your Team")}
                      </h4>
                      <p className="text-base text-muted-foreground">
                        {t(
                          "Staff manage schedules and bookings while you stay in control.",
                        )}
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 md:p-5 border-primary/20 bg-gradient-to-br from-background/60 to-background shadow-sm">
                  <div className="flex items-start gap-3">
                    <Shield className="h-7 w-12 text-primary" />
                    <div>
                      <h4 className="text-base font-semibold text-primary mb-2">
                        {t("Professional & Reliable")}
                      </h4>
                      <p className="text-base text-muted-foreground">
                        {t(
                          "Deliver a seamless booking experience that reflects your brand.",
                        )}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Public Page Offering (before Pricing) */}
      <section className="bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center mb-8">
            <h2 className="text-4xl sm:text-5xl md:text-5xl font-bold text-balance mb-4">
              {t("Custom Branded Public Pages")}
            </h2>
            <p className="text-base text-muted-foreground text-balance max-w-3xl mx-auto">
              {t(
                "We create a tailored client-facing landing page (website) for your business — with your logo and a preferred layout. We agree on the design, build the page, and provide it for you to use as your site. The page connects to AppointDI for live schedules and bookings.",
              )}
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex items-start gap-3">
              <Palette className="h-6 w-6 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-base mb-1">
                  {t("Branding & Logo")}
                </h3>
                <p className="text-base text-muted-foreground">
                  {t("Page styled to your brand — logo, colors, typography.")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ListChecks className="h-6 w-6 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-base mb-1">
                  {t("Preferred Layout")}
                </h3>
                <p className="text-base text-muted-foreground">
                  {t(
                    "You choose how content is visualized — list, calendar, staff-first or service-first.",
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CalendarCheck className="h-6 w-6 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-base mb-1">
                  {t("Connected To AppointDI")}
                </h3>
                <p className="text-base text-muted-foreground">
                  {t(
                    "Live connection to schedules and bookings from our software.",
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-10">
            <Button
              size="lg"
              className="text-base px-7 py-6 theme-gradient-primary text-white ring-1 ring-white/20 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-transform"
              onClick={() => router.push("/help/contact")}
            >
              {t("Request Your Branded Page")}
            </Button>
          </div>
        </div>
      </section>

      <PricingSection />

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-4">
            <h2 className="text-4xl sm:text-5xl md:text-5xl font-bold text-text-primary">
              {t("Ready to Transform Your Business?")}
            </h2>
            <p className="text-base text-primary-foreground/90 text-balance">
              {t(
                "Join thousands of businesses that have streamlined their operations and increased revenue with AppointDI.",
              )}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                size="lg"
                className="text-base sm:text-lg px-7 py-6 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-transform theme-gradient-primary text-white ring-1 ring-white/20"
                onClick={() => router.push("/register")}
              >
                <span className="mr-2">{t("Join Us")}</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
