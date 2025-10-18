"use client";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  MapPin,
  Phone,
  Globe,
  Mail,
  ArrowLeft,
  Clock,
} from "lucide-react"; // Добавяме Clock
import { CustomTooltip } from "../customUIComponents/CustomTooltip";
// Може да ви трябват и компоненти като DropdownMenu, Popover или Dialog
// import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
// import { Button } from "@/components/ui/button"; // За бутона за работно време
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { BusinessData } from "@/app/business/[id]/page";
import { isBusinessOpenNow } from "@/Global/Utils/commonFn";

interface BusinessHeaderProps {
  business: BusinessData;
}
export function BusinessHeader({ business }: BusinessHeaderProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const now = new Date();
  const dayIndex = now.getDay();
  const days: string[] = [
    t("Sunday"),
    t("Monday"),
    t("Tuesday"),
    t("Wednesday"),
    t("Thursday"),
    t("Friday"),
    t("Saturday"),
  ];
  const todayName = days[dayIndex];

  const isOpen = isBusinessOpenNow(business.schedule);
  const isClosed = !isOpen;
  return (
    <div className="relative bg-card border-b border-border shadow-md">
      <div className="absolute top-4 right-4 z-10">
        <CustomTooltip
          onClick={() => router.back()}
          tooltipText={t("Back")}
          icon={<ArrowLeft className="hover:text-primary h-6 w-6" />} // По-визуален бутон
        />
      </div>
      <div className="container mx-auto px-4 py-10 lg:py-16">
        <div className="grid md:grid-cols-12 gap-8">
          <div className="md:col-span-5 relative h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden shadow-lg">
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

            {/* Contacts and Location - Стилизираме малко по-добре */}
            <div className="space-y-4 text-base text-muted-foreground">
              {/* Работно време - Новото добавяне */}
              <div className="flex items-center gap-3 font-semibold">
                <Clock
                  className="h-5 w-5 flex-shrink-0"
                  style={{
                    color: isClosed ? "hsl(0, 80%, 50%)" : "hsl(142, 71%, 45%)",
                  }}
                />{" "}
                {/* Червено/Зелено */}
                <span className={isClosed ? "text-red-500" : "text-green-600"}>
                  {isClosed ? t("CLOSED") : t("OPEN")} {t("NOW")}
                </span>
                <span className="font-normal text-foreground">
                  {todayName}: ({business.schedule.monday})
                </span>
              </div>

              {/* Адрес */}
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" />
                <span className="hover:text-foreground transition-colors cursor-pointer">
                  {business.address}, {business.city}
                </span>
              </div>

              {/* Телефон */}
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 flex-shrink-0 text-primary" />
                <a
                  href={`tel:${business.phone}`}
                  className="hover:text-primary font-medium transition-colors"
                >
                  {business.phone}
                </a>
              </div>

              {/* Имейл */}
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 flex-shrink-0 text-primary" />
                <a
                  href={`mailto:${business.email}`}
                  className="hover:text-primary transition-colors"
                >
                  {business.email}
                </a>
              </div>

              {/* Уебсайт */}
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 flex-shrink-0 text-primary" />
                <a
                  href={`https://${business.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  {business.website}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
