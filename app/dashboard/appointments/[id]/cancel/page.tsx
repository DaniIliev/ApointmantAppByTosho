"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "@/context/PageTitleContext";
import callApi from "@/app/Api/callApi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatDateAndTime } from "@/Global/Utils/commonFn";
import {
  CalendarIcon,
  Clock,
  User,
  Mail,
  Phone,
  FileText,
  AlertCircle,
} from "lucide-react";

// Type for backend response
interface BackendAppointment {
  _id: string;
  business: {
    _id: string;
    businessName: string;
    phone?: string;
  };
  service: {
    _id: string;
    name: string;
    duration: number;
    price: number;
  };
  clientName: string;
  clientPhone?: string;
  email: string;
  appointmentTime: {
    start: string;
    end: string;
  };
  status: string;
  staff: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

function CancelAppointmentPageContent() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const { setPageTitle } = usePageTitle();
  const appointmentId = params.id as string;

  const [appointment, setAppointment] = useState<BackendAppointment | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    setPageTitle(t("Cancel Appointment"));
    return () => setPageTitle(null);
  }, [setPageTitle, t]);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setIsLoading(true);
        const data: BackendAppointment = await callApi(
          `/api/appointment/${appointmentId}`,
          "GET"
        );
        setAppointment(data);
      } catch {
        toast.error(t("Failed to load appointment details."));
        // Don't redirect immediately, let the UI show "not found"
        setAppointment(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (appointmentId) {
      fetchAppointment();
    }
  }, [appointmentId, t]);

  const handleCancelAppointment = async () => {
    if (!appointment) return;

    try {
      setIsCancelling(true);
      await callApi(`/api/appointment/${appointment._id}/status`, "PUT", {
        status: "cancelled",
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="h-16 w-16 text-destructive" />
        <h2 className="text-2xl font-bold">{t("Appointment Not Found")}</h2>
        <Button onClick={() => router.push("/dashboard")}>
          {t("Back to Dashboard")}
        </Button>
      </div>
    );
  }

  // Prevent cancelling already cancelled appointments
  if (appointment.status === "cancelled") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold">{t("Already Cancelled")}</h2>
        <p className="text-muted-foreground text-center max-w-md">
          {t("This appointment has already been cancelled.")}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Appointment Details Card */}
      <div className="bg-card border border-border rounded-xl shadow-lg p-6 md:p-8 mb-6">
        <h2 className="text-2xl font-semibold mb-6 text-foreground">
          {t("Appointment Details")}
        </h2>

        {/* 2-Column Grid for Desktop, Single Column for Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Client Name */}
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">
                {t("Client Name")}
              </p>
              <p className="font-medium text-foreground">
                {appointment.clientName}
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">{t("Email")}</p>
              <p className="font-medium text-foreground">{appointment.email}</p>
            </div>
          </div>

          {/* Phone */}
          {appointment.clientPhone && (
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">{t("Phone")}</p>
                <p className="font-medium text-foreground">
                  {appointment.clientPhone}
                </p>
              </div>
            </div>
          )}

          {/* Date */}
          <div className="flex items-start gap-3">
            <CalendarIcon className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">{t("Date")}</p>
              <p className="font-medium text-foreground">
                {formatDateAndTime(appointment.appointmentTime.start, "date")}
              </p>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">{t("Time")}</p>
              <p className="font-medium text-foreground">
                {formatDateAndTime(appointment.appointmentTime.start, "time")} -{" "}
                {formatDateAndTime(appointment.appointmentTime.end, "time")}
              </p>
            </div>
          </div>

          {/* Service */}
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">{t("Service")}</p>
              <p className="font-medium text-foreground">
                {appointment.service.name}
              </p>
            </div>
          </div>

          {/* Staff */}
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">{t("Staff")}</p>
              <p className="font-medium text-foreground">
                {appointment.staff.firstName} {appointment.staff.lastName}
              </p>
            </div>
          </div>

          {/* Business */}
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">{t("Business")}</p>
              <p className="font-medium text-foreground">
                {appointment.business.businessName}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            //   variant="destructive"
            onClick={handleCancelAppointment}
            disabled={isCancelling}
            className="sm:w-auto w-full bg-red-700 text-text-primary hover:bg-red-600"
            color="red"
          >
            {isCancelling ? t("Cancelling...") : t("Yes, Cancel Appointment")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CancelAppointmentPage() {
  return <CancelAppointmentPageContent />;
}
