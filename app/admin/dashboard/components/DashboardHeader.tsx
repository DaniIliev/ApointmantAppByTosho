import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert, RefreshCw, Briefcase } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface DashboardHeaderProps {
  onRefresh: () => void;
}

export default function DashboardHeader({ onRefresh }: DashboardHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 rounded-3xl border border-white/10 bg-white/30 dark:bg-card/20 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-primary font-bold tracking-wider text-xs uppercase">
          <ShieldAlert className="w-4 h-4 animate-pulse" />
          {t("Administrator Panel")}
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
          {t("AppointDI Control Panel")}
        </h1>
        <p className="text-sm text-text-secondary max-w-md">
          {t("Real-time logging, metrics, server error monitoring, and global subscriber diagnostics.")}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={() => {
            onRefresh();
            toast.success(t("Dashboard updated successfully"));
          }}
          variant="outline"
          className="flex items-center gap-2 border-primary/20"
        >
          <RefreshCw className="w-4 h-4 text-primary" />
          {t("Refresh Stats")}
        </Button>
        
        <Link href="/admin/grant-access">
          <Button className="flex items-center gap-2 bg-primary hover:bg-primary-dark shadow-lg shadow-primary/20">
            <Briefcase className="w-4 h-4" />
            {t("Grant Plan Access")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
