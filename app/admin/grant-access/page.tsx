"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import { LabeledSelect } from "@/components/customUIComponents/LabeledSelect";
import { useTranslation } from "react-i18next";
import callApi from "@/app/Api/callApi";
import { toast } from "sonner";
import { SelectOption } from "@/Global/Types/types";

const PLANS = [
  "Starter_Monthly",
  "Professional_Monthly",
  "Enterprise_Monthly",
  "Starter_Annual",
  "Professional_Annual",
  "Enterprise_Annual",
];

const DURATIONS = [1, 12];

export default function GrantAccessPage() {
  const { t } = useTranslation();
  const [businesses, setBusinesses] = useState<SelectOption[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(PLANS[0]);
  const [duration, setDuration] = useState(DURATIONS[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const backendData = await callApi(`/api/business/options`, "GET");
        setBusinesses(backendData);
      } catch (e) {
        console.error("Failed to fetch business configuration:", e);
        toast.error(t("Failed to fetch businesses"));
      }
    };
    fetchBusinesses();
  }, []);

  const handleGrantAccess = async () => {
    setLoading(true);
    try {
      await callApi("/api/admin/grant-plan", "POST", {
        businessId: selectedBusiness,
        plan: selectedPlan,
        duration,
      });
      toast.success(t("Access granted successfully!"));
    } catch {
      toast.error(t("Failed to grant access"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requiredRoles={["admin"]}>
      <div className="max-w-2xl mx-auto py-10">
        <Card>
          <CardContent className="p-6 space-y-6">
            <h1 className="text-2xl text-primary font-bold mb-4">
              {t("Grant Business Access")}
            </h1>
            <div className="space-y-4">
              <LabeledSelect
                label={t("Select Business")}
                id="business-select"
                value={selectedBusiness}
                onValueChange={setSelectedBusiness}
                placeholder={t("Choose a business...")}
                options={businesses}
              />
              <LabeledSelect
                label={t("Plan")}
                id="plan-select"
                value={selectedPlan}
                onValueChange={setSelectedPlan}
                placeholder={t("Choose a plan...")}
                options={PLANS.map((plan) => ({
                  id: plan,
                  name: plan.replace(/_/g, " "),
                }))}
              />
              <LabeledSelect
                label={t("Duration (months)")}
                id="duration-select"
                value={String(duration)}
                onValueChange={(val) => setDuration(Number(val))}
                placeholder={t("Choose duration...")}
                options={DURATIONS.map((d) => ({
                  id: String(d),
                  name: String(d),
                }))}
              />
              <Button
                onClick={handleGrantAccess}
                disabled={loading || !selectedBusiness}
                className="w-full"
              >
                {loading ? t("Granting...") : t("Grant Access")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
