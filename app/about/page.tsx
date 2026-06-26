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
        
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center relative">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/80 px-4 py-2 shadow-sm backdrop-blur mb-6">
                <span className="text-sm font-semibold text-primary">
                  {t("About Us")}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-5xl font-bold tracking-tight text-text-primary mb-4 leading-tight">
                {t("Scheduling made")} <br />
                <span className="theme-text-gradient">{t("simple for everyone")}</span>
              </h1>

              <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
                {t("AppointDI helps you manage bookings without the stress. It’s a simple tool built to keep your calendar organized and your customers happy.")}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button size="lg" className="rounded-xl px-8 h-12 shadow-lg shadow-primary/20" asChild>
                  <Link href="/register">
                    <span className="mr-1">{t("Get Started")}</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="rounded-xl px-8 h-12" asChild>
                  <Link href="/help/contact">
                    <span className="mr-1">{t("Talk to Us")}</span>
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
            <StatsCard icon={Users} label={t("Active Businesses")} value="150+" />
            <StatsCard icon={Calendar} label={t("Total Bookings")} value="8,000+" />
            <StatsCard icon={Globe} label={t("Countries")} value="3+" />
            <StatsCard icon={Clock} label={t("Hours Saved")} value="500+" />
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl font-bold">{t("How we help")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("We focused on building something that actually works for your daily routine.")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <ValueItem 
              icon={Target} 
              title={t("Clear Focus")} 
              description={t("Spend less time on phone calls and more time doing your work.")} 
            />
            <ValueItem 
              icon={Zap} 
              title={t("Fast & Easy")} 
              description={t("Everything is automatic. Your clients pick a time, pay, and you're done.")} 
            />
            <ValueItem 
              icon={CheckCircle2} 
              title={t("Safe & Private")} 
              description={t("We keep your data secure. Your privacy is never an afterthought.")} 
            />
            <ValueItem 
              icon={BarChart3} 
              title={t("Real Results")} 
              description={t("See exactly how your business is doing with easy-to-read numbers.")} 
            />
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-12 bg-muted/30 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl font-bold">{t("Why we started")}</h2>
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                {t("In 2024, we noticed that booking appointments was often a headache. Calendars were messy and clients were frustrated.")}
              </p>
              <p>
                {t("We built AppointDI to fix that. We wanted a tool that just works—no complicated manuals, just a simple way to manage your day.")}
              </p>
              <p>
                {t("Today, businesses of all sizes use us to stay organized and save time.")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section>
        <div>
          <div className="bg-primary p-12 md:p-20 text-center text-primary-foreground relative overflow-hidden shadow-2xl shadow-primary/30">
            <div className="relative z-10 space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold max-w-3xl mx-auto leading-tight">
                {t("Ready to try it?")}
              </h2>
              <p className="text-primary-foreground/80 text-xl max-w-xl mx-auto">
                {t("Set up your account in 5 minutes and see how much easier scheduling can be.")}
              </p>
              <div className="flex justify-center gap-4">
              <Button
                size="lg"
                className="text-base sm:text-lg px-7 py-6 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-transform theme-gradient-primary text-white ring-1 ring-white/20"
                onClick={() => router.push("/register")}
              >
                <span className="mr-1">{t("Start Now")}</span>
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