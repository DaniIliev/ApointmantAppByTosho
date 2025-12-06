import { useState, FC } from "react";
import { Modal } from "@/components/customUIComponents/Modal";
import { Button } from "@/components/ui/button";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import callApi from "@/app/Api/callApi";
import { toast } from "sonner";

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

const ChangePasswordModal: FC<ChangePasswordModalProps> = ({
  open,
  onClose,
}) => {
  const [password, setPassword] = useState<string>("");
  const [confirm, setConfirm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async () => {
    setError("");
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await callApi("/api/auth/change-password", "POST", {
        newPassword: password,
      });
      setPassword("");
      toast.success("Password changed successfully.");
      setConfirm("");
      onClose();
    } catch (e) {
      setError("Failed to change password.");
      toast.error("Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onClose} label="Change Password">
      <div className="space-y-4">
        <LabeledInput
          label="New password"
          id="new-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter new password"
          required
          errorText={error && !password ? error : undefined}
          showError={!!error && (!password || password.length < 6)}
        />
        <LabeledInput
          label="Confirm password"
          id="confirm-password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm new password"
          required
          errorText={
            error && password && password !== confirm ? error : undefined
          }
          showError={!!error && password !== confirm}
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <div className="flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full max-w-xs"
          >
            {loading ? "Changing..." : "Change Password"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ChangePasswordModal;
