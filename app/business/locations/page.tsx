"use client";

import { useEffect, useState } from "react";
import { Plus, MapPin, Phone, Clock, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "@/context/PageTitleContext";
import { useRightNav } from "@/context/RightNavContext";
import { useAuthContext } from "@/context/AuthContext";
import callApi from "@/app/Api/callApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/customUIComponents/Modal";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { ImageUpload } from "@/components/customUIComponents/ImageUpload";
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

  const phoneRegex = /^\+?[0-9\s()\-]{6,20}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const isValidWebsite = (value?: string) => {
    if (!value?.trim()) return true;
    try {
      const normalized = /^https?:\/\//i.test(value)
        ? value
        : `https://${value}`;
      const url = new URL(normalized);
      return ["http:", "https:"].includes(url.protocol);
    } catch {
      return false;
    }
  };

  const [formData, setFormData] = useState<{
    name: string;
    address: string;
    addressLine2: string;
    postalCode: string;
    city: string;
    country: string;
    phone: string;
    email: string;
    website: string;
    isDefault: boolean;
    imageUrl: File | string | null;
  }>({
    name: "",
    address: "",
    addressLine2: "",
    postalCode: "",
    city: "",
    country: "България",
    phone: "",
    email: "",
    website: "",
    isDefault: false,
    imageUrl: null,
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<string, string>>>(
    {},
  );

  const validateForm = () => {
    const errors: Partial<Record<string, string>> = {};

    if (!formData.name.trim()) errors.name = t("Location name is required");
    if (!formData.address.trim()) errors.address = t("Address is required");
    if (!formData.city.trim()) errors.city = t("City is required");

    if (!formData.phone.trim()) {
      errors.phone = t("Phone is required");
    } else if (!phoneRegex.test(formData.phone.trim())) {
      errors.phone = t("Invalid phone format");
    }

    if (formData.email && !emailRegex.test(formData.email.trim())) {
      errors.email = t("Invalid email format");
    }

    if (formData.website && !isValidWebsite(formData.website)) {
      errors.website = t("Invalid website URL");
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

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
        addressLine2: location.addressLine2 || "",
        postalCode: location.postalCode || "",
        city: location.city,
        country: location.country || "България",
        phone: location.phone,
        imageUrl: location.imageUrl || "",
        email: location.email || "",
        website: location.website || "",
        isDefault: !!location.isDefault,
      });
    } else {
      setEditingLocation(null);
      setFormData({
        name: "",
        address: "",
        addressLine2: "",
        postalCode: "",
        city: "",
        phone: "",
        country: "България",
        imageUrl: null,
        email: "",
        website: "",
        isDefault: false,
      });
    }
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(t("Please fix form errors"));
      return;
    }

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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <LabeledInput
              label={t("Location Name")}
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              showError={true}
              errorText={formErrors.name || t("Required")}
            />
            <LabeledInput
              label={t("Phone")}
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              required
              showError={true}
              errorText={formErrors.phone || t("Required")}
            />
            <div>
              <LabeledInput
                label={t("Email")}
                id="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              {formErrors.email && (
                <p className="-mt-2 text-xs text-red-500">{formErrors.email}</p>
              )}
            </div>
            <LabeledInput
              label={t("Country")}
              id="country"
              value={formData.country}
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
            />
            <LabeledInput
              label={t("City")}
              id="city"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              required
              showError={true}
              errorText={formErrors.city || t("Required")}
            />
            <LabeledInput
              label={t("Postal Code")}
              id="postalCode"
              value={formData.postalCode}
              onChange={(e) =>
                setFormData({ ...formData, postalCode: e.target.value })
              }
            />
            <div className="md:col-span-2">
              <LabeledInput
                label={t("Address")}
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                required
                showError={true}
                errorText={formErrors.address || t("Required")}
              />
            </div>
          </div>

          <ImageUpload
            value={
              typeof formData.imageUrl === "string"
                ? formData.imageUrl
                : formData.imageUrl || null
            }
            fullWidth
            onChange={(file) =>
              setFormData({
                ...formData,
                imageUrl: file,
              })
            }
            onRemove={() =>
              setFormData({
                ...formData,
                imageUrl: null,
              })
            }
          />

          <div className="flex justify-center gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isLoading}
              iconType="cancel"
            >
              {t("Cancel")}
            </Button>
            <Button type="submit" disabled={isLoading} iconType="save">
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
    <ProtectedRoute requiredRoles={["business", "manager"]}>
      <LocationsPageContent />
    </ProtectedRoute>
  );
}
