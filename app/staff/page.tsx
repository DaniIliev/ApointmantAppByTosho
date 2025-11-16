"use client";

import { useEffect, useState } from "react";
import { usePageTitle } from "@/context/PageTitleContext";
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
  return (
    <CustomTooltip
      onClick={onOpenModal}
      tooltipText="Add Staff"
      icon={<Plus />}
    />
  );
};

export default function StaffPage() {
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
        toast.error("Неуспешно зареждане на персонала.");
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
        "Служителят е поканен успешно! Изпратен е имейл с временна парола."
      );

      // Изчистване на формата
      setNewStaffMember({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
      });
    } catch (error) {
      toast.error("Неуспешна покана на служителя.");
    }
  };

  const columns: Column<StaffMember>[] = [
    {
      accessorKey: "firstName",
      header: "First Name",
      cell: ({ row }) => <span>{row.original.firstName}</span>,
    },
    {
      accessorKey: "lastName",
      header: "Last Name",
      cell: ({ row }) => <span>{row.original.lastName}</span>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <span>{row.original.email}</span>,
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => <span>{row.original.phone}</span>,
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => <span>{row.original.role}</span>,
    },
    {
      accessorKey: "actions",
      header: "Действия",
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
        label="Add New Staff Member"
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
            label="First Name"
            id="firstName"
          />
          <LabeledInput
            type="text"
            value={newStaffMember.lastName}
            onChange={(e) =>
              setNewStaffMember({ ...newStaffMember, lastName: e.target.value })
            }
            label="Last Name"
            id="lastName"
          />
          <LabeledInput
            type="email"
            value={newStaffMember.email}
            onChange={(e) =>
              setNewStaffMember({ ...newStaffMember, email: e.target.value })
            }
            label="Email"
            id="email"
          />
          <LabeledInput
            type="tel"
            value={newStaffMember.phone}
            onChange={(e) =>
              setNewStaffMember({ ...newStaffMember, phone: e.target.value })
            }
            label="Phone"
            id="phone"
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInviteStaff}>Invite Staff</Button>
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
