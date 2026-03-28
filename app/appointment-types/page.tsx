"use client";

import { useEffect, useState } from "react";
import type React from "react";
import { Plus } from "lucide-react";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "@/context/PageTitleContext";
import { useRightNav } from "@/context/RightNavContext";

import { AppointmentType } from "@/Global/Types/types";
import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog/DeleteConfirmationDialog";
import callApi from "@/app/Api/callApi";
import AppointmentCard from "./AppointmentCard";
import EmptyState from "./EmptyState";
import CreateAppointmentModal from "./CreateAppointmentModal";
import AppointmentDetailsModal from "./AppointmentDetailsModal";
import { useAuthContext } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

type CreateNewDashboardMenuProps = {
  onOpenModal: () => void;
};
const CreateNewTypeMenu = ({ onOpenModal }: CreateNewDashboardMenuProps) => {
  const { t } = useTranslation();
  return (
    <CustomTooltip
      onClick={onOpenModal}
      tooltipText={t("Add")}
      icon={<Plus />}
    />
  );
};

import { useLocationContext } from "@/context/LocationContext";

function AppointmentTypesPageContent() {
  const { t } = useTranslation();
  const { user } = useAuthContext();
  const { selectedLocation } = useLocationContext();
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>(
    []
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<AppointmentType | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    duration: string;
    price: string;
    color: string;
    imageUrl: File | string | null;
    category: string;
    locationId: string;
    staffMembers: { _id: string; name: string }[];
    paymentOption: "cash" | "card" | "cash_and_card";
  }>({
    name: "",
    category: "",
    description: "",
    duration: "",
    locationId: "",
    price: "",
    color: "from-blue-500 to-cyan-500",
    imageUrl: null,
    staffMembers: [],
    paymentOption: "cash",
  });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<AppointmentType | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<AppointmentType | null>(
    null
  );

  const { setPageTitle } = usePageTitle();
  const { setExtraRightNavMenu, setIsRightNavVisible } = useRightNav();

  const fetchServices = async () => {
    try {
      const services = await callApi(
        `/api/service?businessId=${user?.businessId}`,
        "GET"
      );
      setAppointmentTypes(services);
    } catch (error) {
      console.error("Failed to fetch services:", error);
    } finally {
      setIsPageLoading(false);
    }
  };

  useEffect(() => {
    setPageTitle(t("Appointment Types"));
    setExtraRightNavMenu(<CreateNewTypeMenu onOpenModal={() => openModal()} />);
    setIsRightNavVisible(true);
    
    return () => {
      setPageTitle(null);
      setExtraRightNavMenu(null);
      setIsRightNavVisible(false);
    };
  }, [setPageTitle, setExtraRightNavMenu, setIsRightNavVisible, t]);

  useEffect(() => {
    fetchServices();
  }, [user?.businessId, selectedLocation?._id]);

  const colorOptions = [
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-pink-500",
    "from-green-500 to-emerald-500",
    "from-orange-500 to-red-500",
    "from-indigo-500 to-purple-500",
    "from-teal-500 to-green-500",
    "from-rose-500 to-pink-500",
    "from-amber-500 to-orange-500",
  ];

  const openModal = (type?: AppointmentType) => {
    if (type) {
      setEditingType(type);
      setFormData({
        name: type.name,
        category: type.category,
        description: type.description || "",
        duration: type.duration.toString(),
        price: type.price.toString(),
        color: type.color || "from-blue-500 to-cyan-500",
        imageUrl: type.imageUrl || null,
        staffMembers:
          type.staffMembers?.map((s: any) => ({
            _id: s._id,
            name:
              s.name || `${s.firstName || ""} ${s.lastName || ""}`.trim(),
          })) || [],
        paymentOption: (type as any).paymentOption || "cash",
        locationId: type.locationId || "",
      });
    } else {
      setEditingType(null);
      setFormData({
        name: "",
        category: "",
        description: "",
        duration: "",
        price: "",
        color: "from-blue-500 to-cyan-500",
        imageUrl: null,
        staffMembers: [],
        paymentOption: "cash",
        locationId: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingType ? "PUT" : "POST";
    const endpoint = `/api/service${editingType ? "/" + editingType._id : ""}`;
    setIsLoading(true);
    console.log("formdata", formData.staffMembers);
    try {
      const isFile = formData.imageUrl instanceof File;
      const dataToSend = {
        name: formData.name,
        description: formData.description,
        duration: Number(formData.duration),
        price: Number(formData.price),
        color: formData.color,
        imageUrl: formData.imageUrl,
        category: formData.category,
        staffMembers: JSON.stringify(formData.staffMembers),
        paymentOption: formData.paymentOption,
        locationId: formData.locationId,
        businessId: user?.businessId,
      };
      console.log("payload", dataToSend);
      await callApi(endpoint, method, dataToSend, isFile);
      fetchServices();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save appointment type:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (type: AppointmentType) => {
    setTypeToDelete(type);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (typeToDelete) {
      try {
        await callApi(`/api/service/${typeToDelete._id}`, "DELETE");
        fetchServices();
      } catch (error) {
        console.error("Failed to delete appointment type:", error);
      }
    }
    setIsDeleteDialogOpen(false);
    setTypeToDelete(null);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours} ${t("hours")} ${remainingMinutes} ${t("minutes")}`
      : `${hours} ${t("hours")}`;
  };
  if (isPageLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-48 rounded-2xl w-full" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {appointmentTypes.length > 0 ? (
          appointmentTypes.map((type) => (
            <AppointmentCard
              key={type._id}
              type={type}
              openModal={openModal}
              handleDelete={handleDelete}
              formatDuration={formatDuration}
              setSelectedType={setSelectedType}
            />
          ))
        ) : (
          <EmptyState onOpenModal={() => openModal()} />
        )}
      </div>

      <CreateAppointmentModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        editingType={editingType}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        colorOptions={colorOptions}
      />

      <AppointmentDetailsModal
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        formatDuration={formatDuration}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={t("Delete Appointment Type")}
        message={t(
          'Are you sure you want to delete "{{name}}"? This action cannot be undone.',
          { name: typeToDelete?.name || "" }
        )}
      />
    </div>
  );
}

export default function AppointmentTypesPage() {
  return (
    <ProtectedRoute requiredRoles={["business"]}>
      <AppointmentTypesPageContent />
    </ProtectedRoute>
  );
}
