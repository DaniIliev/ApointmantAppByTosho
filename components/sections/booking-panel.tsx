"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, User, CheckCircle2 } from "lucide-react";
import { LabeledSelect } from "../customUIComponents/LabeledSelect";

interface BookingPanelProps {
  business: {
    name: string;
    rating: number;
    reviews: number;
  };
}

// Дефиниране на типовете за данните
type ServiceOption = "haircut" | "coloring" | "treatment" | "";
type StaffOption = "any" | "sarah" | "michael" | "";

// Дефиниране на данните за услугите и персонала във формат, подходящ за LabeledSelect
const serviceOptions = [
  { id: "haircut" as ServiceOption, name: "Haircut & Style - $65" },
  { id: "coloring" as ServiceOption, name: "Hair Coloring - $120" },
  { id: "treatment" as ServiceOption, name: "Deep Treatment - $85" },
];

const staffOptions = [
  { id: "any" as StaffOption, name: "Any Available Staff" },
  { id: "sarah" as StaffOption, name: "Sarah Johnson (4.9★)" },
  { id: "michael" as StaffOption, name: "Michael Chen (4.8★)" },
];

export function BookingPanel({ business }: BookingPanelProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("");
  // Актуализирани useState типове
  const [service, setService] = useState<ServiceOption>("");
  const [staff, setStaff] = useState<StaffOption>("any");

  const availableTimes = [
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
  ];

  const handleBooking = () => {
    console.log("[v0] Booking:", { date, time, service, staff });
    alert("Booking confirmed! You will receive a confirmation email shortly.");
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="bg-primary/5">
        <CardTitle className="flex items-center gap-2 font-sans">
          <CalendarIcon className="h-5 w-5 text-primary" />
          Book Appointment
        </CardTitle>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary" className="text-xs">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Instant Confirmation
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Free Cancellation
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Service Selection - ЗАМЕНЕН С LabeledSelect */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Select Service
          </label>
          <LabeledSelect
            label="Choose a service"
            id="service-select"
            value={service}
            onValueChange={setService}
            placeholder="Select a service from the list"
            options={serviceOptions}
          />
        </div>

        {/* Staff Selection - ЗАМЕНЕН С LabeledSelect */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Select Staff
          </label>
          <LabeledSelect
            label="Select Staff"
            id="staff-select"
            value={staff}
            onValueChange={setStaff}
            placeholder="Choose a staff member or 'Any'"
            options={staffOptions}
          />
        </div>

        {/* Date Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-primary" />
            Select Date
          </label>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
            disabled={(date) => date < new Date()}
          />
        </div>

        {/* Time Selection */}
        <div className="space-y-2">
          {/* <label className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Select Time
          </label>
          <div className="grid grid-cols-3 gap-2">
            {availableTimes.map((t) => (
              <Button
                key={t}
                variant={time === t ? "default" : "outline"}
                size="sm"
                onClick={() => setTime(t)}
                className="transition-all hover:scale-105"
              >
                {t}
              </Button>
            ))}
          </div> */}
          {/* <LabeledSelect
            label={t("Time")}
            id="time"
            value={newAppointment.time}
            onValueChange={(value) =>
              setNewAppointment((prev) => ({ ...prev, time: value }))
            }
            placeholder={t("Select time")}
            options={availableSlots.map((slot) => ({
              id: slot.startTime,
              name: `${slot.startTime} - ${slot.endTime}`,
            }))}
          /> */}
        </div>

        {/* Book Button */}
        <Button
          onClick={handleBooking}
          className="w-full h-12 text-base hover:scale-105 transition-transform"
          size="lg"
          disabled={!date || !time || !service}
        >
          Confirm Booking
        </Button>

        <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
          <p className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Free cancellation up to 24 hours before
          </p>
          <p className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Instant email confirmation
          </p>
          <p className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Secure payment processing
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
