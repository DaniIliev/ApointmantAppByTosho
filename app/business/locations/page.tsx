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
import { toast } from "sonner";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog/DeleteConfirmationDialog";
import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";

interface Location {
  _id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
}

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
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    phone: "",
  });

  const fetchLocations = async () => {
    if (!user?.businessId) return;
    try {
      const data = await callApi(`/api/locations?businessId=${user.businessId}`, "GET");
      setLocations(data);
    } catch (error) {
      console.error("Failed to fetch locations:", error);
      toast.error(t("Failed to load locations"));
    }
  };

  useEffect(() => {
    setPageTitle(t("Manage Locations"));
    setExtraRightNavMenu(<AddLocationNav onOpenModal={() => openModal()} />);
    setIsRightNavVisible(true);
    fetchLocations();

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
      });
    } else {
      setEditingLocation(null);
      setFormData({
        name: "",
        address: "",
        city: "",
        phone: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const method = editingLocation ? "PUT" : "POST";
    const endpoint = editingLocation ? `/api/locations/${editingLocation._id}` : "/api/locations";

    try {
      await callApi(endpoint, method, { ...formData, businessId: user?.businessId });
      toast.success(editingLocation ? t("Location updated") : t("Location created"));
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.length > 0 ? (
          locations.map((loc) => (
            <Card key={loc._id} className="bg-white dark:bg-gray-800 border-primary/10 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl font-bold text-primary">{loc.name}</CardTitle>
                <div className="flex gap-1">
                  <CustomTooltip onClick={() => openModal(loc)} tooltipText={t("Edit")} icon={<Pencil className="h-4 w-4" />} />
                  <CustomTooltip onClick={() => handleDelete(loc)} tooltipText={t("Delete")} icon={<Trash2 className="h-4 w-4 text-red-500" />} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-1 text-primary" />
                  <span>{loc.address}, {loc.city}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>{loc.phone}</span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-white/50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-primary/20">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
            <p className="text-muted-foreground">{t("No locations found. Add your first location to get started!")}</p>
            <Button onClick={() => openModal()} className="mt-4 rounded-full" iconType="add">
              {t("Add Location")}
            </Button>
          </div>
        )}
      </div>

      <Modal open={isModalOpen} onOpenChange={setIsModalOpen} label={editingLocation ? t("Edit Location") : t("Add New Location")}>
        <form onSubmit={handleSubmit} className="space-y-4 p-2">
          <LabeledInput label={t("Location Name")} id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <LabeledInput label={t("Address")} id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required />
          <LabeledInput label={t("City")} id="city" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} required />
          <LabeledInput label={t("Phone")} id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isLoading}>
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
        message={t("Are you sure you want to delete this location? This may affect services and staff assigned to it.")}
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
