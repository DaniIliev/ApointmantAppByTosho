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
  X,
  Filter,
} from "lucide-react";

export function SearchFilters() {
  const [city, setCity] = useState("");
  const [appointmentType, setAppointmentType] = useState("");
  const [business, setBusiness] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [quickFilter, setQuickFilter] = useState<string | null>(null);

  const activeFiltersCount = [
    city,
    appointmentType,
    business,
    date,
    time,
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    setCity("");
    setAppointmentType("");
    setBusiness("");
    setDate("");
    setTime("");
    setQuickFilter(null);
  };

  const handleSearch = () => {
    console.log("[v0] Search triggered:", {
      city,
      appointmentType,
      business,
      date,
      time,
      quickFilter,
    });
  };

  const quickFilters = [
    { id: "open-now", label: "Open Now", icon: "🟢" },
    { id: "highly-rated", label: "Highly Rated", icon: "⭐" },
    { id: "available-today", label: "Available Today", icon: "📅" },
    { id: "near-me", label: "Near Me", icon: "📍" },
  ];

  return (
    <div className="space-y-4">
      {/* <div className="flex flex-wrap gap-2 justify-center">
        {quickFilters.map((filter) => (
          <Badge
            key={filter.id}
            variant={quickFilter === filter.id ? "default" : "outline"}
            className="cursor-pointer hover:scale-105 transition-transform px-4 py-2 text-sm"
            onClick={() => setQuickFilter(quickFilter === filter.id ? null : filter.id)}
          >
            <span className="mr-1.5">{filter.icon}</span>
            {filter.label}
          </Badge>
        ))}
      </div> */}

      <Card className="max-w-5xl mx-auto p-6 md:p-8 shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <h3 className="font-semibold font-sans">Search Filters</h3>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} active
              </Badge>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear all
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* City with suggestions */}
          <div className="space-y-2">
            <Label
              htmlFor="city"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <MapPin className="h-4 w-4 text-primary" />
              City <span className="text-destructive">*</span>
            </Label>
            <Input
              id="city"
              placeholder="e.g., New York, Los Angeles"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full transition-all focus:scale-[1.02]"
              list="city-suggestions"
            />
            <datalist id="city-suggestions">
              <option value="New York" />
              <option value="Los Angeles" />
              <option value="Chicago" />
              <option value="Houston" />
              <option value="Phoenix" />
              <option value="Philadelphia" />
            </datalist>
          </div>

          {/* Appointment Type */}
          <div className="space-y-2">
            <Label
              htmlFor="appointment-type"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <Briefcase className="h-4 w-4 text-primary" />
              Appointment Type <span className="text-destructive">*</span>
            </Label>
            <Select value={appointmentType} onValueChange={setAppointmentType}>
              <SelectTrigger
                id="appointment-type"
                className="transition-all focus:scale-[1.02]"
              >
                <SelectValue placeholder="What do you need?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="haircut">💇 Haircut & Styling</SelectItem>
                <SelectItem value="massage">💆 Massage Therapy</SelectItem>
                <SelectItem value="dental">🦷 Dental Checkup</SelectItem>
                <SelectItem value="consultation">💼 Consultation</SelectItem>
                <SelectItem value="fitness">💪 Fitness Training</SelectItem>
                <SelectItem value="beauty">✨ Beauty Treatment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Business (Optional) */}
          <div className="space-y-2">
            <Label
              htmlFor="business"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              Business{" "}
              <span className="text-muted-foreground text-xs">(Optional)</span>
            </Label>
            <Input
              id="business"
              placeholder="Search by name"
              value={business}
              onChange={(e) => setBusiness(e.target.value)}
              className="w-full transition-all focus:scale-[1.02]"
            />
          </div>

          {/* Date (Optional) */}
          <div className="space-y-2">
            <Label
              htmlFor="date"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Date{" "}
              <span className="text-muted-foreground text-xs">(Optional)</span>
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full transition-all focus:scale-[1.02]"
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* Time (Optional) */}
          <div className="space-y-2">
            <Label
              htmlFor="time"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <Clock className="h-4 w-4 text-muted-foreground" />
              Time{" "}
              <span className="text-muted-foreground text-xs">(Optional)</span>
            </Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger
                id="time"
                className="transition-all focus:scale-[1.02]"
              >
                <SelectValue placeholder="Any time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">🌅 Morning (6am - 12pm)</SelectItem>
                <SelectItem value="afternoon">
                  ☀️ Afternoon (12pm - 5pm)
                </SelectItem>
                <SelectItem value="evening">🌆 Evening (5pm - 9pm)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <Button
              onClick={handleSearch}
              className="w-full h-10 hover:scale-105 transition-transform"
              size="lg"
              disabled={!city || !appointmentType}
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          <span className="text-destructive">*</span> Required fields
        </p>
      </Card>
    </div>
  );
}
