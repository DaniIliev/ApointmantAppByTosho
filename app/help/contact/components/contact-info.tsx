"use client";
import { Mail, Phone, MessageSquare, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const ContactCard = ({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  href, 
  type 
}: { 
  icon: any, 
  title: string, 
  value: string, 
  subtitle: string, 
  href: string,
  type: "email" | "phone"
}) => (
  <Card className="group relative overflow-hidden border-border/50 bg-card/40 p-8 text-center backdrop-blur-md transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 rounded-3xl">
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    <div className="relative space-y-6">
      <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary/15">
        <Icon className="size-8 text-primary" />
      </div>
      <div className="space-y-3">
        <h3 className="text-xl font-bold tracking-tight text-text-primary">{title}</h3>
        <a
          href={href}
          className="block text-lg font-semibold text-primary transition-colors hover:opacity-80"
        >
          {value}
        </a>
        <p className="text-sm text-muted-foreground font-medium">
          {subtitle}
        </p>
      </div>
    </div>
  </Card>
);

export default function ContactInfo() {
  const { t } = useTranslation();
  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <div className="grid gap-6 md:grid-cols-2">
        <ContactCard 
          icon={Mail}
          title={t("Email Us")}
          value="appointmentappdi@gmail.com"
          subtitle={t("Mon - Fri, 9:00 - 18:00")}
          href="mailto:appointmentappdi@gmail.com"
          type="email"
        />
        <ContactCard 
          icon={Phone}
          title={t("Call Us")}
          value="+359 899 235 444"
          subtitle={t("Mon - Fri, 9:00 - 18:00")}
          href="tel:+359899235444"
          type="phone"
        />
      </div>
      
      {/* Optional: Add a subtle notice below */}
      <div className="mt-12 flex flex-wrap items-center justify-center gap-8 opacity-60">
        <div className="flex items-center gap-2 text-sm font-medium">
          <MessageSquare className="size-4 text-primary" />
          <span>{t("Live Chat Support")}</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium">
          <Clock className="size-4 text-primary" />
          <span>{t("Fast Response Time")}</span>
        </div>
      </div>
    </div>
  );
}

