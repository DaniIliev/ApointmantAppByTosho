"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import callApi from "@/app/Api/callApi";
import { AppointmentType } from "@/Global/Types/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/Global/Utils/commonFn";

// Групиране на услугите по категория
const groupServicesByCategory = (services: AppointmentType[]) => {
  return services.reduce((acc, service) => {
    const category = service.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(service);
    return acc;
  }, {} as Record<string, AppointmentType[]>);
};

export function ServicesSection({ businessId }: { businessId: string }) {
  const { t } = useTranslation();
  const [services, setServices] = useState<Record<string, AppointmentType[]>>();
  const [categories, setCategories] = useState<string[]>([]);

  const fetchBusinessServices = async () => {
    const result = await callApi(
      `/api/service?businessId=${businessId}`,
      "GET"
    );
    const categorizedServices = groupServicesByCategory(result);
    const categories = Object.keys(categorizedServices);
    setCategories(categories);
    setServices(categorizedServices);
  };

  useEffect(() => {
    fetchBusinessServices();
  }, []);

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row justify-between items-center border-b p-4">
        <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2 text-primary">
          <DollarSign className="h-6 w-6 text-primary" />
          {t("Services and Price List")}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <div className="space-y-8 p-6">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="text-2xl font-semibold mb-4 text-foreground border-b-2 border-primary/50 pb-2">
                {category}
              </h3>

              <div className="space-y-4">
                {services &&
                  services[category].map((service) => (
                    <div
                      key={service._id}
                      className="flex items-start justify-between gap-6 p-4 rounded-xl bg-background/60 border border-border/70 hover:border-primary/50 transition-all shadow-sm"
                    >
                      <div className="flex-1 flex items-start gap-4">
                        <div className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 shadow-md">
                          <img
                            src={service.imageUrl || "/default-service.png"}
                            alt={service.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div>
                          <h4 className="text-lg font-bold text-foreground mb-1">
                            {service.name}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {service.description}
                          </p>

                          <div className="flex items-center gap-4 text-sm font-medium mb-3">
                            <div className="flex items-center gap-1 text-primary">
                              <Clock className="h-4 w-4" />
                              <span>{service.duration} мин.</span>
                            </div>
                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                              <DollarSign className="h-4 w-4" />
                              <span>{service.price} лв.</span>
                            </div>
                          </div>

                          {service.staffs && service.staffs.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 mt-3">
                              <span className="text-m text-muted-foreground mr-2">
                                {t("Performed by")}:
                              </span>

                              {/* Чипове за служители */}
                              {service.staffs.map((staff) => (
                                <div
                                  key={staff._id}
                                  className="flex items-center gap-2 bg-gradient-to-tr from-primary/10 to-primary/20 border border-primary/20 
                   rounded-full px-3 py-1.5 shadow-sm hover:shadow-md hover:from-primary/20 hover:to-primary/30
                   transition-all duration-300 cursor-pointer group"
                                >
                                  <Avatar className="h-6 w-6 border border-primary/40 shadow-sm">
                                    <AvatarImage
                                      src={(staff as any).imageUrl}
                                      alt={staff.name}
                                      className="object-cover"
                                    />
                                    <AvatarFallback className="bg-primary text-white text-xs font-semibold">
                                      {getInitials(staff.name)}
                                    </AvatarFallback>
                                  </Avatar>

                                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                    {staff.name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row gap-2 flex-shrink-0">
                        <Button
                          size="default"
                          className="min-w-[120px] bg-primary hover:bg-primary-dark transition-colors"
                          onClick={() => console.log(`Book ${service.name}`)}
                        >
                          {t("Book Appointment")}
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
