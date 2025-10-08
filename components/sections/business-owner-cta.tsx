import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Calendar, Users, TrendingUp } from "lucide-react";
import Link from "next/link";

export function BusinessOwnerCTA() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-accent/5 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <Card className="overflow-hidden border-2 border-primary/20">
            <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 font-sans text-balance">
                  Grow your business with BookEase
                </h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Join thousands of businesses using our platform to manage
                  appointments, reduce no-shows, and attract new clients.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 font-sans">
                        Smart Scheduling
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Automated booking system that works 24/7
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 font-sans">
                        Client Management
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Keep track of clients and their preferences
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 font-sans">
                        Business Insights
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Analytics to help you grow and optimize
                      </p>
                    </div>
                  </div>
                </div>

                <Link href="/for-business">
                  <Button size="lg" className="w-full md:w-auto">
                    Get Started for Free
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>

              <div className="hidden md:flex items-center justify-center">
                <div className="relative w-full h-full min-h-[300px]">
                  <img
                    src="/business-dashboard-analytics.jpg"
                    alt="Business Dashboard"
                    className="rounded-lg shadow-xl object-cover w-full h-full"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
