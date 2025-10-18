// components/sections/staff-section.tsx (МИНИМАЛИСТИЧНА ВЕРСИЯ)
import callApi from "@/app/Api/callApi";
import { StaffMember } from "@/app/staff/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, UserCheck } from "lucide-react"; // Оставихме само нужните икони
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Mock data (Остават същите)
const staff = [
  {
    id: 1,
    name: "Sarah Johnson",
    rating: 4.9,
    reviews: 87,
    image: "/professional-hairstylist-portrait.jpg",
  },
  {
    id: 2,
    name: "Michael Chen",
    rating: 4.8,
    reviews: 64,
    image: "/male-hairstylist-portrait.jpg",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    rating: 5.0,
    reviews: 52,
    image: "/female-stylist-portrait.jpg",
  },
  {
    id: 4,
    name: "David Kim",
    rating: 4.7,
    reviews: 45,
    image: "/colorist-portrait.jpg",
  },
];

interface StaffSectionProps {
  businessId: string;
}

export function StaffSection({ businessId }: StaffSectionProps) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const data = await callApi("/api/staff/staff-list", "GET");
        setStaff(data);
      } catch (error) {
        toast.error("Неуспешно зареждане на персонала.");
      }
    };
    fetchStaff();
  }, []);
  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row justify-between items-center pb-4 border-b">
        <div className="flex items-center gap-3">
          <UserCheck className="h-6 w-6 text-primary" />
          <CardTitle className="font-bold text-2xl font-sans text-primary">
            Meet Our Experts
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6 pb-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {staff.map((member) => (
            <div
              key={member._id}
              className="
                flex flex-col items-center text-center p-6 rounded-xl border border-border 
                hover:shadow-lg hover:scale-[1.03] transform transition-all duration-300
              "
            >
              {/* Снимка */}
              <div className="relative w-24 h-24 mb-3 rounded-full overflow-hidden shadow-md border-2 border-primary/30">
                <img
                  src={"/placeholder.png"}
                  alt={member.firstName}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-bold text-lg mb-0">
                {member.firstName} {member.lastName}
              </h3>
              <div className="flex justify-center items-center gap-1 text-sm pt-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-yellow-600">{5}</span>
                <span className="text-sm text-muted-foreground ml-1">
                  ({20} reviews)
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
