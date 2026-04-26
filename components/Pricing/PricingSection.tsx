"use client";
import React, {
  useCallback,
  useState,
  useMemo,
  ReactNode,
  useEffect,
} from "react";
import { useTranslation } from "react-i18next";
import { Badge, Check, Loader2 } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import callApi from "@/app/Api/callApi";
import { Button } from "../ui/button";
import { ScrollReveal } from "../scroll-reveal";
import { Card, CardContent } from "../ui/card";
import { usePaddingControl } from "@/context/PaddingContext";
import { useGetStaff } from "@/hooks/queries/useStaff";
import { useGetLocations } from "@/hooks/queries/useLocation";
import { PLAN_LIMITS, PlanType } from "@/lib/permissions";

// 1. Дефиниране на TypeScript интерфейси за по-добра структура на данните

/** Интерфейс за структурата на един план */
interface Plan {
  name: "Starter" | "Professional" | "Enterprise"; // Ограничаваме имената на плановете
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  features: string[];
  isPopular: boolean;
}

/** Интерфейс за данните, върнати от getPriceData */
interface PriceData {
  price: string;
  cycleDisplay: "/month" | "/year";
  checkoutName: string;
  discountNote: string | null;
}

const PricingSection = () => {
  const { user } = useAuthContext();
  const { t } = useTranslation();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly"
  ); // Ограничаваме възможните стойности
  const { setRemovePadding } = usePaddingControl();

  const { data: staffData } = useGetStaff(user?.businessId);
  const { data: locationsData } = useGetLocations(user?.businessId);

  const staffCount = staffData?.length || 0;
  const locationCount = locationsData?.length || 0;

  useEffect(() => {
    setRemovePadding(true);
    return () => {
      setRemovePadding(false);
    };
  }, [setRemovePadding]);
  // Типизиране на useCallback
  const handleCheckout = useCallback(
    async (checkoutPlanName: string) => {
      console.log("user", user);
      if (!user?.businessId) {
        console.error(t("Error: businessId missing. Please log in."));
        return;
      }

      setLoadingPlan(checkoutPlanName); // Активира зареждащия индикатор за съответния бутон

      try {
        const payload = {
          planName: checkoutPlanName, // Изпращаме пълното име с цикъла
          businessId: user.businessId,
        };
        const data = await callApi(
          "/api/stripe/checkout-session",
          "POST",
          payload
        );

        if (data.url) {
          window.location.href = data.url;
        } else {
          console.error(t("Stripe Checkout URL missing in response."));
        }
      } catch (error) {
        console.error(t("Network error:"), error);
      } finally {
        setLoadingPlan(null); // Деактивира зареждащия индикатор
      }
    },
    [user?.businessId]
  );

  // Хелпер функция за рендиране на бутона (с TS типове)
  const renderPlanButton = (
    checkoutPlanName: string
    // isPrimary: boolean = false
  ): ReactNode => {
    const isLoading = loadingPlan === checkoutPlanName;

    // Определяне на стиловете

    return (
      <Button
        className={`w-full bg-primary hover:bg-primary-dark mt-6 text-white`}
        // variant={isPrimary ? "default" : "outline"}
        onClick={() => handleCheckout(checkoutPlanName)}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("Loading...")}
          </span>
        ) : (
          t("Purchase Plan / Start Trial")
        )}
      </Button>
    );
  };

  const plans: Plan[] = useMemo(
    () => [
      {
        name: "Starter",
        monthlyPrice: 12,
        annualPrice: 132, 
        description: t("Ideal for small and emerging businesses."),
        features: [
          t("1 Staff member"),
          t("1 Location"),
          t("Full access to all features"),
          t("Unlimited appointments"),
          t("SMS & email notifications"),
          t("Support 24/7 via chat and email"),
        ],
        isPopular: false,
      },
      {
        name: "Professional",
        monthlyPrice: 30,
        annualPrice: 330, // €15 * 11 месеца
        description: t("For growing businesses needing more tools."),
        features: [
          t("Up to 5 staff members"),
          t("Up to 3 locations"),
          t("Full access to all features"),
          t("Unlimited appointments"),
          t("SMS & email notifications"),
          t("Support 24/7 via chat and email"),
        ],
        isPopular: true,
      },
      {
        name: "Enterprise",
        monthlyPrice: 99,
        annualPrice: 990, // €20 * 11 месеца
        description: t("For large organizations requiring scalability."),
        features: [
          t("Unlimited staff members"),
          t("Unlimited locations"),
          t("Full access to all features"),
          t("Custom Branding + Domain"),
          t("Unlimited appointments"),
          t("SMS & email notifications"),
          t("Support 24/7 via chat and email"),
        ],
        isPopular: false,
      },
    ],
    [t]
  );

  const filteredPlans = useMemo(() => {
    if (!user?.businessId) return plans;

    return plans.filter((plan) => {
      const planType = plan.name.toLowerCase() as PlanType;
      const limits = PLAN_LIMITS[planType];

      const staffOk = limits.maxStaff === -1 || staffCount <= limits.maxStaff;
      const locationOk =
        limits.maxLocations === -1 || locationCount <= limits.maxLocations;

      return staffOk && locationOk;
    });
  }, [plans, user?.businessId, staffCount, locationCount]);

  // Изчисляване на текущата цена и цикъл за показване (с TS типове)
  const getPriceData = (plan: Plan): PriceData => {
    if (billingCycle === "monthly") {
      return {
        price: `€${plan.monthlyPrice}`,
        cycleDisplay: "/month",
        checkoutName: `${plan.name}_Monthly`,
        discountNote: null,
      };
    } else {
      const savingAmount: number = plan.monthlyPrice * 1; // 1 месец спестен
      return {
        price: `€${plan.annualPrice}`,
        cycleDisplay: "/year",
        checkoutName: `${plan.name}_Annual`,
        discountNote: t("Save €{{amount}} (1 month free!)", {
          amount: savingAmount,
        }),
      };
    }
  };

  return (
    <section id="pricing" className="bg-muted/30 py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="max-w-6xl mx-auto">
          {/* Заглавна секция */}
          <div className="text-center">
            <ScrollReveal>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-primary">
                {t("Pricing in Euro (€)")}
              </h2>
              <p className="text-xl sm:text-lg text-text-primary text-balance max-w-3xl mx-auto pt-2">
                {t(
                  "Choose the perfect plan for your business. Annual plans give you 1 month free!"
                )}
              </p>
            </ScrollReveal>
          </div>

          {user?.businessId && (
            <ScrollReveal delay={100}>
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mt-8 mb-4 max-w-2xl mx-auto text-center">
                <p className="text-lg font-medium text-primary">
                  {t("Your business status:")}
                </p>
                <div className="flex justify-center  gap-8 mt-2 text-text-primary">
                  <div className="flex gap-1 items-center justify-center">
                    <span className="text-sm opacity-70">
                      {t("Staff members: ")}
                    </span>
                    <span className="text-xl font-bold">{staffCount}</span>
                  </div>
                  <div className="flex gap-1 items-center justify-center">
                    <span className="text-sm opacity-70">{t("Locations: ")}</span>
                    <span className="text-xl font-bold">{locationCount}</span>
                  </div>
                </div>
                <p className="text-sm text-text-primary/60 mt-4 italic">
                  {t("Showing plans suitable for your current usage.")}
                </p>
              </div>
            </ScrollReveal>
          )}

          {/* Превключвател за Цикъла на Плащане */}
          <div className="flex justify-center mt-4 mb-6">
            <div className="inline-flex rounded-xl bg-baground p-1 shadow-md border border-primary/20">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2 text-sm font-medium rounded-lg transition-all ${
                  billingCycle === "monthly"
                    ? "bg-primary text-white shadow-inner"
                    : "text-text-primary hover:bg-primary-dark"
                }`}
              >
                {t("Monthly")}
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-6 py-2 text-sm font-medium rounded-lg transition-all relative ${
                  billingCycle === "annual"
                    ? "bg-primary text-white shadow-inner"
                    : "text-text-primary hover:bg-primary-dark"
                }`}
              >
                {t("Annual")}
                <Badge className="bg-red-500 text-white text-xs absolute -top-2 -right-4 rotate-3 px-2 py-0.5">
                  -8%
                </Badge>
              </button>
            </div>
          </div>

          {/* Картите с планове */}
          <div className="flex flex-wrap lg:flex-nowrap justify-center gap-6 mt-8 md:mt-12">
            {filteredPlans.map((plan, index) => {
              const planData = getPriceData(plan);
              const { price, cycleDisplay, checkoutName, discountNote } =
                planData;

              return (
                <ScrollReveal key={plan.name} delay={100 * (index + 1)} className="w-full max-w-[400px] lg:flex-1 lg:max-w-[380px]">
                  <Card
                    className={`h-full flex flex-col transition-all duration-300 hover:-translate-y-2 
                            ${
                              plan.isPopular
                                ? "border-2 border-primary shadow-xl relative"
                                : "border-2 border-primary/20"
                            }`}
                  >
                    {plan.isPopular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-text-primary bg-accent rounded-full px-4 py-1 shadow-md">
                        {t("Most Popular")}
                      </div>
                    )}
                    <CardContent className="flex-grow flex flex-col p-8">
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold mb-2 text-primary">
                          {plan.name}
                        </h3>
                        <p className="text-text-primary">{plan.description}</p>
                      </div>

                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-6xl font-extrabold text-primary">
                          {price.substring(0, 1)}
                        </span>
                        <span className="text-6xl font-extrabold text-primary">
                          {price.substring(1)}
                        </span>
                        <span className="text-xl text-text-primary">
                          {cycleDisplay}
                        </span>
                      </div>

                      {discountNote && (
                        <p className="text-sm text-green-600 font-semibold mb-6">
                          {discountNote}
                        </p>
                      )}

                      <ul
                        className={`space-y-4 flex-grow ${
                          discountNote ? "mt-0" : "mt-4"
                        }`}
                      >
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-base text-text-primary/60">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {renderPlanButton(checkoutName)}
                    </CardContent>
                  </Card>
                </ScrollReveal>
              );
            })}
          </div>

          {/* Индикатор за логнат потребител */}
          <div className="text-center mt-12 text-sm text-gray-500">
            <p className="mt-2 text-red-500 font-semibold">
              {t(
                "IMPORTANT: The first time you will see a 50% discount on the Stripe Checkout page."
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
