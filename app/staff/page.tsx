"use client";

import { useEffect, useState } from "react";
import { usePageTitle } from "@/context/PageTitleContext";
import { useRightNav } from "@/context/RightNavContext";
import { Button } from "@/components/ui/button";
import { Plus, Eye } from "lucide-react";
import { toast } from "sonner";
import { GenericTable, Column } from "@/components/GenericTable/GenericTable";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { useTranslation } from "react-i18next";
import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";
import { Modal } from "@/components/customUIComponents/Modal";
import callApi from "../Api/callApi";

type StaffMember = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
};

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

  // Зареждане на данни за персонала от бекенда
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

  // Изпращане на покана към нов служител
  const handleInviteStaff = async () => {
    try {
      // Изпращане на данните към бекенда
      const result = await callApi(
        "/api/staff/invite-staff",
        "POST",
        newStaffMember
      );

      // Добавяне на новия служител в таблицата
      setStaff((prev) => [...prev, result.staff]);

      // Затваряне на модала и показване на съобщение за успех
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

  // Дефиниция на колоните за таблицата
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
    // Можете да добавите допълнителни действия тук, ако е необходимо
  ];

  return (
    <>
      <GenericTable data={staff} columns={columns} editable={false} />

      {/* Модален прозорец за добавяне на нов служител */}
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
    </>
  );
}
