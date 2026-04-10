"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  MapPin,
  Phone,
  Clock,
  Pencil,
  Trash2,
  Upload,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "@/context/PageTitleContext";
import { useRightNav } from "@/context/RightNavContext";
import { useAuthContext } from "@/context/AuthContext";
import callApi from "@/app/Api/callApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/customUIComponents/Modal";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { toast } from "sonner";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog/DeleteConfirmationDialog";
import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";
import { useRouter } from "next/navigation";
import { LocationCard } from "@/components/business/LocationCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Location } from "@/Global/Types/types";

const AddLocationNav = ({ onOpenModal }: { onOpenModal: () => void }) => {
  const { t } = useTranslation();
  return (
    <CustomTooltip
      onClick={onOpenModal}
      tooltipText={t("Add Location")}
      icon={<Plus />}
    />
  );
};

function LocationsPageContent() {
  const { t } = useTranslation();
  const { setPageTitle } = usePageTitle();
  const { setExtraRightNavMenu, setIsRightNavVisible } = useRightNav();
  const { user } = useAuthContext();

  const [locations, setLocations] = useState<Location[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const router = useRouter();

  const [formData, setFormData] = useState<{
    name: string;
    address: string;
    city: string;
    phone: string;
    email: string;
    imageUrl: File | string | null;
  }>({
    name: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    imageUrl: null,
  });

  const fetchLocations = async (isInitial = false) => {
    if (!user?.businessId) return;
    if (isInitial) setIsInitialLoading(true);
    try {
      const data = await callApi(
        `/api/locations?businessId=${user.businessId}`,
        "GET",
      );
      setLocations(data);
    } catch (error) {
      console.error("Failed to fetch locations:", error);
      toast.error(t("Failed to load locations"));
    } finally {
      if (isInitial) setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    setPageTitle(t("Manage Locations"));
    setExtraRightNavMenu(<AddLocationNav onOpenModal={() => openModal()} />);
    setIsRightNavVisible(true);
    fetchLocations(true);

    return () => {
      setPageTitle(null);
      setExtraRightNavMenu(null);
      setIsRightNavVisible(false);
    };
  }, [setPageTitle, t, user?.businessId]);

  const openModal = (location?: Location) => {
    if (location) {
      setEditingLocation(location);
      setFormData({
        name: location.name,
        address: location.address,
        city: location.city,
        phone: location.phone,
        imageUrl: location.imageUrl || "",
        email: location.email || "",
      });
    } else {
      setEditingLocation(null);
      setFormData({
        name: "",
        address: "",
        city: "",
        phone: "",
        imageUrl: null,
        email: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const method = editingLocation ? "PUT" : "POST";
    const endpoint = editingLocation
      ? `/api/locations/${editingLocation._id}`
      : "/api/locations";

    try {
      const isFile = formData.imageUrl instanceof File;
      const payload = { ...formData, businessId: user?.businessId };
      await callApi(endpoint, method, payload, isFile);
      toast.success(
        editingLocation ? t("Location updated") : t("Location created"),
      );
      fetchLocations();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save location:", error);
      toast.error(t("Failed to save location"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (location: Location) => {
    setLocationToDelete(location);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!locationToDelete) return;
    try {
      await callApi(`/api/locations/${locationToDelete._id}`, "DELETE");
      toast.success(t("Location deleted"));
      fetchLocations();
    } catch (error) {
      console.error("Failed to delete location:", error);
      toast.error(t("Failed to delete location"));
    } finally {
      setIsDeleteDialogOpen(false);
      setLocationToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {isInitialLoading ? (
          [1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-96 rounded-3xl w-full" />
          ))
        ) : locations.length > 0 ? (
          locations.map((loc) => (
            <LocationCard
              key={loc._id}
              location={loc}
              showActions
              onEdit={() => openModal(loc)}
              onDelete={() => handleDelete(loc)}
              onClick={() => router.push(`/business/locations/${loc._id}`)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-white/50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-primary/20">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
            <p className="text-muted-foreground">
              {t("No locations found. Add your first location to get started!")}
            </p>
            <Button
              onClick={() => openModal()}
              className="mt-4 rounded-full"
              iconType="add"
            >
              {t("Add Location")}
            </Button>
          </div>
        )}
      </div>

      <Modal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        label={editingLocation ? t("Edit Location") : t("Add New Location")}
      >
        <form onSubmit={handleSubmit} className="space-y-4 p-2">
          <LabeledInput
            label={t("Location Name")}
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <LabeledInput
            label={t("Address")}
            id="address"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            required
          />
          <LabeledInput
            label={t("City")}
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            required
          />
          <LabeledInput
            label={t("Phone")}
            id="phone"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            required
          />
          <LabeledInput
            label={t("Email")}
            id="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />

          <div className="space-y-2">
            <label
              htmlFor="image"
              className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-input rounded-xl cursor-pointer bg-input/20 hover:bg-input/40 transition-colors duration-300"
            >
              <Upload className="h-6 w-6 text-gray-500 mb-1" />
              <span className="text-sm text-gray-600">
                {formData.imageUrl instanceof File
                  ? `1 file selected: ${formData.imageUrl.name}`
                  : formData.imageUrl
                    ? t("Image uploaded")
                    : t("Click to upload or drag & drop")}
              </span>
              <input
                id="image"
                type="file"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    imageUrl: e.target.files?.[0] || null,
                  })
                }
                className="sr-only"
                accept="image/*"
              />
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isLoading}
            >
              {t("Cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t("Saving...") : t("Save")}
            </Button>
          </div>
        </form>
      </Modal>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title={t("Delete Location")}
        message={t(
          "Are you sure you want to delete this location? This may affect services and staff assigned to it.",
        )}
      />
    </div>
  );
}

export default function LocationsPage() {
  return (
    <ProtectedRoute requiredRoles={["business"]}>
      <LocationsPageContent />
    </ProtectedRoute>
  );
}
