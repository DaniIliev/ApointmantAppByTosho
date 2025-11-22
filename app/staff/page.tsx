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
import callApi from "../Api/callApi";
import { StaffMember } from "./types";
import { StaffViewModal } from "./StaffViewModal";
import { StaffEditModal } from "./StaffEditModal";

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

function StaffPageContent() {
  const { t } = useTranslation();
  const { setPageTitle } = usePageTitle();
  const { setExtraRightNavMenu, setIsRightNavVisible } = useRightNav();

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [newStaffMember, setNewStaffMember] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    setPageTitle(t("Staff Management"));
    setExtraRightNavMenu(
      <AddStaffNav onOpenModal={() => setIsModalOpen(true)} />
    );
    setIsRightNavVisible(true);
    return () => {
      setPageTitle(null);
      setExtraRightNavMenu(null);
      setIsRightNavVisible(false);
    };
  }, [setPageTitle, setExtraRightNavMenu, setIsRightNavVisible, t]);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const data = await callApi("/api/staff/staff-list", "GET");
        setStaff(data);
      } catch (error) {
        toast.error(t("Failed to load staff"));
      }
    };
    fetchStaff();
  }, []);

  // Open staff details modal
  const openStaffDetailsModal = (staffId: string) => {
    const staff = findStaffById(staffId);
    if (staff) {
      setSelectedStaff(staff);
      setIsViewModalOpen(true);
    }
  };

  // Open staff edit modal
  const openStaffEditModalModal = (staffId: string) => {
    const staff = findStaffById(staffId);
    if (staff) {
      setSelectedStaff(staff);
      setIsEditModalOpen(true);
    }
  };

  // Find staff by ID
  const findStaffById = (staffId: string): StaffMember | undefined => {
    return staff.find((s) => s._id === staffId);
  };

  // Handle staff update
  const handleStaffUpdated = (updatedStaff: StaffMember) => {
    setStaff((prev) =>
      prev.map((s) => (s._id === updatedStaff._id ? updatedStaff : s))
    );
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

  const handleInviteStaff = async () => {
    try {
      const result = await callApi(
        "/api/staff/invite-staff",
        "POST",
        newStaffMember
      );
      setStaff((prev) => [...prev, result.staff]);

      setIsModalOpen(false);
      toast.success(
        t(
          "Staff member invited successfully! An email with a temporary password has been sent"
        )
      );

      // Изчистване на формата
      setNewStaffMember({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
      });
    } catch (error) {
      toast.error(t("Failed to invite staff member"));
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
            onClick={() => openStaffDetailsModal(row.original._id)}
            tooltipText={t("View Details")}
            icon={<Eye />}
          />
          <CustomTooltip
            onClick={() => openStaffEditModalModal(row.original._id)}
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

  return (
    <>
      <GenericTable data={staff} columns={columns} editable={false} />

      <Modal
        label={t("Add New Staff Member")}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      >
        <div className="space-y-3 p-2">
          <LabeledInput
            type="text"
            value={newStaffMember.firstName}
            onChange={(e) =>
              setNewStaffMember({
                ...newStaffMember,
                firstName: e.target.value,
              })
            }
            label={t("First Name")}
            id="firstName"
          />
          <LabeledInput
            type="text"
            value={newStaffMember.lastName}
            onChange={(e) =>
              setNewStaffMember({ ...newStaffMember, lastName: e.target.value })
            }
            label={t("Last Name")}
            id="lastName"
          />
          <LabeledInput
            type="email"
            value={newStaffMember.email}
            onChange={(e) =>
              setNewStaffMember({ ...newStaffMember, email: e.target.value })
            }
            label={t("Email")}
            id="email"
          />
          <LabeledInput
            type="tel"
            value={newStaffMember.phone}
            onChange={(e) =>
              setNewStaffMember({ ...newStaffMember, phone: e.target.value })
            }
            label={t("Phone")}
            id="phone"
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              {t("Cancel")}
            </Button>
            <Button onClick={handleInviteStaff}>{t("Invite Staff")}</Button>
          </div>
        </div>
      </Modal>

      <StaffViewModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        staff={selectedStaff}
      />

      <StaffEditModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        staff={selectedStaff}
        onStaffUpdated={handleStaffUpdated}
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
