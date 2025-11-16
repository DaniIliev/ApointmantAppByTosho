"use client";
import React, { useCallback, useState, useMemo, ReactNode } from "react";
import { Badge, Check, Loader2 } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import callApi from "@/app/Api/callApi";
import { Button } from "../ui/button";
import { ScrollReveal } from "../scroll-reveal";
import { Card, CardContent } from "../ui/card";

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
  cycleDisplay: "/месец" | "/година";
  checkoutName: string;
  discountNote: string | null;
}

const PricingSection = () => {
  const { user } = useAuthContext();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly"
  ); // Ограничаваме възможните стойности

  // Типизиране на useCallback
  const handleCheckout = useCallback(
    async (checkoutPlanName: string) => {
      console.log("user", user);
      if (!user?.businessId) {
        console.error("Грешка: businessId липсва. Моля, логнете се.");
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
          console.error("URL адресът за Stripe Checkout липсва в отговора.");
        }
      } catch (error) {
        console.error("Мрежова грешка:", error);
      } finally {
        setLoadingPlan(null); // Деактивира зареждащия индикатор
      }
    },
    [user?.businessId]
  );

  // Хелпер функция за рендиране на бутона (с TS типове)
  const renderPlanButton = (
    checkoutPlanName: string,
    isPrimary: boolean = false
  ): ReactNode => {
    const isLoading = loadingPlan === checkoutPlanName;

    // Определяне на стиловете

    return (
      <Button
        className={`w-full bg-primary hover:bg-primary-dark text-text-primary mt-6`}
        variant={isPrimary ? "default" : "outline"}
        onClick={() => handleCheckout(checkoutPlanName)}
        // Преобразуваме businessId в boolean за disabled props
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Зареждане...
          </span>
        ) : (
          "Купи План / Започни Тест"
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
        description: "Идеален за малки и стартиращи бизнеси.",
        features: [
          "До 3 служители",
          "Неограничен брой срещи",
          "Основна аналитика",
        ],
        isPopular: false,
      },
      {
        name: "Professional",
        monthlyPrice: 15,
        annualPrice: 165, // €15 * 11 месеца
        description: "За растящи бизнеси, нуждаещи се от повече инструменти.",
        features: [
          "До 10 служители",
          "Всички Starter функции",
          "SMS & email нотификации",
          "Разширена аналитика",
          "Приоритетна поддръжка",
        ],
        isPopular: true,
      },
      {
        name: "Enterprise",
        monthlyPrice: 20,
        annualPrice: 220, // €20 * 11 месеца
        description: "За големи организации, изискващи мащабируемост.",
        features: [
          "Неограничен брой служители",
          "Всички Professional функции",
          "Multi-location поддръжка",
          "Пълен API достъп",
          "24/7 телефонна поддръжка",
          "Персонализирани интеграции",
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
        cycleDisplay: "/месец",
        checkoutName: `${plan.name}_Monthly`,
        discountNote: null,
      };
    } else {
      const savingAmount: number = plan.monthlyPrice * 1; // 1 месец спестен
      return {
        price: `€${plan.annualPrice}`,
        cycleDisplay: "/година",
        checkoutName: `${plan.name}_Annual`,
        discountNote: `Спестете €${savingAmount} (1 месец безплатно!)`,
      };
    }
  };

  return (
    <section id="pricing" className="bg-baground py-10 md:py-10 font-inter">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="max-w-6xl mx-auto">
          {/* Заглавна секция */}
          <div className="text-center">
            <ScrollReveal>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-primary">
                Ценообразуване в Евро (€)
              </h2>
              <p className="text-xl sm:text-lg text-text-primary text-balance max-w-3xl mx-auto pt-2">
                Изберете перфектния план за вашия бизнес. Годишните планове ви
                дават 1 месец безплатно!
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
                Месечно
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-6 py-2 text-sm font-medium rounded-lg transition-all relative ${
                  billingCycle === "annual"
                    ? "bg-primary text-white shadow-inner"
                    : "text-text-primary hover:bg-primary-dark"
                }`}
              >
                Годишно
                <Badge className="bg-red-500 text-white text-xs absolute -top-2 -right-4 rotate-3 px-2 py-0.5">
                  -8%
                </Badge>
              </button>
            </div>
          </div>

          {/* Картите с планове */}
          <div className="grid md:grid-cols-3 gap-8">
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
                        Най-популярен
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

                      {/* Използваме checkoutName, който съдържа цикъла на плащане */}
                      {renderPlanButton(checkoutName, plan.isPopular)}
                    </CardContent>
                  </Card>
                </ScrollReveal>
              );
            })}
          </div>

          {/* Индикатор за логнат потребител */}
          <div className="text-center mt-12 text-sm text-gray-500">
            <p className="mt-2 text-primary font-semibold">
              ВАЖНО: За първи път ще видите 50% отстъпка в Stripe Checkout
              страницата.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
