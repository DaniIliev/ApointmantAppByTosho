"use client";
import { Mail, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export default function ContactInfo() {
  const { t } = useTranslation();
  return (
    <div className="space-y-12">
      <div className="text-center">
        <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
          {t("Get In Touch")}
        </h2>
        <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
          {t(
            "We're here to help. Reach out to us through any of these channels."
          )}
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
        <Card className="group relative overflow-hidden border-2 p-8 text-center transition-all duration-300 hover:border-primary hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative space-y-6">
            <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 shadow-lg transition-transform duration-300 group-hover:scale-110">
              <Mail className="size-10 text-white" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-card-foreground">Email</h3>
              <a
                href="mailto:support@appointmentapp.com"
                className="block text-lg font-medium text-primary transition-colors hover:text-primary/80"
              >
                support@appointmentapp.com
              </a>
              <p className="text-sm text-muted-foreground">
                {t("We'll respond within 24 hours")}
              </p>
            </div>
          </div>
        </Card>

        <Card className="group relative overflow-hidden border-2 p-8 text-center transition-all duration-300 hover:border-accent hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative space-y-6">
            <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-400 shadow-lg transition-transform duration-300 group-hover:scale-110">
              <Phone className="size-10 text-white" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-card-foreground">Phone</h3>
              <a
                href="tel:+15551234567"
                className="block text-lg font-medium text-accent transition-colors hover:text-accent/80"
              >
                +1 (555) 123-4567
              </a>
              <p className="text-sm text-muted-foreground">
                {t("We'll respond within 24 hours")}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
