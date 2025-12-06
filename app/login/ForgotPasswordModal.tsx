import { useState } from "react";
import { Modal } from "@/components/customUIComponents/Modal";
import { Button } from "@/components/ui/button";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";

interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
  onSend: (email: string) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  sent?: boolean;
}

import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const ForgotPasswordModal = ({
  open,
  onClose,
  onSend,
  loading,
  error,
  sent,
}: ForgotPasswordModalProps) => {
  const [email, setEmail] = useState("");
  const { t } = useTranslation();
  useEffect(() => {
    if (!open) setEmail("");
  }, [open]);

  const handleSend = async () => {
    await onSend(email);
  };

  return (
    <Modal open={open} onOpenChange={onClose} label="Forgot Password">
      <div className="space-y-4">
        {sent ? (
          <div className="text-green-600 text-center">
            {t("A one-time password has been sent to your email.")}
          </div>
        ) : (
          <>
            <LabeledInput
              id="forgot-email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
            <div className="flex justify-center">
              <Button
                onClick={handleSend}
                disabled={loading || !email}
                className="w-full max-w-xs"
              >
                {loading ? t("Sending...") : t("Send")}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default ForgotPasswordModal;
