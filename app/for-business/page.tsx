import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  TrendingUp,
  Clock,
  Bell,
  CreditCard,
  BarChart3,
  Shield,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  Star,
  Filter,
  Mail,
  UserPlus,
  CalendarCheck,
  Table,
  Settings,
  PieChart,
  LineChart,
} from "lucide-react";
import Link from "next/link";

export default function ForBusinessPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50 backdrop-blur-sm bg-card/95 transition-all">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Calendar className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold font-sans">BookEase</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </a>
            <a
              href="#testimonials"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Testimonials
            </a>
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              For Clients
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Image Section */}
      <section className="relative h-[400px] md:h-[500px] overflow-hidden">
        <img
          src="/business-owner-managing-appointments-on-tablet-in-.jpg"
          alt="Business management"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </section>

      {/* Hero Section */}
      <section className="relative -mt-64 md:-mt-80 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary text-primary-foreground animate-in fade-in slide-in-from-bottom-4 duration-700">
              For Business Owners
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance font-sans animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
              Grow your business with smart appointment management
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 text-balance leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              Join thousands of businesses using BookEase to automate
              scheduling, reduce no-shows, and attract new clients. Start your
              free trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
              <Button
                size="lg"
                className="text-lg px-8 hover:scale-105 transition-transform"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 bg-transparent hover:scale-105 transition-transform"
              >
                Watch Demo
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4 animate-in fade-in duration-700 delay-700">
              No credit card required • 14-day free trial
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center hover:scale-105 transition-transform">
              <div className="text-4xl font-bold text-primary mb-2 font-sans">
                10K+
              </div>
              <div className="text-sm text-muted-foreground">
                Active Businesses
              </div>
            </div>
            <div className="text-center hover:scale-105 transition-transform">
              <div className="text-4xl font-bold text-primary mb-2 font-sans">
                2M+
              </div>
              <div className="text-sm text-muted-foreground">
                Appointments Booked
              </div>
            </div>
            <div className="text-center hover:scale-105 transition-transform">
              <div className="text-4xl font-bold text-primary mb-2 font-sans">
                40%
              </div>
              <div className="text-sm text-muted-foreground">
                Fewer No-Shows
              </div>
            </div>
            <div className="text-center hover:scale-105 transition-transform">
              <div className="text-4xl font-bold text-primary mb-2 font-sans">
                4.9★
              </div>
              <div className="text-sm text-muted-foreground">
                Average Rating
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 font-sans">
              Complete appointment management platform
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage appointments, staff, and grow your
              business
            </p>
          </div>

          {/* Appointment Management */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold mb-4 font-sans">
                Powerful Appointment Management
              </h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Track, filter, and manage all your appointments in one place
              </p>
            </div>

            {/* Feature Images */}
            <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-6xl mx-auto">
              <div className="rounded-xl overflow-hidden shadow-xl border border-border hover:scale-[1.02] transition-transform duration-300">
                <img
                  src="/modern-appointment-calendar-interface-with-color-c.jpg"
                  alt="Calendar view of appointments"
                  className="w-full h-auto"
                />
              </div>
              <div className="rounded-xl overflow-hidden shadow-xl border border-border hover:scale-[1.02] transition-transform duration-300">
                <img
                  src="/appointment-table-view-with-filters-status-columns.jpg"
                  alt="Table view of appointments with filters"
                  className="w-full h-auto"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Calendar,
                  title: "Calendar View",
                  description:
                    "Visualize all appointments in an intuitive calendar interface. See your entire schedule at a glance with color-coded appointments.",
                },
                {
                  icon: Table,
                  title: "Table View",
                  description:
                    "Switch to table view for detailed appointment lists. Sort, search, and manage appointments with powerful filtering options.",
                },
                {
                  icon: Filter,
                  title: "Advanced Filters",
                  description:
                    "Filter appointments by date, staff member, service type, status, and more. Find exactly what you need instantly.",
                },
                {
                  icon: Bell,
                  title: "Real-Time Notifications",
                  description:
                    "Get instant notifications when clients book appointments. Never miss a booking request with push and email alerts.",
                },
                {
                  icon: CalendarCheck,
                  title: "Appointment Confirmation",
                  description:
                    "Staff can review and confirm appointment requests. Maintain control over your schedule with approval workflows.",
                },
                {
                  icon: Mail,
                  title: "Automatic Email Confirmations",
                  description:
                    "Clients receive professional email confirmations after staff approval. Reduce confusion and no-shows with clear communication.",
                },
              ].map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={index}
                    className="border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <CardContent className="p-6">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4 transition-transform hover:scale-110">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 font-sans">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Staff & Schedule Management */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold mb-4 font-sans">
                Staff & Schedule Management
              </h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Coordinate your team and manage schedules effortlessly
              </p>
            </div>

            {/* Feature Images */}
            <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-6xl mx-auto">
              <div className="rounded-xl overflow-hidden shadow-xl border border-border hover:scale-[1.02] transition-transform duration-300">
                <img
                  src="/staff-management-dashboard-with-team-members-profi.jpg"
                  alt="Staff management interface"
                  className="w-full h-auto"
                />
              </div>
              <div className="rounded-xl overflow-hidden shadow-xl border border-border hover:scale-[1.02] transition-transform duration-300">
                <img
                  src="/weekly-schedule-calendar-showing-staff-availabilit.jpg"
                  alt="Staff schedule management"
                  className="w-full h-auto"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: UserPlus,
                  title: "Add Staff Members",
                  description:
                    "Easily add and manage staff users. Assign roles, permissions, and service capabilities to each team member.",
                },
                {
                  icon: Clock,
                  title: "Business Schedule",
                  description:
                    "Set your business operating hours, holidays, and break times. Define when your business is available for bookings.",
                },
                {
                  icon: Settings,
                  title: "Individual Staff Schedules",
                  description:
                    "Each staff member can edit their own availability. Manage personal time off and working hours independently.",
                },
                {
                  icon: Users,
                  title: "Team Coordination",
                  description:
                    "View all staff schedules in one place. Coordinate team availability and prevent scheduling conflicts.",
                },
                {
                  icon: Shield,
                  title: "Role-Based Access",
                  description:
                    "Control what each staff member can see and do. Protect sensitive business information with permission levels.",
                },
                {
                  icon: Smartphone,
                  title: "Mobile Staff Access",
                  description:
                    "Staff can manage their schedules and appointments from anywhere using the mobile app.",
                },
              ].map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={index}
                    className="border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <CardContent className="p-6">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4 transition-transform hover:scale-110">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 font-sans">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Performance Tracking */}
          <div>
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold mb-4 font-sans">
                Performance Tracking & Analytics
              </h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Make data-driven decisions with comprehensive analytics
              </p>
            </div>

            {/* Analytics Dashboard Image */}
            <div className="mb-12 max-w-6xl mx-auto rounded-xl overflow-hidden shadow-2xl border border-border hover:scale-[1.02] transition-transform duration-500">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-10-05%20115659-5ANW40Z80wjv5FQls3V9pCkRfU3XFs.png"
                alt="Performance analytics dashboard with charts and metrics"
                className="w-full h-auto"
              />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: BarChart3,
                  title: "Business Performance",
                  description:
                    "Track overall business metrics including total appointments, revenue, client retention, and growth trends.",
                },
                {
                  icon: PieChart,
                  title: "Staff Performance",
                  description:
                    "Monitor individual staff performance. See appointments completed, revenue generated, and client ratings per staff member.",
                },
                {
                  icon: Filter,
                  title: "Flexible Time Periods",
                  description:
                    "Filter analytics by day, week, month, quarter, or custom date ranges. Compare performance across different periods.",
                },
                {
                  icon: LineChart,
                  title: "Revenue Tracking",
                  description:
                    "Visualize revenue trends over time. Track income by service type, staff member, and time period.",
                },
                {
                  icon: TrendingUp,
                  title: "Growth Insights",
                  description:
                    "Identify trends and opportunities. See which services are most popular and when your busiest times are.",
                },
                {
                  icon: CreditCard,
                  title: "Financial Reports",
                  description:
                    "Generate detailed financial reports for accounting and tax purposes. Export data for further analysis.",
                },
              ].map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={index}
                    className="border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <CardContent className="p-6">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4 transition-transform hover:scale-110">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 font-sans">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 font-sans">
              Grow your business with BookEase
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful analytics and insights to help you make data-driven
              decisions
            </p>
          </div>

          {/* Dashboard Preview Image */}
          <div className="max-w-6xl mx-auto mb-16 rounded-xl overflow-hidden shadow-2xl border border-border hover:scale-[1.02] transition-transform duration-500">
            <img
              src="/images/design-mode/Screenshot%202025-10-05%20115659.png"
              alt="BookEase Business Dashboard Analytics"
              className="w-full h-auto"
            />
          </div>

          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 font-sans">
              Get started in minutes
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple setup process to get your business online
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "1",
                title: "Create Your Profile",
                description:
                  "Add your business details, services, and staff information in just a few clicks.",
              },
              {
                step: "2",
                title: "Set Your Availability",
                description:
                  "Configure your working hours, break times, and booking preferences.",
              },
              {
                step: "3",
                title: "Start Accepting Bookings",
                description:
                  "Share your booking page and start receiving appointments immediately.",
              },
            ].map((step, index) => (
              <div
                key={index}
                className="text-center hover:scale-105 transition-transform duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4 font-sans hover:shadow-lg transition-shadow">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-2 font-sans">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 font-sans">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your business needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Starter",
                price: "$29",
                period: "/month",
                description:
                  "Perfect for solo practitioners and small businesses",
                features: [
                  "Up to 100 appointments/month",
                  "1 staff member",
                  "Online booking page",
                  "Email reminders",
                  "Basic analytics",
                  "Mobile app access",
                ],
                popular: false,
              },
              {
                name: "Professional",
                price: "$79",
                period: "/month",
                description: "Ideal for growing businesses with multiple staff",
                features: [
                  "Unlimited appointments",
                  "Up to 5 staff members",
                  "Custom booking page",
                  "SMS & email reminders",
                  "Advanced analytics",
                  "Payment processing",
                  "Priority support",
                ],
                popular: true,
              },
              {
                name: "Enterprise",
                price: "$199",
                period: "/month",
                description: "For large businesses with advanced needs",
                features: [
                  "Everything in Professional",
                  "Unlimited staff members",
                  "Multiple locations",
                  "API access",
                  "Custom integrations",
                  "Dedicated account manager",
                  "White-label options",
                ],
                popular: false,
              },
            ].map((plan, index) => (
              <Card
                key={index}
                className={`relative hover:scale-105 transition-all duration-300 ${
                  plan.popular
                    ? "border-2 border-primary shadow-lg"
                    : "border-border hover:shadow-lg"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-2 font-sans">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    {plan.description}
                  </p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold font-sans">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <Button
                    className="w-full mb-6 hover:scale-105 transition-transform"
                    variant={plan.popular ? "default" : "outline"}
                  >
                    Start Free Trial
                  </Button>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-start gap-2 text-sm"
                      >
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 font-sans">
              Loved by business owners
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See what our customers have to say about BookEase
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Sarah Martinez",
                business: "Luxe Hair Salon",
                quote:
                  "BookEase has transformed how we manage appointments. We've seen a 40% reduction in no-shows and our clients love the convenience.",
                rating: 5,
              },
              {
                name: "Dr. James Chen",
                business: "Bright Smile Dental",
                quote:
                  "The automated reminders and easy rescheduling have saved us countless hours. Our front desk staff can now focus on patient care.",
                rating: 5,
              },
              {
                name: "Emily Rodriguez",
                business: "Serenity Spa",
                quote:
                  "We've attracted so many new clients through the platform. The analytics help us understand our business better and make smarter decisions.",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <Card
                key={index}
                className="border-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 fill-primary text-primary"
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {testimonial.quote}
                  </p>
                  <div>
                    <p className="font-semibold font-sans">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.business}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-accent/5 to-background">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto border-2 border-primary/20 hover:shadow-2xl transition-shadow duration-300">
            <CardContent className="p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 font-sans">
                  Ready to grow your business?
                </h2>
                <p className="text-lg text-muted-foreground">
                  Start your 14-day free trial today. No credit card required.
                </p>
              </div>

              <form className="max-w-md mx-auto space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="business-name">Business Name</Label>
                  <Input
                    id="business-name"
                    placeholder="Enter your business name"
                    className="transition-all focus:scale-[1.02]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@business.com"
                    className="transition-all focus:scale-[1.02]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    className="transition-all focus:scale-[1.02]"
                  />
                </div>
                <Button
                  className="w-full hover:scale-105 transition-transform"
                  size="lg"
                >
                  Start Free Trial
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  By signing up, you agree to our Terms of Service and Privacy
                  Policy
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
