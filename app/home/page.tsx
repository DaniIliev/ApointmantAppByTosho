"use client";
import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";
import { BenefitsSection } from "@/components/sections/benefits-section";
import { BusinessList } from "@/components/sections/business-list";
import { BusinessOwnerCTA } from "@/components/sections/business-owner-cta";
import { SearchFilters } from "@/components/sections/search-filters";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Секция за снимката - Малко по-ниска и с по-тъмен градиент отдолу */}
      <section className="relative h-[400px] md:h-[450px] overflow-hidden">
        <img
          src="/calendar.png"
          alt="BookEase appointment booking"
          className="w-full h-full object-cover"
        />
        {/* По-плавен градиент, който прелива към to-background, за да контрастира с бялата карта */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background" />
        <div className="absolute z-40 top-0 max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance font-sans animate-in fade-in slide-in-from-bottom-4 duration-700 text-foreground">
            Book appointments with ease
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground text-balance animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            Find and book appointments with top-rated businesses in your area.
            Save time and manage your schedule effortlessly.
          </p>
        </div>
      </section>

      {/* Hero Section with Search - Намален отрицателен марджин */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <SearchFilters />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <BenefitsSection />

      {/* Business Listings */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2 font-sans">
              Popular businesses near you
            </h2>
            <p className="text-muted-foreground">
              Discover highly-rated professionals ready to serve you
            </p>
          </div>
          <BusinessList />
        </div>
      </section>

      <BusinessOwnerCTA />
    </div>
  );
}
// // @/app/page.tsx (или pages/index.tsx)
// "use client";
// import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";
// import { BenefitsSection } from "@/components/sections/benefits-section";
// import { BusinessList } from "@/components/sections/business-list";
// import { BusinessOwnerCTA } from "@/components/sections/business-owner-cta";
// import { SearchFilters } from "@/components/sections/search-filters";
// import { ArrowRight, Search, Clock, Shield, Zap } from "lucide-react";
// import { LucideIcon } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import Link from "next/link";
// import React from "react"; // Добавяме React import, който TypeScript често изисква

// // 1. Дефиниция на типа за Props на AnimatedBenefitBadge
// interface AnimatedBenefitBadgeProps {
//   icon: LucideIcon;
//   text: string;
//   delay: number;
//   position: string;
//   color: string;
// }

// // 2. Компонент за анимираните баджове (типизиран)
// const AnimatedBenefitBadge: React.FC<AnimatedBenefitBadgeProps> = ({
//   icon: Icon,
//   text,
//   delay,
//   position,
//   color,
// }) => (
//   <div
//     className={`absolute ${position} flex items-center bg-white/95 backdrop-blur-sm shadow-xl p-3 rounded-full text-sm font-medium border border-gray-100 transform hover:scale-105 transition-transform ease-out animate-in fade-in zoom-in-50 duration-500`}
//     style={{ animationDelay: `${delay}ms` }}
//   >
//     <Icon className={`w-4 h-4 mr-2 ${color}`} />
//     <span className="text-gray-800 hidden sm:inline">{text}</span>
//   </div>
// );

// // 3. Основният HomePage компонент (типизиран)
// const HomePage: React.FC = () => {
//   return (
//     <div className="min-h-screen">
//       {/* ========================================================================= */}
//       {/* 💥 НОВА HERO СЕКЦИЯ: Динамичен Визуален Фокус с Анимирани Ползи */}
//       {/* ========================================================================= */}
//       <section className="relative h-[600px] md:h-[700px] bg-gray-50 overflow-hidden pt-12 md:pt-0">
//         {/* Фон изображение/видео на цял екран */}
//         <img
//           src="/hero-background.jpg" // 💡 Сменете с по-въздействащо фоново изображение
//           alt="Modern appointment booking system"
//           className="absolute inset-0 w-full h-full object-cover opacity-30 sm:opacity-50"
//         />

//         {/* Наслагване с градиент за по-добра четимост (опционално) */}
//         <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/0 to-background/90" />

//         <div className="container mx-auto px-4 relative z-20 flex flex-col justify-start items-center h-full pt-16 md:pt-24">
//           {/* Текст - По-голям и по-въздействащ */}
//           <div className="max-w-4xl text-center mb-10">
//             <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-balance font-sans text-foreground animate-in fade-in slide-in-from-top-8 duration-700">
//               Намерете <span className="text-primary">Идеалния Час</span> За
//               Себе Си
//             </h1>
//             <p className="text-lg md:text-xl text-muted-foreground text-balance animate-in fade-in slide-in-from-top-8 duration-700 delay-150">
//               Резервирайте услуги от топ бизнеси 24/7. Лесно. Бързо.
//               Безпроблемно.
//             </p>

//             {/* Основен Призив за Действие (CTA) - Голям и видим */}
//             <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
//               {/* 💡 Бутонът предполага, че имате компонент <Button> и <Link> */}
//               <Button
//                 // asChild
//                 size="lg"
//                 className="px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-shadow"
//               >
//                 {/* <Link href="/search"> */}
//                 {/* <Search className="w-5 h-5 mr-2" /> */}
//                 Започнете Търсенето Сега
//                 {/* </Link> */}
//               </Button>
//             </div>
//           </div>

//           {/* Визуален Акцент - Примерно изображение на UI-то */}
//           <div className="relative w-full max-w-5xl mt-10 h-auto aspect-[16/9] animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300">
//             <img
//               src="/calendar.png" // Сменете с Вашия UI Screenshot
//               alt="BookEase interface screenshot"
//               className="w-full h-full object-contain rounded-lg shadow-2xl border-4 border-white/80"
//             />

//             {/* Анимирани Баджове с Ползи (Позиционирани върху/около изображението) */}
//             <AnimatedBenefitBadge
//               icon={Clock}
//               text="Спестяваш Време"
//               delay={500}
//               position="top-[10%] left-[5%] md:left-[15%]"
//               color="text-green-500"
//             />
//             <AnimatedBenefitBadge
//               icon={Shield}
//               text="Проверени Услуги"
//               delay={700}
//               position="top-[40%] right-[2%] md:right-[10%]"
//               color="text-indigo-500"
//             />
//             <AnimatedBenefitBadge
//               icon={Zap}
//               text="Мигновено Потвърждение"
//               delay={900}
//               position="bottom-[10%] left-[2%] md:left-[10%]"
//               color="text-orange-500"
//             />
//           </div>
//         </div>
//       </section>

//       {/* ========================================================================= */}
//       {/* Секция с Филтри за Търсене */}
//       {/* ========================================================================= */}
//       <section className="py-8 md:py-12 -mt-16 md:-mt-24 relative z-30">
//         <div className="container mx-auto px-4">
//           <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
//             <div className="bg-background p-6 md:p-8 rounded-xl shadow-2xl border border-border/50">
//               <SearchFilters />
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ========================================================================= */}
//       {/* Предимства (Benefits Section) */}
//       {/* ========================================================================= */}
//       <BenefitsSection />

//       {/* ========================================================================= */}
//       {/* Популярни Бизнеси (Business Listings) */}
//       {/* ========================================================================= */}
//       <section className="py-16 md:py-24 bg-secondary/30">
//         <div className="container mx-auto px-4">
//           <div className="text-center mb-12">
//             <h2 className="text-4xl font-bold mb-3 font-sans">
//               Над 1000 Проверени Бизнеса в Цялата Страна
//             </h2>
//             <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
//               Открийте високо оценени професионалисти, които са готови да Ви
//               обслужат
//             </p>
//           </div>
//           <BusinessList />

//           <div className="mt-12 text-center">
//             <Button
//               // asChild
//               variant="outline"
//               size="lg"
//               className="hover:bg-primary hover:text-white transition-colors"
//             >
//               {/* <Link href="/businesses"> */}
//               Разгледайте Всички Категории
//               {/* <ArrowRight className="w-4 h-4 ml-2" /> */}
//               {/* </Link> */}
//             </Button>
//           </div>
//         </div>
//       </section>

//       {/* ========================================================================= */}
//       {/* CTA за Собственици на Бизнес */}
//       {/* ========================================================================= */}
//       <BusinessOwnerCTA />
//     </div>
//   );
// };

// export default HomePage;
