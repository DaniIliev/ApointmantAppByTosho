"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Star,
  Clock,
  ArrowRight,
  Heart,
  TrendingUp,
  Award,
} from "lucide-react";
import Link from "next/link";

// Mock data for businesses
const businesses = [
  {
    id: 1,
    name: "Luxe Hair Salon",
    category: "Hair & Beauty",
    rating: 4.8,
    reviews: 234,
    address: "123 Main St, Downtown",
    city: "New York",
    image: "/modern-hair-salon.png",
    openNow: true,
    nextAvailable: "Today at 2:00 PM",
  },
  {
    id: 2,
    name: "Serenity Spa & Wellness",
    category: "Spa & Massage",
    rating: 4.9,
    reviews: 189,
    address: "456 Oak Ave, Midtown",
    city: "New York",
    image: "/luxury-spa-interior.png",
    openNow: true,
    nextAvailable: "Tomorrow at 10:00 AM",
  },
  {
    id: 3,
    name: "Bright Smile Dental",
    category: "Dental Care",
    rating: 4.7,
    reviews: 156,
    address: "789 Park Blvd, Uptown",
    city: "New York",
    image: "/modern-dental-clinic.png",
    openNow: false,
    nextAvailable: "Monday at 9:00 AM",
  },
  {
    id: 4,
    name: "FitLife Training Studio",
    category: "Fitness & Training",
    rating: 4.6,
    reviews: 203,
    address: "321 Fitness Way, Downtown",
    city: "New York",
    image: "/modern-fitness-studio.png",
    openNow: true,
    nextAvailable: "Today at 5:00 PM",
  },
  {
    id: 5,
    name: "Tranquil Mind Therapy",
    category: "Counseling",
    rating: 5.0,
    reviews: 98,
    address: "654 Wellness Dr, Westside",
    city: "New York",
    image: "/therapy-office-interior.jpg",
    openNow: true,
    nextAvailable: "Today at 3:30 PM",
  },
  {
    id: 6,
    name: "Glow Beauty Bar",
    category: "Beauty & Skincare",
    rating: 4.8,
    reviews: 167,
    address: "987 Beauty Lane, Eastside",
    city: "New York",
    image: "/beauty-salon-interior.png",
    openNow: true,
    nextAvailable: "Tomorrow at 11:00 AM",
  },
];

export function BusinessList() {
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="overflow-hidden animate-pulse">
            <div className="h-48 bg-muted" />
            <CardContent className="p-5 space-y-3">
              <div className="h-6 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-10 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold mb-2 font-sans">
            No businesses found
          </h3>
          <p className="text-muted-foreground mb-6">
            Try adjusting your search filters or explore different appointment
            types
          </p>
          <Button variant="outline">Clear Filters</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-background">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-semibold text-foreground">
            {businesses.length}
          </span>{" "}
          businesses
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Button variant="ghost" size="sm" className="text-sm">
            <TrendingUp className="h-4 w-4 mr-1" />
            Most Popular
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {businesses.map((business, index) => (
          <Card
            key={business.id}
            className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group h-full animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="relative h-48 overflow-hidden">
              <Link href={`/business/68eec2193442d296c38f016b`}>
                <img
                  src={business.image || "/placeholder.svg"}
                  alt={business.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  toggleFavorite(business.id);
                }}
                className="absolute top-3 left-3 p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-all hover:scale-110"
              >
                <Heart
                  className={`h-4 w-4 transition-colors ${
                    favorites.includes(business.id)
                      ? "fill-destructive text-destructive"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
              {business.openNow && (
                <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground animate-in fade-in duration-500">
                  Open Now
                </Badge>
              )}
              {business.rating >= 4.8 && (
                <Badge className="absolute bottom-3 left-3 bg-primary text-primary-foreground flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  Top Rated
                </Badge>
              )}
            </div>
            <CardContent className="p-5">
              <Link href={`/business/${business.id}`}>
                <div className="mb-3">
                  <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors duration-300 font-sans">
                    {business.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {business.category}
                  </p>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="font-semibold text-sm">
                      {business.rating}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({business.reviews} reviews)
                  </span>
                </div>

                <div className="flex items-start gap-2 mb-3 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{business.address}</span>
                </div>

                <div className="flex items-center gap-2 text-sm mb-4">
                  <Clock className="h-4 w-4 flex-shrink-0 text-accent" />
                  <span className="text-accent font-medium">
                    Next: {business.nextAvailable}
                  </span>
                </div>

                <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 group-hover:scale-105">
                  View Details
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
