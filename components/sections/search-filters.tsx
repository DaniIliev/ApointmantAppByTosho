"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MapPin,
  Briefcase,
  Calendar,
  Clock,
  Filter,
} from "lucide-react";

export function SearchFilters() {
  const [city, setCity] = useState("");
  const [appointmentType, setAppointmentType] = useState("");
  const [date, setDate] = useState(""); // Запазваме само най-важните филтри в главния изглед

  // Добавяме състояние за показване на допълнителни филтри
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Допълнителни (Advanced) филтри
  const [business, setBusiness] = useState("");
  const [time, setTime] = useState("");
  const [quickFilter, setQuickFilter] = useState<string | null>(null);

  const handleSearch = () => {
    console.log("[v1] Top Search triggered:", {
      city,
      appointmentType,
      date,
      business,
      time,
      quickFilter,
    });
    // Тук може да се добави логика за навигация или извикване на API
  };

  const quickFilters = [
    { id: "open-now", label: "Open Now", icon: "🟢" },
    { id: "highly-rated", label: "Highly Rated", icon: "⭐" },
    { id: "available-today", label: "Available Today", icon: "📅" },
    { id: "near-me", label: "Near Me", icon: "📍" },
  ];

  return (
    <div className="py-12 md:py-16 bg-background dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* ЗАГЛАВИЕ И БЪРЗИ ФИЛТРИ */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-2">
            Book your next appointment
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Find and book services near you in seconds.
          </p>
        </div>

        {/* ОСНОВНА КАРТА ЗА ТЪРСЕНЕ */}
        <Card
          className="
          max-w-6xl mx-auto p-4 md:p-4 
          shadow-2xl shadow-primary/20 
          dark:shadow-primary/10 
          border-primary/50 
          bg-white dark:bg-gray-800
          rounded-xl
        "
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* 1. City */}
            <div className="space-y-1">
              <Label
                htmlFor="city"
                className="flex items-center gap-1 text-xs text-muted-foreground uppercase"
              >
                <MapPin className="h-3 w-3" />
                City
              </Label>
              <Input
                id="city"
                placeholder="Where are you?"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-10 border-2"
                list="city-suggestions"
              />
              <datalist id="city-suggestions">
                <option value="New York" />
                <option value="Los Angeles" />
                <option value="Chicago" />
                <option value="Houston" />
              </datalist>
            </div>

            {/* 2. Appointment Type */}
            <div className="space-y-1">
              <Label
                htmlFor="type"
                className="flex items-center gap-1 text-xs text-muted-foreground uppercase"
              >
                <Briefcase className="h-3 w-3" />
                Service
              </Label>
              <Select
                value={appointmentType}
                onValueChange={setAppointmentType}
              >
                <SelectTrigger id="type" className="h-10 border-2">
                  <SelectValue placeholder="What do you need?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="haircut">💇 Haircut & Styling</SelectItem>
                  <SelectItem value="massage">💆 Massage Therapy</SelectItem>
                  <SelectItem value="dental">🦷 Dental Checkup</SelectItem>
                  <SelectItem value="consultation">💼 Consultation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 3. Date */}
            <div className="space-y-1">
              <Label
                htmlFor="date"
                className="flex items-center gap-1 text-xs text-muted-foreground uppercase"
              >
                <Calendar className="h-3 w-3" />
                Date (Optional)
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-10 border-2"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            {/* 4. Search Button */}
            <Button
              onClick={handleSearch}
              className="w-full h-10 font-bold text-base hover:scale-[1.01] transition-transform shadow-md shadow-primary/30"
              disabled={!city || !appointmentType}
            >
              <Search className="h-4 w-4 mr-2" />
              Search Now
            </Button>
          </div>

          {/* БЪРЗИ ФИЛТРИ ПОД ТЪРСАЧКАТА */}
          <div className="flex flex-wrap gap-2 pt-4 justify-start">
            <Filter className="h-4 w-4 text-primary mr-1 self-center hidden sm:block" />
            {quickFilters.map((filter) => (
              <Badge
                key={filter.id}
                variant={quickFilter === filter.id ? "default" : "outline"}
                className={`
                  cursor-pointer 
                  hover:bg-primary hover:text-primary-foreground transition-colors 
                  px-3 py-1 text-xs font-medium rounded-full 
                  ${
                    quickFilter === filter.id
                      ? "bg-primary text-primary-foreground"
                      : "border-gray-300 dark:border-gray-600 bg-transparent text-muted-foreground hover:border-primary"
                  }
                `}
                onClick={() =>
                  setQuickFilter(quickFilter === filter.id ? null : filter.id)
                }
              >
                <span className="mr-1.5">{filter.icon}</span>
                {filter.label}
              </Badge>
            ))}
            {/* Бутон за Допълнителни филтри */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-medium ml-auto"
            >
              <Filter className="h-3 w-3 mr-1" />
              {showAdvanced ? "Hide Advanced Filters" : "More Filters"}
            </Button>
          </div>

          {/* ДОПЪЛНИТЕЛНИ ФИЛТРИ (РАЗШИРЕН ИЗГЛЕД) */}
          {showAdvanced && (
            <div className="mt-6 pt-4 border-t border-dashed dark:border-gray-700">
              <h4 className="text-sm font-semibold mb-3">Optional Filters</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Business */}
                <div className="space-y-1">
                  <Label
                    htmlFor="business"
                    className="flex items-center gap-1 text-xs text-muted-foreground uppercase"
                  >
                    <Briefcase className="h-3 w-3" />
                    Business Name
                  </Label>
                  <Input
                    id="business"
                    placeholder="Specific business name (optional)"
                    value={business}
                    onChange={(e) => setBusiness(e.target.value)}
                    className="w-full h-10"
                  />
                </div>
                {/* Time */}
                <div className="space-y-1">
                  <Label
                    htmlFor="time"
                    className="flex items-center gap-1 text-xs text-muted-foreground uppercase"
                  >
                    <Clock className="h-3 w-3" />
                    Time of Day
                  </Label>
                  <Select value={time} onValueChange={setTime}>
                    <SelectTrigger id="time" className="h-10">
                      <SelectValue placeholder="Any time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">
                        🌅 Morning (6am - 12pm)
                      </SelectItem>
                      <SelectItem value="afternoon">
                        ☀️ Afternoon (12pm - 5pm)
                      </SelectItem>
                      <SelectItem value="evening">
                        🌆 Evening (5pm - 9pm)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
