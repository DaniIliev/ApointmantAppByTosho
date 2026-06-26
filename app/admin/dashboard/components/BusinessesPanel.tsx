import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RefreshCw, Database, Calendar, Clock, ArrowRight } from "lucide-react";
import { GenericTable } from "@/components/GenericTable/GenericTable";
import { Column } from "@/components/GenericTable/types";
import { useTranslation } from "react-i18next";

type BusinessEntry = {
  _id: string;
  businessName: string;
  ownerName: string;
  ownerEmail: string;
  plan: string;
  subscriptionStatus: string;
  createdAt: string;
  planExpiresAt?: string;
  locationsCount: number;
  staffCount: number;
  appointmentsCount: number;
};

interface BusinessesPanelProps {
  businesses: BusinessEntry[];
  loading: boolean;
}

export default function BusinessesPanel({ businesses, loading }: BusinessesPanelProps) {
  const { t } = useTranslation();

  const columns: Column<BusinessEntry>[] = [
    {
      header: t("Business Name"),
      accessorKey: "businessName",
      cell: ({ row }) => (
        <div>
          <span className="font-semibold text-text-primary text-sm flex items-center gap-1.5">
            <Database className="w-4 h-4 text-primary opacity-70" />
            {row.original.businessName}
          </span>
          <span className="text-[10px] block font-mono text-text-secondary opacity-60">ID: {row.original._id}</span>
        </div>
      ),
    },
    {
      header: t("Owner"),
      accessorKey: "ownerName",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-text-primary text-sm">{row.original.ownerName}</span>
          <span className="text-xs text-text-secondary">{row.original.ownerEmail}</span>
        </div>
      ),
    },
    {
      header: t("Plan Type"),
      accessorKey: "plan",
      cell: ({ row }) => {
        const plan = row.original.plan;
        let badgeColor = "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/60 dark:text-gray-300 dark:border-gray-800";
        
        if (plan.includes("Enterprise")) {
          badgeColor = "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400";
        } else if (plan.includes("Professional")) {
          badgeColor = "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400";
        } else if (plan.includes("Starter")) {
          badgeColor = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400";
        }

        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeColor}`}>
            {plan.replace(/_/g, " ")}
          </span>
        );
      },
    },
    {
      header: t("Status"),
      accessorKey: "subscriptionStatus",
      cell: ({ row }) => {
        const status = row.original.subscriptionStatus;
        const isActive = status === "active";
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border
            ${isActive 
              ? "bg-green-500/10 text-green-600 border-green-500/20 dark:bg-green-500/20 dark:text-green-400" 
              : "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:bg-rose-500/20 dark:text-rose-400"}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-rose-500"}`} />
            {status.toUpperCase()}
          </span>
        );
      },
    },
    {
      header: t("Acquired Date"),
      accessorKey: "createdAt",
      cell: ({ row }) => (
        <span className="text-sm text-text-secondary flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-text-secondary opacity-60" />
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: t("Valid Until"),
      accessorKey: "planExpiresAt",
      cell: ({ row }) => {
        if (!row.original.planExpiresAt) {
          return (
            <span className="text-xs text-text-secondary/70 italic bg-gray-500/5 px-2 py-0.5 rounded border border-gray-500/10">
              {t("Lifetime Access")}
            </span>
          );
        }
        const expiresAt = new Date(row.original.planExpiresAt);
        const isExpired = expiresAt < new Date();
        return (
          <div className="flex flex-col">
            <span className={`text-sm font-semibold flex items-center gap-1.5 ${isExpired ? "text-rose-500" : "text-text-primary"}`}>
              <Clock className="w-4 h-4 opacity-70" />
              {expiresAt.toLocaleDateString()}
            </span>
            {isExpired && <span className="text-[10px] text-rose-500 font-medium">({t("Expired")})</span>}
          </div>
        );
      },
    },
    {
      header: t("Details"),
      accessorKey: "details",
      cell: ({ row }) => (
        <div className="text-xs text-text-secondary space-y-0.5">
          <div>📌 {t("Locs")}: {row.original.locationsCount}</div>
          <div>👥 {t("Staff")}: {row.original.staffCount}</div>
          <div>📅 {t("Appts")}: {row.original.appointmentsCount}</div>
        </div>
      ),
    },
    {
      header: t("Actions"),
      accessorKey: "actions",
      cell: ({ row }) => (
        <Link href="/admin/grant-access">
          <Button size="sm" variant="outline" className="h-8 flex items-center gap-1 text-xs border-primary/20 text-primary hover:bg-primary/5">
            <ArrowRight className="w-3.5 h-3.5" />
            {t("Grant Access")}
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-xl font-bold text-text-primary">{t("Registered Businesses")}</h2>
          <p className="text-xs text-text-secondary">{t("Complete registry of system owners, active subscriptions, validity start, and expiration intervals.")}</p>
        </div>
      </div>

      <div className="relative">
        {loading ? (
          <div className="py-20 flex flex-col gap-4 items-center justify-center border border-gray-100 dark:border-gray-800 rounded-3xl bg-white/20 dark:bg-card/10 backdrop-blur-md">
            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            <span className="text-sm text-text-secondary font-medium">{t("Querying diagnostics database...")}</span>
          </div>
        ) : (
          <GenericTable
            data={businesses}
            columns={columns}
          />
        )}
      </div>
    </div>
  );
}
