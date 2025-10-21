import { Card, CardContent } from "@/components/ui/card";
import { Clock, Calendar, Shield, Zap } from "lucide-react";

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

export function BenefitsSection() {
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => {
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
