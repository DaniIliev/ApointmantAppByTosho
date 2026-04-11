"use client";

import { useEffect, useState, useRef } from "react";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import { useAuthContext } from "@/context/AuthContext";
import callApi from "@/app/Api/callApi";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "@/context/PageTitleContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2, Printer, QrCode, Copy, Check } from "lucide-react";
import { toast } from "sonner";

function QRCodePageContent() {
  const { t } = useTranslation();
  const { setPageTitle } = usePageTitle();
  const { user } = useAuthContext();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [businessName, setBusinessName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setPageTitle(t("QR Code"));
    return () => setPageTitle(null);
  }, [setPageTitle, t]);

  useEffect(() => {
    const fetchBusinessData = async () => {
      if (!user?.businessId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await callApi(
          `/api/business/${user.businessId}`,
          "GET",
        );
        setQrCodeUrl(response.qrCodeUrl || "");
        setBusinessName(response.businessName || "");
      } catch (error) {
        toast.error(t("Failed to load QR code"));
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinessData();
  }, [user]);

  const handleDownload = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `${businessName || "business"}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(t("QR code downloaded successfully"));
  };

  const handlePrint = () => {
    if (!qrRef.current) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error(t("Please allow popups to print"));
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${businessName} - ${t("QR Code")}</title>
          <style>
            body {
              margin: 0;
              padding: 40px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              font-family: Arial, sans-serif;
            }
            h1 {
              margin-bottom: 20px;
              color: #333;
            }
            img {
              max-width: 500px;
              height: auto;
              border: 2px solid #ddd;
              border-radius: 8px;
              padding: 20px;
              background: white;
            }
            .instructions {
              margin-top: 20px;
              text-align: center;
              color: #666;
              font-size: 14px;
            }
            @media print {
              @page {
                margin: 1cm;
              }
            }
          </style>
        </head>
        <body>
          <h1>${businessName}</h1>
          <img src="${qrCodeUrl}" alt="QR Code" />
          <div class="instructions">
            <p>${t("Scan this QR code to book an appointment")}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);

    toast.success(t("Opening print dialog"));
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/business/${user?.businessId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: t(`${businessName} - Book an Appointment`),
          text: t(
            `Scan the QR code or visit the link to book an appointment at ${businessName}`,
          ),
          url: shareUrl,
        });
        toast.success(t("Shared successfully"));
      } catch (error: any) {
        if (error.name !== "AbortError") {
          toast.error(t("Failed to share"));
        }
      }
    } else {
      // Fallback: copy link to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success(t("Link copied to clipboard"));
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error(t("Failed to copy link"));
      }
    }
  };

  const handleCopyImage = async () => {
    if (!qrCodeUrl) return;

    try {
      // For base64 images, we can copy directly
      if (qrCodeUrl.startsWith("data:image")) {
        const blob = await (await fetch(qrCodeUrl)).blob();
        const item = new ClipboardItem({ "image/png": blob });
        await navigator.clipboard.write([item]);
        toast.success(t("QR code copied to clipboard"));
      } else {
        toast.error(t("Cannot copy this image format"));
      }
    } catch (error) {
      console.error("Copy failed:", error);
      toast.error(t("Failed to copy QR code"));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <QrCode className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{t("Loading QR code...")}</p>
        </div>
      </div>
    );
  }

  if (!qrCodeUrl) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {t("No QR Code Available")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("Your business QR code will be generated automatically.")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className=" mx-auto space-y-6">
        {/* Main QR Code Card */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
            <p className="text-sm text-muted-foreground mt-2">
              {t(
                "Share this QR code with your clients so they can easily book appointments",
              )}
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-6">
              {/* QR Code Display */}
              <div className="relative">
                <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-primary/20">
                  <img
                    ref={qrRef}
                    src={qrCodeUrl}
                    alt={`${businessName} QR Code`}
                    className="w-64 h-64 sm:w-80 sm:h-80 object-contain"
                  />
                </div>
                {businessName && (
                  <p className="text-center mt-4 font-semibold text-lg text-primary">
                    {businessName}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl">
                <Button
                  onClick={handleDownload}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  variant="outline"
                >
                  <Download className="h-5 w-5" />
                  <span className="text-xs">{t("Download")}</span>
                </Button>

                <Button
                  onClick={handleShare}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  variant="outline"
                >
                  {copied ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <Share2 className="h-5 w-5" />
                  )}
                  <span className="text-xs">{t("Share")}</span>
                </Button>

                <Button
                  onClick={handlePrint}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  variant="outline"
                >
                  <Printer className="h-5 w-5" />
                  <span className="text-xs">{t("Print")}</span>
                </Button>

                <Button
                  onClick={handleCopyImage}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  variant="outline"
                >
                  <Copy className="h-5 w-5" />
                  <span className="text-xs">{t("Copy")}</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function QRCodePage() {
  return (
    <ProtectedRoute requiredRoles={["business", "staff", "manager"]}>
      <QRCodePageContent />
    </ProtectedRoute>
  );
}
