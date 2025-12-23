"use client";
import { Mail, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export default function ContactInfo() {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
        <Card className="group relative overflow-hidden border-2 p-8 text-center transition-all duration-300 hover:border-primary hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative space-y-6">
            <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 shadow-lg transition-transform duration-300 group-hover:scale-110">
              <Mail className="size-10 text-white" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-primary">{t("Email")}</h3>
              <a
                href="mailto:support@appointmentapp.com"
                className="block text-lg font-medium text-primary transition-colors hover:text-primary/80"
              >
                appointmentappdi@gmail.com
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
              <h3 className="text-2xl font-bold text-secondary">
                {t("Phone")}
              </h3>
              <a
                href="tel:+359899235444"
                className="block text-lg font-medium text-accent transition-colors hover:text-accent/80"
              >
                +359 899 235 444
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
