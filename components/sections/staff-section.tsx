import callApi from "@/app/Api/callApi";
import { StaffMember } from "@/app/staff/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";

export function StaffSection({ businessId, locationId }: { businessId: string; locationId?: string }) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const { t } = useTranslation();
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        let url = `/api/staff/staff-list?businessId=${businessId}&onlyWithServices=true`;
        if (locationId) {
          url += `&locationId=${locationId}`;
        }
        const data = await callApi(url, "GET");
        setStaff(data);
      } catch (error) {
        // Optionally handle error UI here
      }
    };
    fetchStaff();
  }, [businessId, locationId]);
  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center pb-4 border-b">
        <UserCheck className="h-6 w-6 text-primary mr-2" />
        <CardTitle className="font-bold text-2xl font-sans text-primary">
          {t("Meet Our Experts")}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 pb-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {staff.map((member) => (
            <div
              key={member._id}
              className="flex flex-col items-center text-center p-6 rounded-xl border border-border hover:shadow-lg hover:scale-[1.03] transform transition-all duration-300 bg-white/80 dark:bg-slate-900/60"
            >
              <div className="relative w-24 h-24 mb-3 rounded-full overflow-hidden shadow-md border-2 border-primary/30">
                <Image
                  src={
                    member.profilePictureUrl
                      ? member.profilePictureUrl.startsWith("http")
                        ? member.profilePictureUrl
                        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/${member.profilePictureUrl.replace(/^\/+/, "")}`
                      : "/placeholder.png"
                  }
                  alt={member.firstName}
                  className="w-full h-full object-cover"
                  width={96}
                  height={96}
                  priority
                />
              </div>
              <h3 className="font-bold text-lg mb-0 text-text-primary">
                {member.firstName} {member.lastName}
              </h3>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
