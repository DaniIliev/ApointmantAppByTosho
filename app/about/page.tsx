"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { 
  Users, 
  Target, 
  Zap, 
  Globe, 
  BarChart3, 
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePaddingControl } from "@/context/PaddingContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const StatsCard = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
  <div className="bg-card/40 backdrop-blur-md border border-border/50 p-6 rounded-2xl flex flex-col items-center text-center group hover:border-primary/50 transition-all duration-300">
    <div className="bg-primary/10 p-3 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
      <Icon className="w-6 h-6 text-primary" />
    </div>
    <div className="text-3xl font-bold mb-1">{value}</div>
    <div className="text-sm text-muted-foreground">{label}</div>
  </div>
);

const ValueItem = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <div className="flex gap-4 p-6 rounded-2xl hover:bg-primary/5 transition-colors duration-300">
    <div className="bg-primary/10 p-3 rounded-xl h-fit">
      <Icon className="w-6 h-6 text-primary" />
    </div>
    <div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  </div>
);

export default function AboutPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { setRemovePadding } = usePaddingControl();

  useEffect(() => {
    setRemovePadding(true);
    return () => setRemovePadding(false);
  }, [setRemovePadding]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 isolate">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/15 via-background to-background" />
        <div className="absolute inset-0 -z-10 opacity-60 [background-image:radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.2)_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="absolute -left-16 top-0 -z-10 h-64 w-64 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute right-0 top-20 -z-10 h-80 w-80 rounded-full bg-accent/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -z-10 h-48 w-[40rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />

        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center relative">
            <div className="absolute left-1/2 top-0 -z-10 h-64 w-64 -translate-x-1/2 rounded-full bg-white/60 blur-3xl dark:bg-white/10" />

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/80 px-4 py-2 shadow-sm backdrop-blur mb-6">
                <span className="theme-logo-mask" aria-hidden="true" />
                <span className="text-sm font-semibold text-primary">
                  {t("Our Mission")}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-5xl font-bold tracking-tight text-text-primary mb-4 leading-tight">
                {t("Transforming how")} <br />
                <span className="theme-text-gradient">{t("Businesses Schedule")}</span>
              </h1>

              <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
                {t("AppointDI is a modern, intuitive appointment management system designed to streamline your business operations and enhance customer experience.")}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button size="lg" className="rounded-xl px-8 h-12 shadow-lg shadow-primary/20" asChild>
                  <Link href="/register">
                    <span className="mr-1">{t("Join Us")}</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="rounded-xl px-8 h-12" asChild>
                  <Link href="/help/contact">
                    <span className="mr-1">{t("Contact Us")}</span>
                    <Mail className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted/30 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard icon={Users} label={t("Active Businesses")} value="2,500+" />
            <StatsCard icon={Calendar} label={t("Appointments Booked")} value="1.2M+" />
            <StatsCard icon={Globe} label={t("Countries Reached")} value="15+" />
            <StatsCard icon={Clock} label={t("Hours Saved")} value="10k+" />
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl font-bold">{t("Why We Exist")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("Our platform combines cutting-edge technology with user-friendly design to provide a comprehensive solution for appointment scheduling.")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <ValueItem 
              icon={Target} 
              title={t("Our Mission")} 
              description={t("To empower businesses with efficient appointment management tools that save time and improve customer satisfaction.")} 
            />
            <ValueItem 
              icon={Zap} 
              title={t("Efficiency First")} 
              description={t("We believe scheduling should be seamless and automatic, allowing you to focus on what you do best.")} 
            />
            <ValueItem 
              icon={CheckCircle2} 
              title={t("Trust & Security")} 
              description={t("Your data and your clients' privacy are our top priorities. We build with security from the ground up.")} 
            />
            <ValueItem 
              icon={BarChart3} 
              title={t("Data-Driven Growth")} 
              description={t("We provide the insights you need to understand your business performance and grow exponentially.")} 
            />
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-12 bg-muted/30 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl font-bold">{t("Our Story")}</h2>
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                {t("Born out of a need for better scheduling tools, AppointDI started in 2024 with a simple goal: to make appointment management as easy as a single click.")}
              </p>
              <p>
                {t("We saw too many businesses struggling with messy calendars, missed appointments, and frustrated clients. We knew there had to be a better way.")}
              </p>
              <p>
                {t("Today, we serve thousands of businesses across various industries, from hair salons to dental clinics, helping them grow and succeed in the digital age.")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section>
        <div >
          <div className="bg-primary p-12 md:p-20 text-center text-primary-foreground relative overflow-hidden shadow-2xl shadow-primary/30">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent opacity-50" />
            <div className="relative z-10 space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold max-w-3xl mx-auto leading-tight">
                {t("Ready to Transform Your Business?")}
              </h2>
              <p className="text-primary-foreground/80 text-xl max-w-xl mx-auto">
                {t("Join thousands of businesses that have streamlined their operations and increased revenue with AppointDI.")}
              </p>
              <div className="flex justify-center gap-4">
              <Button
                size="lg"
                className="text-base sm:text-lg px-7 py-6 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-transform theme-gradient-primary text-white ring-1 ring-white/20"
                onClick={() => router.push("/register")}
              >
                <span className="mr-1">{t("Join Us")}</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
