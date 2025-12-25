"use client";

import { useMemo, useState } from "react";
import { Calendar, CalendarCheck, Clock, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Service {
  id: string;
  name: string;
  duration: string;
  price: string;
}

interface Staff {
  id: string;
  name: string;
  role: string;
}

const servicesPreset: Service[] = [
  { id: "haircut", name: "Haircut & Style", duration: "45 min", price: "€35" },
  { id: "color", name: "Color & Highlights", duration: "90 min", price: "€85" },
  { id: "manicure", name: "Manicure + Gel", duration: "50 min", price: "€42" },
];

const staffPreset: Staff[] = [
  { id: "anna", name: "Anna", role: "Stylist" },
  { id: "diana", name: "Diana", role: "Colorist" },
  { id: "natalia", name: "Natalia", role: "Nails" },
];

const slotsPreset = ["10:00", "11:30", "13:00", "14:30", "16:00", "17:30"];

export function PublicPagePreview() {
  const { t } = useTranslation();
  const [selectedService, setSelectedService] = useState<string>(
    servicesPreset[0].id
  );
  const [selectedStaff, setSelectedStaff] = useState<string>(staffPreset[0].id);
  const [selectedSlot, setSelectedSlot] = useState<string>(slotsPreset[0]);

  const selectedServiceObj = useMemo(
    () =>
      servicesPreset.find((s) => s.id === selectedService) ?? servicesPreset[0],
    [selectedService]
  );

  return (
    <div className="w-full max-w-[640px] mx-auto rounded-2xl border border-primary/15 bg-gradient-to-b from-background/80 via-background/70 to-background/90 backdrop-blur shadow-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-primary">
          <CalendarCheck className="h-4 w-4" />
          <h3 className="text-sm font-semibold text-primary">
            {t("Client Booking Preview")}
          </h3>
        </div>
        <span className="text-[11px] text-muted-foreground">
          {t("Public page")}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-3">
          {/* Services selector */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              {t("Choose a service")}
            </p>
            <div className="grid grid-cols-1 gap-2">
              {servicesPreset.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left transition hover:border-primary/50 hover:bg-primary/5 ${
                    selectedService === service.id
                      ? "border-primary/60 bg-primary/8 shadow-sm"
                      : "border-border"
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground leading-tight">
                      {t(service.name)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {service.duration}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    {service.price}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {/* Slots */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              {t("Pick a time")}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {slotsPreset.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`rounded-lg border px-2 py-2 text-xs transition hover:border-primary/50 hover:bg-primary/5 ${
                    selectedSlot === slot
                      ? "border-primary/60 bg-primary/8 text-primary"
                      : "border-border text-foreground"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
          {/* Staff selector */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              {t("Select a professional")}
            </p>
            <div className="flex flex-wrap gap-2">
              {staffPreset.map((member) => (
                <button
                  key={member.id}
                  onClick={() => setSelectedStaff(member.id)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition hover:border-primary/50 hover:bg-primary/5 ${
                    selectedStaff === member.id
                      ? "border-primary/60 bg-primary/8 text-primary"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  <span className="font-medium">{member.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background/70 to-background/90 shadow-inner p-4 space-y-3 w-full">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Calendar className="h-6 w-6 text-primary" />
              <span>{t("Review & Book")}</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {t("Today")}
            </span>
          </div>

          <div className="rounded-xl border border-primary/15 bg-background/60 p-3 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="font-semibold leading-tight">
                  {t(selectedServiceObj.name)}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="px-2 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                    {selectedServiceObj.price}
                  </span>
                  <span className="px-2 py-1 rounded-full bg-muted/60 border border-border/60">
                    {selectedServiceObj.duration}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-foreground font-medium">
                  {staffPreset.find((s) => s.id === selectedStaff)?.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-foreground font-medium">
                  {selectedSlot}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button className="w-full rounded-lg bg-primary text-primary-foreground py-2 text-sm font-semibold shadow hover:shadow-md transition">
        {t("Book appointment")}
      </button>
    </div>
  );
}
