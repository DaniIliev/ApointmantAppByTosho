"úse client";
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
      // checkoutPlanName ще бъде във формат като 'Starter_Monthly' или 'Professional_Annual'
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
    const primaryClass =
      "bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500";
    const outlineClass =
      "bg-white border-gray-300 text-gray-700 hover:bg-gray-100 focus:ring-gray-400";

    return (
      <Button
        className={`w-full ${isPrimary ? primaryClass : outlineClass} mt-6`}
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

  // Дефиниране на данните за плановете, включително годишните цени (11 месеца)
  // Типизиране на useMemo
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
    <section id="pricing" className="bg-gray-50 py-16 md:py-24 font-inter">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="max-w-6xl mx-auto">
          {/* Заглавна секция */}
          <div className="text-center">
            <ScrollReveal>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-balance text-gray-900">
                Ценообразуване в Евро (€)
              </h2>
              <p className="text-xl text-gray-500 text-balance max-w-3xl mx-auto pt-2">
                Изберете перфектния план за вашия бизнес. Годишните планове ви
                дават 1 месец безплатно!
              </p>
            </ScrollReveal>
          </div>

          {/* Превключвател за Цикъла на Плащане */}
          <div className="flex justify-center mt-12 mb-16">
            <div className="inline-flex rounded-xl bg-white p-1 shadow-md border border-gray-200">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2 text-sm font-medium rounded-lg transition-all ${
                  billingCycle === "monthly"
                    ? "bg-indigo-600 text-white shadow-inner"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Месечно
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-6 py-2 text-sm font-medium rounded-lg transition-all relative ${
                  billingCycle === "annual"
                    ? "bg-indigo-600 text-white shadow-inner"
                    : "text-gray-600 hover:bg-gray-100"
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
                // Използваме index за delay, въпреки че ScrollReveal е имитиран
                <ScrollReveal key={plan.name} delay={100 * (index + 1)}>
                  <Card
                    className={`h-full flex flex-col transition-all duration-300 hover:-translate-y-2 
                            ${
                              plan.isPopular
                                ? "border-2 border-indigo-600 shadow-xl relative"
                                : "border-2 border-gray-200"
                            }`}
                  >
                    {plan.isPopular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <Badge className="bg-indigo-600 text-white px-4 py-1 text-sm font-medium shadow-md">
                          Най-популярен
                        </Badge>
                      </div>
                    )}
                    <CardContent className="flex-grow flex flex-col p-8">
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold mb-2 text-gray-900">
                          {plan.name}
                        </h3>
                        <p className="text-gray-500">{plan.description}</p>
                      </div>

                      <div className="flex items-baseline gap-2 mb-2">
                        {/* Разделяме за по-добро показване на валутата */}
                        <span className="text-6xl font-extrabold text-gray-900">
                          {price.substring(0, 1)}
                        </span>
                        <span className="text-6xl font-extrabold text-gray-900">
                          {price.substring(1)}
                        </span>
                        <span className="text-xl text-gray-500">
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
                            <Check className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                            <span className="text-base text-gray-700">
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
            <p className="mt-2 text-indigo-600 font-semibold">
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

// const PricingSection = () => {
//   return (
//     <section id="pricing" className="bg-muted/30 py-6 md:py-8">
//       <div className="container mx-auto px-4">
//         <div className="max-w-6xl mx-auto">
//           {/* Заглавна секция */}
//           <div className="text-center">
//             {/* ScrollReveal е външен компонент и трябва да бъде наличен */}
//             <ScrollReveal className="fade-up">
//               <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
//                 Simple, Transparent Pricing
//               </h2>
//               <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto pt-2">
//                 Choose the perfect plan for your business. All plans include a
//                 14-day free trial.
//               </p>
//             </ScrollReveal>
//           </div>

//           {/* Картите с планове */}
//           <div className="grid md:grid-cols-3 gap-8 mt-12">
//             {/* План 1: Starter */}
//             <ScrollReveal className="fade-up" delay={100}>
//               <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
//                 <CardContent className="p-8 space-y-6">
//                   <div>
//                     <h3 className="text-2xl font-bold mb-2">Starter</h3>
//                     <p className="text-muted-foreground">
//                       Perfect for small businesses
//                     </p>
//                   </div>
//                   <div className="flex items-baseline gap-2">
//                     <span className="text-5xl font-bold">$29</span>
//                     <span className="text-muted-foreground">/month</span>
//                   </div>
//                   <ul className="space-y-3">
//                     <li className="flex items-center gap-3">
//                       <Check className="h-5 w-5 text-primary flex-shrink-0" />
//                       <span className="text-sm">Up to 3 staff members</span>
//                     </li>
//                     <li className="flex items-center gap-3">
//                       <Check className="h-5 w-5 text-primary flex-shrink-0" />
//                       <span className="text-sm">Unlimited appointments</span>
//                     </li>
//                     <li className="flex items-center gap-3">
//                       <Check className="h-5 w-5 text-primary flex-shrink-0" />
//                       <span className="text-sm">Calendar & table views</span>
//                     </li>
//                     <li className="flex items-center gap-3">
//                       <Check className="h-5 w-5 text-primary flex-shrink-0" />
//                       <span className="text-sm">Email notifications</span>
//                     </li>
//                     <li className="flex items-center gap-3">
//                       <Check className="h-5 w-5 text-primary flex-shrink-0" />
//                       <span className="text-sm">Basic analytics</span>
//                     </li>
//                   </ul>
//                   <Button className="w-full bg-transparent" variant="outline">
//                     Start Free Trial
//                   </Button>
//                 </CardContent>
//               </Card>
//             </ScrollReveal>

//             {/* План 2: Professional (Най-популярен) */}
//             <ScrollReveal className="fade-up" delay={200}>
//               <Card className="border-2 border-primary shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative">
//                 <div className="absolute -top-4 left-1/2 -translate-x-1/2">
//                   <Badge className="bg-primary text-primary-foreground px-4 py-1">
//                     Most Popular
//                   </Badge>
//                 </div>
//                 <CardContent className="p-8 space-y-6">
//                   <div>
//                     <h3 className="text-2xl font-bold mb-2">Professional</h3>
//                     <p className="text-muted-foreground">
//                       For growing businesses
//                     </p>
//                   </div>
//                   <div className="flex items-baseline gap-2">
//                     <span className="text-5xl font-bold">$79</span>
//                     <span className="text-muted-foreground">/month</span>
//                   </div>
//                   <ul className="space-y-3">
//                     <li className="flex items-center gap-3">
//                       <Check className="h-5 w-5 text-primary flex-shrink-0" />
//                       <span className="text-sm">Up to 10 staff members</span>
//                     </li>
//                     <li className="flex items-center gap-3">
//                       <Check className="h-5 w-5 text-primary flex-shrink-0" />
//                       <span className="text-sm">Unlimited appointments</span>
//                     </li>
//                     <li className="flex items-center gap-3">
//                       <Check className="h-5 w-5 text-primary flex-shrink-0" />
//                       <span className="text-sm">All view options</span>
//                     </li>
//                     <li className="flex items-center gap-3">
//                       <Check className="h-5 w-5 text-primary flex-shrink-0" />
//                       <span className="text-sm">SMS & email notifications</span>
//                     </li>
//                     <li className="flex items-center gap-3">
//                       <Check className="h-5 w-5 text-primary flex-shrink-0" />
//                       <span className="text-sm">Advanced analytics</span>
//                     </li>
//                     <li className="flex items-center gap-3">
//                       <Check className="h-5 w-5 text-primary flex-shrink-0" />
//                       <span className="text-sm">Custom branding</span>
//                     </li>
//                     <li className="flex items-center gap-3">
//                       <Check className="h-5 w-5 text-primary flex-shrink-0" />
//                       <span className="text-sm">Priority support</span>
//                     </li>
//                   </ul>
//                   <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
//                     Start Free Trial
//                   </Button>
//                 </CardContent>
//               </Card>
//             </ScrollReveal>

//             {/* План 3: Enterprise */}
//             <ScrollReveal className="fade-up" delay={300}>
//               <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
//                 <CardContent className="p-8 space-y-6">
//                   <div>
//                     <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
//                     <p className="text-muted-foreground">
//                       For large organizations
//                     </p>
//                   </div>
//                   <div className="flex items-baseline gap-2">
//                     <span className="text-5xl font-bold">$199</span>
//                     <span className="text-muted-foreground">/month</span>
//                   </div>
//                   <ul className="space-y-3">
//                     <li className="flex items-center gap-3">
//                       <Check className="h-5 w-5 text-primary flex-shrink-0" />
//                       <span className="text-sm">Unlimited staff members</span>
//                     </li>
//                     <li className="flex items-center gap-3">
//                       <Check className="h-5 w-5 text-primary flex-shrink-0" />
//                       <span className="text-sm">Unlimited appointments</span>
//                     </li>
//                     <li className="flex items-center gap-3">
//                       <Check className="h-5 w-5 text-primary flex-shrink-0" />
//                       <span className="text-sm">All features included</span>
//                     </li>
//                     <li className="flex items-center gap-3">
//                       <Check className="h-5 w-5 text-primary flex-shrink-0" />
//                       <span className="text-sm">Multi-location support</span>
//                     </li>
//                     <li className="flex items-center gap-3">
//                       <Check className="h-5 w-5 text-primary flex-shrink-0" />
//                       <span className="text-sm">API access</span>
//                     </li>
//                     <li className="flex items-center gap-3">
//                       <Check className="h-5 w-5 text-primary flex-shrink-0" />
//                       <span className="text-sm">Dedicated account manager</span>
//                     </li>
//                     <li className="flex items-center gap-3">
//                       <Check className="h-5 w-5 text-primary flex-shrink-0" />
//                       <span className="text-sm">24/7 phone support</span>
//                     </li>
//                     <li className="flex items-center gap-3">
//                       <Check className="h-5 w-5 text-primary flex-shrink-0" />
//                       <span className="text-sm">Custom integrations</span>
//                     </li>
//                   </ul>
//                   <Button className="w-full bg-transparent" variant="outline">
//                     Contact Sales
//                   </Button>
//                 </CardContent>
//               </Card>
//             </ScrollReveal>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default PricingSection;
