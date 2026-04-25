"use client";

import { useEffect, useState } from "react";
import { usePageTitle } from "@/context/PageTitleContext";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import { useRightNav } from "@/context/RightNavContext";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { GenericTable, Column } from "@/components/GenericTable/GenericTable";
import { useTranslation } from "react-i18next";
import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";
import { StaffMember } from "./types";
import { StaffModal } from "./StaffModal";
import { useAuthContext } from "@/context/AuthContext";
import { useGetStaff, useDeleteStaff } from "@/hooks/queries/useStaff";
import { useGetLocations } from "@/hooks/queries/useLocation";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit" | "create">("create");
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  const { data: staffData, isLoading: isStaffLoading } = useGetStaff(user?.businessId, selectedLocation?._id);
  const { data: locationsData, isLoading: isLocationsLoading } = useGetLocations(user?.businessId);
  
  const staff = staffData || [];
  const locations = locationsData || [];
  const isLoading = isStaffLoading || isLocationsLoading;

  const deleteStaffMutation = useDeleteStaff();

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

  // Handle staff update/create (now handled by React Query invalidation)
  const handleStaffUpdated = () => {};
  const handleStaffCreated = () => {};

  const removeStaff = async (staffId: string) => {
    try {
      await deleteStaffMutation.mutateAsync(staffId);
    } catch (error) {
      console.error("Failed to remove staff member:", error);
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
    <ProtectedRoute requiredRoles={["business", "manager"]}>
      <StaffPageContent />
    </ProtectedRoute>
  );
}
