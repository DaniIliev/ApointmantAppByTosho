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
        monthlyPrice: 10,
        annualPrice: 110, // €10 * 11 месеца
        description: t("Ideal for small and emerging businesses."),
        features: [
          t("Up to 2 staff"),
          t("Unlimited appointments"),
          t("SMS & email notifications"),
          t("Support 24/7 via chat and email"),
          // t("Basic analytics"),
        ],
        isPopular: false,
      },
      {
        name: "Professional",
        monthlyPrice: 15,
        annualPrice: 165, // €15 * 11 месеца
        description: t("For growing businesses needing more tools."),
        features: [
          t("Up to 5 staff"),
          t("All Starter features"),
          t("Performance & Analytics"),
        ],
        isPopular: true,
      },
      {
        name: "Enterprise",
        monthlyPrice: 20,
        annualPrice: 220, // €20 * 11 месеца
        description: t("For large organizations requiring scalability."),
        features: [
          t("Unlimited staff"),
          t("All Professional features"),
          t("Multi-location support"),
          t("Full API access"),
          t("Custom integrations"),
        ],
        isPopular: false,
      },
    ],
    []
  );

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
          <div className="grid md:grid-cols-3 gap-8 mt-8 md:mt-12">
            {plans.map((plan, index) => {
              const planData = getPriceData(plan);
              const { price, cycleDisplay, checkoutName, discountNote } =
                planData;

              return (
                <ScrollReveal key={plan.name} delay={100 * (index + 1)}>
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
