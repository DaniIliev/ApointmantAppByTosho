"use client";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  Globe,
  Mail,
  Info,
  MapPin,
} from "lucide-react"
import { useTranslation } from "react-i18next";
import { Business } from "@/Global/Types/types";
import { Card, CardHeader, CardTitle } from "../ui/card";

interface BusinessHeaderProps {
  business: Business;
}
export function BusinessHeader({ business }: BusinessHeaderProps) {
  const { t } = useTranslation();

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center border-b">
        <Info className="h-6 w-6 text-primary mr-2" />
        <CardTitle className="font-bold text-2xl font-sans text-primary">
          {t("Business Information")}
        </CardTitle>
      </CardHeader>
      <div className="container mx-auto px-4 py-6 lg:py-6">
        <div className="flex flex-col md:grid md:grid-cols-12 gap-8">
          <div className=" items-center md:col-span-5 relative h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden shadow-lg">
            <img
              src={business.businessImageUrl || "/default-business-image.png"}
              alt={business.businessName}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.03]" // Добавяме hover ефект
            />
          </div>
          <div className="md:col-span-7 flex flex-col justify-center">
            <Badge className="w-fit mb-3 text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors">
              {business.category}
            </Badge>

            <h1 className="text-3xl lg:text-5xl font-extrabold mb-4 text-foreground tracking-tight">
              {business.businessName}
            </h1>

            <div className="flex flex-wrap gap-4 mb-6">
              {business.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>{business.phone}</span>
                </div>
              )}
              {business.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>{business.email}</span>
                </div>
              )}
              {business.website && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
                  <Globe className="h-4 w-4 text-primary" />
                  <a href={business.website.startsWith('http') ? business.website : `https://${business.website}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    {business.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              {business.address && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{business.address}, {business.city}</span>
                </div>
              )}
            </div>

            {/* About Us Section */}
            {business.aboutUs && (
              <div className="mt-8 pt-6 border-t border-border/50">
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  {t("About us")}
                </h3>
                <p className="text-muted-foreground whitespace-pre-wrap text-[15px] leading-relaxed">
                  {business.aboutUs}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
