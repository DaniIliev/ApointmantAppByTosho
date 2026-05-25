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
              {t("Manage all your locations in one place")}
            </h1>

            <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
              {t("Everything you need to run your business, from staff schedules to client bookings, simplified.")}
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
              {t("Your whole business, one screen")}
            </h2>
            <p className="text-base text-muted-foreground mt-4">
              {t("Whether you have one shop or ten, manage your team and services from a single central hub.")}
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
              {t("Built for your team and your clients")}
            </h2>
            <p className="text-base text-muted-foreground max-w-3xl mx-auto">
              {t("Give your clients the easiest way to book—online, via QR code, or straight from their phone.")}
            </p>
          </div>

          {/* Booking methods & client tools (non-uniform presentation) */}
          <div className="mt-8 grid lg:grid-cols-2  gap-8 items-center justify-center">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <QrCode className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">{t("Simple Online Booking")}</h3>
                  <p className="text-base text-muted-foreground">
                    {t("Your clients pick a time that works for them using a simple link or a QR code in your shop.")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Smartphone className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">{t("Always Ready on Mobile")}</h3>
                  <p className="text-base text-muted-foreground">
                    {t("Booking takes seconds. It's fast, smooth, and works perfectly on any phone.")}
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
                    {t("Client Space")}
                  </p>
                  <p className="text-base text-muted-foreground">
                    {t("Clients can manage their own appointments, saving you from constant phone calls.")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Bell className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-base font-semibold">
                    {t("You're in Control")}
                  </p>
                  <p className="text-base text-muted-foreground">
                    {t("Get instant alerts for new bookings. You decide which ones to accept.")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Zap className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-base font-semibold">
                    {t("No More No-Shows")}
                  </p>
                  <p className="text-base text-muted-foreground">
                    {t("We send automatic reminders so your clients never miss their spot.")}
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
                    {t("Team Management")}
                  </h3>
                  <p className="text-base text-muted-foreground">
                    {t("Organize your team effortlessly with custom schedules and breaks for everyone.")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">
                    {t("Flexible Services")}
                  </h3>
                  <p className="text-base text-muted-foreground">
                    {t("Set up your services and choose exactly which team members handle them.")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ListChecks className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">
                    {t("Everything in One Place")}
                  </h3>
                  <p className="text-base text-muted-foreground">
                    {t("Keep your calendar organized. Review, approve, or move bookings with a few clicks.")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">
                    {t("Quick Manual Bookings")}
                  </h3>
                  <p className="text-base text-muted-foreground">
                    {t("Take phone or walk-in bookings yourself and stay organized instantly.")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BarChart3 className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">{t("Smart Insights")}</h3>
                  <p className="text-base text-muted-foreground">
                    {t("See what’s working and what’s not with simple, easy-to-read numbers.")}
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
                {t("Understand your growth")}
              </h2>
              <p className="text-base text-muted-foreground text-balance max-w-3xl mx-auto">
                {t("See your success in real-time. We help you track your revenue, bookings, and team performance without the complicated spreadsheets.")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              <div className="flex flex-col gap-4">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold mb-2">
                    {t("Visual Reports")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("Pick the charts that make sense to you. See your revenue and bookings grow month by month.")}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex-shrink-0">
                  <Palette className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold mb-2">
                    {t("Your Dashboard, Your Way")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("Organize your stats exactly how you like them. It’s your business, viewed your way.")}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold mb-2">
                    {t("Live Stats")}
                  </h3>
                  <p className="text-base text-muted-foreground">
                    {t("Keep an eye on the numbers that matter most—total bookings, earnings, and new clients.")}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex-shrink-0">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold mb-2">
                    {t("Deep Dive")}
                  </h3>
                  <p className="text-base text-muted-foreground">
                    {t("Filter by date or team member to see exactly who’s performing best.")}
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full mx-auto">
              <AnalyticsPreview />
            </div>
          </div>
        </div>
      </section>
      <section className="bg-gray-50 dark:bg-gray-900 py-12">
        <div className="mx-auto px-4">
          <div className="mx-auto text-center space-y-6">
            <h2 className="text-4xl sm:text-5xl md:text-5xl align-center font-bold text-balance mb-10 mx-auto">
              {t("Never lose track of a task")}
            </h2>
            {/* Kanban Board Interactive Preview */}
            <div className="flex justify-center mb-6">
              <div className="w-full">
                <KanbanPreview />
              </div>
            </div>
            <p className="text-base text-muted-foreground max-w-3xl mx-auto">
              {t("Keep your daily tasks organized. From shop maintenance to client follow-ups, see everything that needs to be done in one clear view.")}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <div className="flex flex-col items-center">
                <Check className="h-10 w-10 text-primary mb-2" />
                <h3 className="font-semibold text-base mb-2">
                  {t("Move Tasks Fast")}
                </h3>
                <p className="text-base text-muted-foreground">
                  {t("Move things around as they get done. It's simple, fast, and keeps you moving.")}
                </p>
              </div>
              <div className="flex flex-col items-center">
                <BarChart3 className="h-10 w-10 text-primary mb-2" />
                <h3 className="font-semibold text-base mb-2">
                  {t("See What's Done")}
                </h3>
                <p className="text-base text-muted-foreground">
                  {t("Know exactly what's pending and what's finished. No more guessing what to do next.")}
                </p>
              </div>
              <div className="flex flex-col items-center">
                <Users className="h-10 w-10 text-primary mb-2" />
                <h3 className="font-semibold text-base mb-2">
                  {t("Team Sync")}
                </h3>
                <p className="text-base text-muted-foreground">
                  {t("Work together with your team. Assign tasks and keep everyone on the same page.")}
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
                  {t("Why it works for you")}
                </h2>
                <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                  {t("We focus on making your life easier, your team happier, and your business more profitable.")}
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <Card className="p-4 md:p-5 border-primary/20 bg-gradient-to-br from-background/60 to-background shadow-sm">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-14 w-14 text-primary" />
                    <div>
                      <h4 className="text-base font-semibold text-primary mb-1">
                        {t("Save Time Every Day")}
                      </h4>
                      <p className="text-base text-muted-foreground">
                        {t("Let the system handle the reminders so you can focus on your work.")}
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 md:p-5 border-primary/20 bg-gradient-to-br from-background/60 to-background shadow-sm">
                  <div className="flex items-start align-center gap-3">
                    <TrendingUp className="h-7 w-14 text-primary" />
                    <div>
                      <h4 className="text-base font-semibold text-primary mb-2">
                        {t("Grow Your Income")}
                      </h4>
                      <p className="text-base text-muted-foreground">
                        {t("Fill your calendar and spot new opportunities to increase your earnings.")}
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 md:p-5 border-primary/20 bg-gradient-to-br from-background/60 to-background shadow-sm">
                  <div className="flex items-start gap-3">
                    <Users className="h-7 w-12 text-primary" />
                    <div>
                      <h4 className="text-base font-semibold text-primary mb-2">
                        {t("A Happier Team")}
                      </h4>
                      <p className="text-base text-muted-foreground">
                        {t("Give your team the tools to manage their own day while you stay in total control.")}
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 md:p-5 border-primary/20 bg-gradient-to-br from-background/60 to-background shadow-sm">
                  <div className="flex items-start gap-3">
                    <Shield className="h-7 w-12 text-primary" />
                    <div>
                      <h4 className="text-base font-semibold text-primary mb-2">
                        {t("Look Professional")}
                      </h4>
                      <p className="text-base text-muted-foreground">
                        {t("Give your clients a high-end booking experience that matches your great service.")}
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
              {t("Your own professional website")}
            </h2>
            <p className="text-base text-muted-foreground text-balance max-w-3xl mx-auto">
              {t("Need a custom look? We can build a beautiful, branded website just for you. It’ll have your logo, your colors, and it’ll be fully connected to your AppointDI calendar.")}
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex items-start gap-3">
              <Palette className="h-6 w-6 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-base mb-1">
                  {t("Your Brand First")}
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
                  {t("Custom Design")}
                </h3>
                <p className="text-base text-muted-foreground">
                  {t("You choose how content is visualized — list, calendar, staff-first or service-first.")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CalendarCheck className="h-6 w-6 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-base mb-1">
                  {t("Fully Synced")}
                </h3>
                <p className="text-base text-muted-foreground">
                  {t("Live connection to schedules and bookings from our software.")}
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
              {t("Ready to simplify your day?")}
            </h2>
            <p className="text-base text-primary-foreground/90 text-balance">
              {t("Join other businesses who are saving time and growing faster with AppointDI.")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                size="lg"
                className="text-base sm:text-lg px-7 py-6 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-transform theme-gradient-primary text-white ring-1 ring-white/20"
                onClick={() => router.push("/register")}
              >
                <span className="mr-2">{t("Start Now")}</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
