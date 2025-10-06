// "use client";
// import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";
// import { BenefitsSection } from "@/components/sections/benefits-section";
// import { BusinessList } from "@/components/sections/business-list";
// import { BusinessOwnerCTA } from "@/components/sections/business-owner-cta";
// import { SearchFilters } from "@/components/sections/search-filters";
// import { ArrowLeft } from "lucide-react";
// import { useRouter } from "next/navigation";

// export default function HomePage() {
//   return (
//     <div className="min-h-screen">
//       <section className="relative h-[400px] md:h-[500px] overflow-hidden">
//         <img
//           src="/calendar.png"
//           alt="BookEase appointment booking"
//           className="w-full h-full object-cover"
//         />
//         <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
//       </section>

//       {/* Hero Section with Search */}
//       <section className="relative -mt-80 md:-mt-70 py-16 md:py-24">
//         <div className="container mx-auto px-4">
//           <div className="max-w-4xl mx-auto text-center mb-12">
//             <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance font-sans animate-in fade-in slide-in-from-bottom-4 duration-700">
//               Book appointments with ease
//             </h1>
//             <p className="text-lg md:text-xl text-muted-foreground text-balance animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
//               Find and book appointments with top-rated businesses in your area.
//               Save time and manage your schedule effortlessly.
//             </p>
//           </div>
//           <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
//             <SearchFilters />
//           </div>
//         </div>
//       </section>

//       {/* Benefits Section */}
//       <BenefitsSection />

//       {/* Business Listings */}
//       <section className="py-16 bg-background">
//         <div className="container mx-auto px-4">
//           <div className="mb-8">
//             <h2 className="text-3xl font-bold mb-2 font-sans">
//               Popular businesses near you
//             </h2>
//             <p className="text-muted-foreground">
//               Discover highly-rated professionals ready to serve you
//             </p>
//           </div>
//           <BusinessList />
//         </div>
//       </section>

//       <BusinessOwnerCTA />
//     </div>
//   );
// }
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
