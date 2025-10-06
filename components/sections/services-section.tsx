// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Clock, DollarSign, Edit, Plus, Trash2 } from "lucide-react";

// const services = [
//   {
//     id: 1,
//     name: "Haircut & Style",
//     description: "Professional haircut with styling",
//     duration: "45 min",
//     price: "$65",
//     category: "Hair Services",
//   },
//   {
//     id: 2,
//     name: "Color Treatment",
//     description: "Full color or highlights with treatment",
//     duration: "2 hours",
//     price: "$150",
//     category: "Hair Services",
//   },
//   {
//     id: 3,
//     name: "Blowout",
//     description: "Professional blow dry and styling",
//     duration: "30 min",
//     price: "$45",
//     category: "Hair Services",
//   },
//   {
//     id: 4,
//     name: "Deep Conditioning",
//     description: "Intensive hair treatment and conditioning",
//     duration: "45 min",
//     price: "$55",
//     category: "Treatments",
//   },
//   {
//     id: 5,
//     name: "Keratin Treatment",
//     description: "Smoothing keratin treatment for frizz control",
//     duration: "3 hours",
//     price: "$250",
//     category: "Treatments",
//   },
//   {
//     id: 6,
//     name: "Bridal Styling",
//     description: "Complete bridal hair styling package",
//     duration: "2 hours",
//     price: "$200",
//     category: "Special Occasions",
//   },
// ];

// export function ServicesSection({
//   businessId,
//   isEditMode,
// }: {
//   businessId: string;
//   isEditMode: boolean;
// }) {
//   return (
//     <Card>
//       <CardHeader className="flex flex-row justify-between items-center">
//         <CardTitle className="font-sans">Services & Pricing</CardTitle>
//         {isEditMode && (
//           <Button size="sm" onClick={() => alert("Open Add Service Modal")}>
//             <Plus className="h-4 w-4 mr-2" /> Add New Service
//           </Button>
//         )}
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           {services.map((service) => (
//             <div
//               key={service.id}
//               className="flex items-start justify-between gap-4 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
//             >
//               {/* ... цялата информация за услугата ... */}
//               <div className="flex-1">...</div>

//               {/* Условно рендиране на бутоните */}
//               <div className="flex flex-col gap-2">
//                 {isEditMode ? (
//                   <>
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={() => alert(`Edit service ${service.name}`)}
//                     >
//                       <Edit className="h-4 w-4" />
//                     </Button>
//                     <Button
//                       size="sm"
//                       variant="destructive"
//                       onClick={() => confirm(`Delete service ${service.name}?`)}
//                     >
//                       <Trash2 className="h-4 w-4" />
//                     </Button>
//                   </>
//                 ) : (
//                   <Button size="sm" variant="outline">
//                     Book Now
//                   </Button>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign, Edit, Plus, Trash2 } from "lucide-react";

interface Service {
  id: number;
  name: string;
  description: string;
  duration: string;
  price: string;
  category: string;
  // Добавяме свойство за снимка
  imageUrl: string;
}

const services: Service[] = [
  {
    id: 1,
    name: "Дамско Подстригване",
    description: "Професионално подстригване с оформяне и изсушаване.",
    duration: "45 мин",
    price: "65 лв",
    category: "Фризьорски Услуги",
    imageUrl: "/haircut.jpg", // Placeholder
  },
  {
    id: 2,
    name: "Цветна Терапия",
    description: "Пълно боядисване или кичури с възстановяваща терапия.",
    duration: "2 часа",
    price: "150 лв",
    category: "Фризьорски Услуги",
    imageUrl: "/color.jpg", // Placeholder
  },
  {
    id: 3,
    name: "Издухване (Blowout)",
    description: "Професионално издухване и оформяне за обем.",
    duration: "30 мин",
    price: "45 лв",
    category: "Експресни Услуги",
    imageUrl: "/blowout.jpg", // Placeholder
  },
  {
    id: 4,
    name: "Дълбоко Подхранване",
    description: "Интензивна маска и терапия за възстановяване на косата.",
    duration: "45 мин",
    price: "55 лв",
    category: "Терапии",
    imageUrl: "/deep-condition.jpg", // Placeholder
  },
  {
    id: 5,
    name: "Кератинова Терапия",
    description: "Изглаждаща кератинова терапия за контрол на начупването.",
    duration: "3 часа",
    price: "250 лв",
    category: "Терапии",
    imageUrl: "/keratin.jpg", // Placeholder
  },
  {
    id: 6,
    name: "Булчинска Прическа",
    description: "Пълен пакет стилизиране на булчинска прическа с проба.",
    duration: "2 часа",
    price: "200 лв",
    category: "Специални Поводи",
    imageUrl: "/bridal.jpg", // Placeholder
  },
];

// Групиране на услугите по категории
const groupServicesByCategory = (services: Service[]) => {
  return services.reduce((acc, service) => {
    const category = service.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);
};

export function ServicesSection({
  businessId,
  isEditMode,
}: {
  businessId: string;
  isEditMode: boolean;
}) {
  const categorizedServices = groupServicesByCategory(services);
  const categories = Object.keys(categorizedServices);

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row justify-between items-center border-b p-4">
        <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2 text-primary">
          <DollarSign className="h-6 w-6 text-primary" />
          Услуги и Ценоразпис
        </CardTitle>
        {isEditMode && (
          <Button
            size="sm"
            onClick={() => console.log("Open Add Service Modal")}
          >
            <Plus className="h-4 w-4 mr-2" /> Добави Услуга
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-8 p-6">
          {categories.map((category) => (
            <div key={category}>
              {/* Заглавие на Категорията */}
              <h3 className="text-2xl font-semibold mb-4 text-foreground border-b-2 border-primary/50 pb-2">
                {category}
              </h3>

              {/* Списък с Услуги */}
              <div className="space-y-4">
                {categorizedServices[category].map((service) => (
                  <div
                    key={service.id}
                    className="flex items-start justify-between gap-6 p-4 rounded-xl bg-background border border-border/70 hover:border-primary/50 transition-all shadow-sm"
                  >
                    {/* Информация за Услугата (Снимка, Име, Описание) */}
                    <div className="flex-1 flex items-start gap-4">
                      {/* Снимка */}
                      <div className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 shadow-md">
                        <img
                          src={service.imageUrl || "/default-service.png"}
                          alt={service.name}
                          className="w-full h-full object-cover"
                          // Може да използвате Tailwind класове за fallback
                        />
                      </div>

                      {/* Текст */}
                      <div>
                        <h4 className="text-lg font-bold text-foreground mb-1">
                          {service.name}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {service.description}
                        </p>

                        {/* Цена и Време */}
                        <div className="flex items-center gap-4 text-sm font-medium">
                          <div className="flex items-center gap-1 text-primary">
                            <Clock className="h-4 w-4" />
                            <span>{service.duration}</span>
                          </div>
                          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <DollarSign className="h-4 w-4" />
                            <span>{service.price}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Бутони за Действие */}
                    <div className="flex flex-col md:flex-row gap-2 flex-shrink-0">
                      {isEditMode ? (
                        <>
                          <Button
                            size="icon"
                            variant="outline"
                            className="text-primary hover:bg-primary/10"
                            title="Редактирай"
                            onClick={() =>
                              console.log(`Edit service ${service.name}`)
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            title="Изтрий"
                            onClick={() =>
                              confirm(
                                `Сигурни ли сте, че искате да изтриете ${service.name}?`
                              )
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="default"
                          className="min-w-[120px] bg-primary hover:bg-primary-dark transition-colors"
                          onClick={() => console.log(`Book ${service.name}`)}
                        >
                          Запази Час
                        </Button>
                      )}
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
