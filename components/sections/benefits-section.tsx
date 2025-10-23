import { Card, CardContent } from "@/components/ui/card";
import {
  Clock,
  Calendar,
  Shield,
  Zap,
  Users,
  Bell,
  BarChart3,
  Palette,
} from "lucide-react";

const benefits = [
  {
    icon: Clock,
    title: "Save Time",
    description:
      "Book appointments 24/7 without phone calls or waiting on hold",
  },
  {
    icon: Calendar,
    title: "Easy Scheduling",
    description:
      "View real-time availability and choose times that work for you",
  },
  {
    icon: Shield,
    title: "Verified Businesses",
    description:
      "All businesses are verified with real reviews from actual clients",
  },
  {
    icon: Zap,
    title: "Instant Confirmation",
    description:
      "Get immediate booking confirmation and reminders via email or SMS",
  },
];
const featureData = [
  {
    icon: Calendar,
    title: "Flexible Scheduling", // Flexible Scheduling
    description:
      "Configure business hours and let each staff member create their own personalized schedule. Multiple view options including calendar and table views.",
  },
  {
    icon: Users,
    title: "Staff Management", // Staff Management
    description:
      "Add unlimited staff members, assign services to specific team members, and let each staff track their own appointments independently.",
  },
  {
    icon: Bell,
    title: "Real-Time Notifications", // Real-Time Notifications
    description:
      "Staff receive instant notifications when clients book appointments. Confirm or reschedule with one click, and clients get immediate responses.",
  },
  {
    icon: Zap,
    title: "Service Configuration", // Service Configuration
    description:
      "Create unlimited services with custom durations and pricing. Assign services to specific staff members for specialized expertise.",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics", // Performance Analytics
    description:
      "Track revenue, appointments, client retention, and service popularity. Make data-driven decisions to grow your business.",
  },
  {
    icon: Palette,
    title: "Customizable Interface", // Customizable Interface
    description:
      "Every user can personalize their experience with dark mode and multiple color palettes. Make the app truly yours.",
  },
];
export function BenefitsSection({ type }: { type: string }) {
  const list = type == "feature" ? featureData : benefits;

  // Определяне на класовете за grid-а динамично
  const gridClasses =
    type === "feature"
      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" // 3 колони за feature
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"; // 4 колони за benefits

  return (
    <section
      className="
        relative py-5 pt-25 
        bg-gray-50 dark:bg-gray-900 
        md-clip-top-slant
        md:mt-[-97px]
      "
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 font-sans text-gray-900 dark:text-white">
            A great way to save time
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Experience the convenience of modern appointment booking
          </p>
        </div>

        {/* Използване на динамичните класове */}
        <div className={`grid gap-8 ${gridClasses}`}>
          {list.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card
                key={index}
                className="
                  border-none rounded-xl 
                  shadow-lg 
                  hover:shadow-2xl hover:shadow-primary/30 
                  transition-all duration-300
                  hover:-translate-y-2  
                  bg-white dark:bg-gray-800
                "
              >
                <CardContent className="p-8 text-center">
                  <div
                    className="
                    inline-flex items-center justify-center 
                    w-16 h-16 rounded-2xl 
                    bg-primary 
                    text-white 
                    mb-6 
                    shadow-md 
                    shadow-primary/50
                  "
                  >
                    <Icon className="h-8 w-8" />
                  </div>

                  <h3 className="text-xl font-bold mb-3 font-sans text-gray-900 dark:text-white">
                    {benefit.title}
                  </h3>

                  <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
