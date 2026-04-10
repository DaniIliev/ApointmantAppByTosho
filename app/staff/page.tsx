"use client";

import { useEffect, useState } from "react";
import { usePageTitle } from "@/context/PageTitleContext";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import { useRightNav } from "@/context/RightNavContext";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { GenericTable, Column } from "@/components/GenericTable/GenericTable";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { useTranslation } from "react-i18next";
import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";
import { Modal } from "@/components/customUIComponents/Modal";
import { MultiSelectCombobox } from "@/components/customUIComponents/MultiSelectCombobox";
import callApi from "../Api/callApi";
import { StaffMember } from "./types";
import { StaffModal } from "./StaffModal";
import { useAuthContext } from "@/context/AuthContext";

import { Skeleton } from "@/components/ui/skeleton";
import { LabeledSelect } from "@/components/customUIComponents/LabeledSelect";

type AddStaffNavProps = {
  onOpenModal: () => void;
};

const AddStaffNav = ({ onOpenModal }: AddStaffNavProps) => {
  const { t } = useTranslation();
  return (
    <CustomTooltip
      onClick={onOpenModal}
      tooltipText={t("Add Staff")}
      icon={<Plus />}
    />
  );
};

import { useLocationContext } from "@/context/LocationContext";

function StaffPageContent() {
  const { t } = useTranslation();
  const { setPageTitle } = usePageTitle();
  const { setExtraRightNavMenu, setIsRightNavVisible } = useRightNav();
  const { user } = useAuthContext();
  const { selectedLocation } = useLocationContext();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit" | "create">(
    "create",
  );
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setPageTitle(t("Staff Management"));
    setExtraRightNavMenu(<AddStaffNav onOpenModal={openCreateModal} />);
    setIsRightNavVisible(true);
    return () => {
      setPageTitle(null);
      setExtraRightNavMenu(null);
      setIsRightNavVisible(false);
    };
  }, [setPageTitle, setExtraRightNavMenu, setIsRightNavVisible, t]);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.businessId) return;
      setIsLoading(true);
      try {
        const [staffData, locationsData] = await Promise.all([
          callApi(`/api/staff/staff-list?businessId=${user.businessId}`, "GET"),
          callApi(`/api/locations?businessId=${user.businessId}`, "GET"),
        ]);
        setStaff(staffData);
        setLocations(locationsData);
      } catch (error) {
        toast.error(t("Failed to load staff data"));
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user?.businessId, t, selectedLocation?._id]);

  const openStaffModal = (staffId: string, mode: "view" | "edit") => {
    const foundStaff = findStaffById(staffId);
    if (foundStaff) {
      setSelectedStaff(foundStaff);
      setModalMode(mode);
      setIsModalOpen(true);
    }
  };

  const openCreateModal = () => {
    setSelectedStaff(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  // Find staff by ID
  const findStaffById = (staffId: string): StaffMember | undefined => {
    return staff.find((s) => s._id === staffId);
  };

  // Handle staff update/create
  const handleStaffUpdated = (updatedStaff: StaffMember) => {
    setStaff((prev) =>
      prev.map((s) => (s._id === updatedStaff._id ? updatedStaff : s)),
    );
  };

  const handleStaffCreated = (newStaff: StaffMember) => {
    setStaff((prev) => [...prev, newStaff]);
  };

  const removeStaff = async (staffId: string) => {
    try {
      await callApi(`/api/staff/${staffId}`, "DELETE");
      setStaff((prev) => prev.filter((s) => s._id !== staffId));
      toast.success(t("Staff member removed successfully") as string);
    } catch (error) {
      toast.error(t("Failed to remove staff member") as string);
    }
  };

  const columns: Column<StaffMember>[] = [
    {
      accessorKey: "firstName",
      header: t("First Name"),
      cell: ({ row }) => <span>{row.original.firstName}</span>,
    },
    {
      accessorKey: "lastName",
      header: t("Last Name"),
      cell: ({ row }) => <span>{row.original.lastName}</span>,
    },
    {
      accessorKey: "email",
      header: t("Email"),
      cell: ({ row }) => <span>{row.original.email}</span>,
    },
    {
      accessorKey: "phone",
      header: t("Phone"),
      cell: ({ row }) => <span>{row.original.phone}</span>,
    },
    {
      accessorKey: "locationIds",
      header: t("Location"),
      cell: ({ row }) => {
        const staffLocations = row.original.locationIds || [];
        const names = staffLocations
          .map((id) => locations.find((l) => l._id === id)?.name)
          .filter(Boolean)
          .join(", ");
        return (
          <span className="truncate max-w-[200px] block">{names || "-"}</span>
        );
      },
    },
    {
      accessorKey: "role",
      header: t("Role"),
      cell: ({ row }) => <span>{row.original.role}</span>,
    },
    {
      accessorKey: "actions",
      header: t("Actions"),
      cell: ({ row }) => (
        <div className="flex items-center gap-0.5 mobile-actions">
          <CustomTooltip
            onClick={() => openStaffModal(row.original._id, "view")}
            tooltipText={t("View Details")}
            icon={<Eye />}
          />
          <CustomTooltip
            onClick={() => openStaffModal(row.original._id, "edit")}
            tooltipText={t("Edit")}
            icon={<Pencil />}
          />
          <CustomTooltip
            onClick={() => removeStaff(row.original._id)}
            tooltipText={t("Delete")}
            icon={<Trash2 className=" text-red-500" />}
          />
        </div>
      ),
      enableHiding: false,
    },
  ];

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <>
      <GenericTable data={staff} columns={columns} editable={false} />

      <StaffModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        mode={modalMode}
        staff={selectedStaff}
        onStaffUpdated={handleStaffUpdated}
        onStaffCreated={handleStaffCreated}
        locations={locations}
      />
    </>
  );
}

export default function StaffPage() {
  return (
    <ProtectedRoute requiredRoles={["business"]}>
      <StaffPageContent />
    </ProtectedRoute>
  );
}
