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
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-sans">
            A great way to save time
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the convenience of modern appointment booking
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card
                key={index}
                className="border-border hover:border-primary/50 transition-colors"
              >
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 font-sans">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
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
