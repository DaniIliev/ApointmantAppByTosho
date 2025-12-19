"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  PlayCircle,
} from "lucide-react";
import { usePaddingControl } from "@/context/PaddingContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BenefitsSection } from "@/components/sections/benefits-section";
import PricingSection from "@/components/Pricing/PricingSection";
import { useTranslation } from "react-i18next";
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
                onClick={() => router.push("/register")}
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
      {/* Analytics & Performance Module Section */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance mb-6">
                {t("Visualize Your Business Performance")}
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground text-balance max-w-3xl mx-auto">
                {t(
                  "Create custom analytics dashboards with drag-and-drop charts. Build the perfect view of your business data with our flexible, responsive grid layout."
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
                    <h3 className="text-lg md:text-xl font-semibold mb-2">
                      {t("Customizable Chart Types")}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      {t(
                        "Choose from line, bar, pie, and combined charts. Visualize appointments, revenue, services, and more with your preferred chart style."
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <Palette className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold mb-2">
                      {t("Drag & Drop Grid Layout")}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      {t(
                        "Arrange your dashboard exactly how you want. Resize and reposition charts with intuitive drag-and-drop. Your layout automatically adapts to mobile devices."
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
                      {t("Real-Time KPI Cards")}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      {t(
                        "Track key metrics at a glance with live KPI cards. Monitor total appointments, revenue, client retention, and more with automatic change indicators."
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold mb-2">
                      {t("Filter by Date & Staff")}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      {t(
                        "Analyze data by custom date ranges or individual staff members. Get the insights that matter most to your business decisions."
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <Card className="overflow-hidden shadow-xl border-2 hover:shadow-2xl transition-shadow duration-500">
                  <CardContent className="p-0">
                    <img
                      src="/analytics-dashboard.png"
                      alt="Analytics dashboard with customizable charts and KPI cards"
                      className="w-full h-auto"
                    />
                  </CardContent>
                </Card>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4 text-center border-primary/20">
                    <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-sm font-semibold">
                      {t("5+ Chart Types")}
                    </p>
                  </Card>
                  <Card className="p-4 text-center border-primary/20">
                    <Palette className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-sm font-semibold">
                      {t("Responsive Grid")}
                    </p>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PricingSection />

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
                onClick={() => router.push("/register")}
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
