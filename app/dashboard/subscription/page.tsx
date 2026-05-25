"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { 
  CreditCard, 
  Download, 
  AlertCircle, 
  Calendar, 
  CheckCircle2, 
  XCircle,
  Loader2,
  Eye,
} from "lucide-react";
import callApi from "@/app/Api/callApi";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuthContext } from "@/context/AuthContext";
import moment from "moment";
import { Modal } from "@/components/customUIComponents/Modal";
import { GenericTable, Column } from "@/components/GenericTable/GenericTable";
import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";
import { useRouter } from "next/navigation";

interface Invoice {
  id: string;
  number: string;
  amount_paid: number;
  currency: string;
  status: string;
  created: number;
  hosted_invoice_url: string;
  invoice_pdf: string;
  period_start: number;
  period_end: number;
}

export default function SubscriptionPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuthContext();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [businessData, setBusinessData] = useState<any>(null);
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchData = async () => {
      setLoading(true);
      try {
        const [invoicesRes, businessRes] = await Promise.all([
          callApi("/api/stripe/invoices", "GET"),
          callApi(`/api/business/${user?.businessId}`, "GET")
        ]);
        setInvoices(invoicesRes.invoices || []);
        setDefaultPaymentMethod(invoicesRes.defaultPaymentMethod);
        setBusinessData(businessRes);
      } catch (error) {
        console.error("Failed to fetch subscription data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.businessId) {
      fetchData();
    }
  }, [user?.businessId]);

  const handleCancelSubscription = async () => {
    setCancelling(true);
    try {
      await callApi("/api/stripe/cancel-subscription", "POST");
      toast.success(t("Subscription canceled successfully."));
      setIsCancelModalOpen(false);
      // Refresh business data
      const updatedBusiness = await callApi(`/api/business/${user?.businessId}`, "GET");
      setBusinessData(updatedBusiness);
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      toast.error(t("Failed to cancel subscription."));
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-bold uppercase">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t("Active")}
          </span>
        );
      case "canceled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-bold uppercase">
            <AlertCircle className="w-3.5 h-3.5" />
            {t("Canceled")}
          </span>
        );
      case "past_due":
      case "unpaid":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-bold uppercase">
            <XCircle className="w-3.5 h-3.5" />
            {t("Past Due")}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-500/10 text-slate-500 text-xs font-bold uppercase">
            {status || t("none")}
          </span>
        );
    }
  };

  const columns: Column<Invoice>[] = [
    {
      accessorKey: "created",
      header: t("Date"),
      cell: ({ row }) => (
        <span className="font-medium">
          {moment(row.original.created * 1000).format("DD.MM.YYYY")}
        </span>
      ),
      defaultWidth: 120,
    },
    {
      accessorKey: "number",
      header: t("Number"),
      cell: ({ row }) => (
        <span className="text-[11px] font-mono text-muted-foreground uppercase">
          {row.original.number}
        </span>
      ),
      defaultWidth: 150,
    },
    {
      accessorKey: "period",
      header: t("Period"),
      cell: ({ row }) => {
        const start = moment(row.original.period_start * 1000);
        const end = moment(row.original.period_end * 1000);
        const isSameYear = start.year() === end.year();
        
        return (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground">
              {start.format(isSameYear ? "DD.MM" : "DD.MM.YYYY")}
            </span>
            <span className="text-muted-foreground/30">—</span>
            <span className="text-muted-foreground">
              {end.format("DD.MM.YYYY")}
            </span>
          </div>
        );
      },
      defaultWidth: 180,
    },
    {
      accessorKey: "amount_paid",
      header: t("Amount"),
      cell: ({ row }) => (
        <span className="font-bold">
          {(row.original.amount_paid / 100).toFixed(2)} {row.original.currency.toUpperCase()}
        </span>
      ),
      defaultWidth: 120,
    },
    {
      accessorKey: "status",
      header: t("Status"),
      cell: ({ row }) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
          row.original.status === 'paid' ? 'bg-green-500/10 text-green-500' : 'bg-slate-500/10 text-slate-500'
        }`}>
          {t(row.original.status)}
        </span>
      ),
      defaultWidth: 100,
    },
    {
      accessorKey: "actions",
      header: t("Action"),
      cell: ({ row }) => (
          <div className="flex items-center gap-0.5 mobile-actions">
            <CustomTooltip
              onClick={() => router.push(row.original.invoice_pdf)}
              tooltipText={t("Download PDF")}
              icon={<Download />}
            />
            <CustomTooltip
              onClick={() => router.push(row.original.hosted_invoice_url)}
              tooltipText={t("Edit")}
              icon={<Eye />}
            />
          </div>
      ),
      defaultWidth: 150,
    },
  ];

  if (loading || !mounted) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentPlan = businessData?.plan || "none";
  const subscriptionStatus = businessData?.subscriptionStatus || "none";
  const nextPaymentDate = businessData?.planExpiresAt;

  return (
    <div className="space-y-8">
      {/* Current Plan Card */}
      <div className="grid md:grid-cols-1 gap-6">
        <div className="md:col-span-1 bg-card border rounded-2xl p-6 md:p-8 shadow-sm space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t("Current Plan")}</p>
              <h2 className="text-2xl font-bold text-primary">
                {currentPlan === "none" ? t("No active plan") : t(currentPlan)}
              </h2>
            </div>
            <div>{getStatusBadge(subscriptionStatus)}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-border/50">
            <div className="flex items-center justify-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm text-muted-foreground">{t("Next Payment")}</p>
                <p className="font-semibold">
                  {nextPaymentDate ? moment(nextPaymentDate).format("DD.MM.YYYY") : t("N/A")}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm text-muted-foreground">{t("Payment Method")}</p>
                <p className="font-semibold">
                  {defaultPaymentMethod?.last4 ? (
                    <span className="flex items-center gap-2">
                      <span className="capitalize">{defaultPaymentMethod.brand || "Card"}</span>
                      <span>•••• {defaultPaymentMethod.last4}</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 italic text-muted-foreground font-normal">
                      •••• •••• •••• Stripe
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4">
              {subscriptionStatus === "active" && (
                  <Button 
                    variant="outline" 
                    className="text-red-500 border-red-500 hover:text-white hover:bg-red-500 transition-all duration-200"
                    onClick={() => setIsCancelModalOpen(true)}
                  >
                    {t("Cancel Subscription")}
                  </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment History Generic Table */}
      <div className="space-y-4">
        <GenericTable 
          data={invoices} 
          columns={columns} 
        />
      </div>

      {/* Cancellation Modal */}
      <Modal
        label={t("Cancel Subscription")}
        open={isCancelModalOpen}
        onOpenChange={setIsCancelModalOpen}
        width="md"
      >
        <div className="p-1 space-y-4">
          <div className="flex items-center gap-4 p-4 ">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <div className="text-sm">
              <p className="font-bold">{t("Are you sure you want to cancel your subscription?")}</p>
              <p className="mt-1">{t("Your subscription will remain active until the end of the current billing period.")}</p>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Button 
              variant="outline" 
              onClick={() => setIsCancelModalOpen(false)}
              disabled={cancelling}
              iconType="save"
            >
              {t("Keep Subscription")}
            </Button>
            <Button 
              onClick={handleCancelSubscription}
              disabled={cancelling}
              iconType="cancel"
            >
              {cancelling ? <Loader2 className="w-5 h-5 animate-spin" /> : t("Yes, Cancel")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

