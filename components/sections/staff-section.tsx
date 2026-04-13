import callApi from "@/app/Api/callApi";
import { StaffMember } from "@/app/staff/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";

export function StaffSection({
  businessId,
  locationId,
}: {
  businessId: string;
  locationId?: string;
}) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [ratingInFlightId, setRatingInFlightId] = useState<string | null>(null);
  const { t } = useTranslation();

  const toImageUrl = (path?: string) => {
    if (!path) return "/placeholder.png";
    if (path.startsWith("http")) return path;
    return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/${path.replace(/^\/+/, "")}`;
  };

  const toRating = (value?: number) => {
    const numeric = Number(value || 0);
    if (!Number.isFinite(numeric) || numeric <= 0) return 0;
    return Math.max(0, Math.min(5, numeric));
  };

  const handleRateStaff = async (staffId: string, value: number) => {
    if (ratingInFlightId) return;
    try {
      setRatingInFlightId(staffId);
      const response = await callApi(`/api/staff/${staffId}/rating`, "PUT", {
        rating: value,
      });

      setStaff((prev) =>
        prev.map((member) =>
          member._id === staffId
            ? {
                ...member,
                rating: response?.rating ?? member.rating,
                ratingCount: response?.ratingCount ?? member.ratingCount,
              }
            : member,
        ),
      );
    } catch (error) {
      console.error("Failed to rate staff:", error);
    } finally {
      setRatingInFlightId(null);
    }
  };

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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {staff.map((member) => (
            <div
              key={member._id}
              className="group relative h-[340px] overflow-hidden rounded-3xl bg-slate-200 shadow-lg hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="absolute inset-0">
                <Image
                  src={toImageUrl(member.profilePictureUrl)}
                  alt={`${member.firstName} ${member.lastName}`}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/55 via-slate-900/15 to-transparent" />

              <div className="absolute bottom-4 left-4 right-4 rounded-[22px] bg-black/30 px-4 py-3 text-center shadow-md border border-white/15 backdrop-blur-md">
                <h3 className="text-xl font-extrabold leading-tight text-white tracking-tight">
                  {member.firstName} {member.lastName}
                </h3>

                <div className="mt-2 flex items-center justify-center gap-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((starValue) => {
                      const currentRating = toRating(member.rating);
                      const active = starValue <= Math.round(currentRating);

                      return (
                        <button
                          key={starValue}
                          type="button"
                          aria-label={`${t("Rate")} ${starValue}`}
                          className="inline-flex items-center justify-center"
                          disabled={ratingInFlightId === member._id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setStaff((prev) =>
                              prev.map((item) =>
                                item._id === member._id
                                  ? { ...item, rating: starValue }
                                  : item,
                              ),
                            );
                            handleRateStaff(member._id, starValue);
                          }}
                        >
                          <Star
                            className={`h-5 w-5 transition-colors ${
                              active
                                ? "fill-amber-400 text-amber-400"
                                : "text-white/35"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="absolute top-[10px] left-3 z-10">
                <div className="flex flex-col h-9 min-w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-rose-500 text-white shadow-lg ring-2 ring-white/70">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-[10px] font-black leading-tight">
                    {toRating(member.rating).toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
