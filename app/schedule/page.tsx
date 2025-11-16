// staffSchedulePage.js

"use client";

import { useEffect, useState } from "react";
import { usePageTitle } from "@/context/PageTitleContext";
import { useRightNav } from "@/context/RightNavContext";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Pencil, Eye } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { GenericTable, Column } from "@/components/GenericTable/GenericTable";
import { useRouter } from "next/navigation";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "react-i18next";
import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";
import { Modal } from "@/components/customUIComponents/Modal";
import { Checkbox } from "@/components/ui/checkbox";
import callApi from "../Api/callApi";
import { jwtDecode } from "jwt-decode";
import { ScheduleModal } from "./ScheduleModal";

export type TimeRange = {
  start: string | null;
  end: string | null;
};

export type Schedule = {
  _id: string;
  startDate: string;
  endDate: string;
  workTime: TimeRange;
  isDayOff: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  break1: TimeRange;
  break2: TimeRange;
  break3: TimeRange;
};

type CreateNewDashboardMenuProps = {
  onOpenModal: () => void;
};

const CreateNewSchedule = ({ onOpenModal }: CreateNewDashboardMenuProps) => {
  return (
    <CustomTooltip onClick={onOpenModal} tooltipText="Add" icon={<Plus />} />
  );
};

export default function StaffSchedulePage() {
  const { t } = useTranslation();
  const { setPageTitle } = usePageTitle();
  const { setExtraRightNavMenu, setIsRightNavVisible } = useRightNav();

  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(
    null
  );
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApplyToAllModalOpen, setIsApplyToAllModalOpen] = useState(false);
  const [scheduleToEdit, setScheduleToEdit] = useState<Schedule | null>(null); // Ново състояние за редактиране

  const router = useRouter();

  // Отваряне на модала за създаване/редактиране
  const openScheduleModal = (schedule: Schedule | null = null) => {
    setScheduleToEdit(schedule); // Задава дали е режим на редакция или създаване
    setIsModalOpen(true);
  };

  useEffect(() => {
    setPageTitle(t("Schedule"));
    // Променете onCreateNewSchedule на openScheduleModal
    setExtraRightNavMenu(
      <CreateNewSchedule onOpenModal={() => openScheduleModal()} />
    );
    setIsRightNavVisible(true);
    return () => {
      setPageTitle(null);
      setExtraRightNavMenu(null);
      setIsRightNavVisible(false);
    };
  }, [setPageTitle, setExtraRightNavMenu, setIsRightNavVisible, t]);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const data = await callApi("/api/staff-schedules", "GET");
        setSchedules(data);
      } catch (error) {
        toast.error("Неуспешно зареждане на графици.");
      }
    };
    fetchSchedules();
  }, []);

  const handleSave = async (updatedData: Schedule[]) => {
    try {
      // ... (Оставяме handleSave както си е за редактиране на таблица)
      const changes = updatedData.filter((row) =>
        schedules.some(
          (originalRow) =>
            originalRow._id === row._id &&
            JSON.stringify(originalRow) !== JSON.stringify(row)
        )
      );

      for (const updatedRow of changes) {
        await callApi(
          `/api/staff-schedules/${updatedRow._id}`,
          "PUT",
          updatedRow
        );
      }

      setSchedules(updatedData);
      toast.success("Графикът е запазен успешно!");
    } catch (error) {
      toast.error("Неуспешно запазване на графика.");
    }
  };

  const removeSchedule = async (scheduleId: string) => {
    try {
      await callApi(`/api/staff-schedules/${scheduleId}`, "DELETE");
      setSchedules((prev) =>
        prev.filter((schedule) => schedule._id !== scheduleId)
      );
      toast.success("Графикът е изтрит успешно!");
    } catch (error) {
      toast.error("Неуспешно изтриване на графика.");
    }
  };

  // Нова функция, която обединява създаването и редактирането от модала
  const handleCreateOrEdit = async (scheduleData: Schedule) => {
    const isEditing = !!scheduleData._id;

    try {
      let result: Schedule;
      if (isEditing) {
        // Редактиране
        result = await callApi(
          `/api/staff-schedules/${scheduleData._id}`,
          "PUT",
          scheduleData
        );
        setSchedules((prev) =>
          prev.map((s) => (s._id === scheduleData._id ? result : s))
        );
        toast.success(t("Schedule updated successfully!"));
      } else {
        // Създаване
        result = await callApi("/api/staff-schedules", "POST", scheduleData);
        setSchedules((prev) => [...prev, result]);
        setSelectedScheduleId(result._id);
        toast.success(t("Schedule created successfully!"));

        // Проверка дали да отвори модала за прилагане към всички
        const storedToken = localStorage.getItem("token");
        const decodedUser = jwtDecode<any>(storedToken!);

        if (decodedUser.role === "business") {
          const data = await callApi("/api/staff/staff-list", "GET");
          if (data.length > 1) {
            setIsApplyToAllModalOpen(true);
          }
        }
      }
    } catch (error) {
      toast.error(
        `Неуспешно ${isEditing ? "редактиране" : "създаване"} на графика.`
      );
    } finally {
      setIsModalOpen(false);
      setScheduleToEdit(null);
    }
  };

  const applyScheduleToAll = async (apply: boolean) => {
    console.log("apply", apply);
    try {
      if (apply && selectedScheduleId) {
        await callApi("/api/staff-schedules/apply-to-all", "POST", {
          scheduleId: selectedScheduleId,
        });
        toast.success(t("Schedule applied to all staff successfully!"));
      }
    } catch (error) {
      toast.error("Неуспешно прилагане на графика към всички служители.");
    }
    setIsApplyToAllModalOpen(false);
  };

  const columns: Column<Schedule>[] = [
    // ... (Оставяме колоните както са, но добавяме бутон за редактиране)
    {
      accessorKey: "period",
      header: "Период на графика",
      cell: ({ row }) => (
        <div className="min-w-[200px]">
          {row.original.startDate
            ? format(new Date(row.original.startDate), "dd.MM.yyyy")
            : "-"}{" "}
          до{" "}
          {row.original.endDate
            ? format(new Date(row.original.endDate), "dd.MM.yyyy")
            : "-"}
        </div>
      ),
      editableCell: ({ row }, onUpdate) => (
        <div className="flex space-x-2 min-w-[200px]">
          <LabeledInput
            type="date"
            value={row.original.startDate}
            onChange={(e) => onUpdate("startDate", e.target.value)}
            label={""}
            id={""}
          />
          <LabeledInput
            type="date"
            value={row.original.endDate}
            onChange={(e) => onUpdate("endDate", e.target.value)}
            label={""}
            id={""}
          />
        </div>
      ),
    },
    {
      accessorKey: "workTime",
      header: "Работно време",
      cell: ({ row }) => (
        <span>
          {row.original.workTime.start} - {row.original.workTime.end}
        </span>
      ),
      editableCell: ({ row }, onUpdate) => (
        <div className="flex space-x-2">
          <LabeledInput
            type="time"
            value={row.original.workTime?.start || ""}
            onChange={(e) =>
              onUpdate("workTime", {
                ...row.original.workTime,
                start: e.target.value,
              })
            }
            label={""}
            id={""}
          />
          <LabeledInput
            type="time"
            value={row.original.workTime?.end || ""}
            onChange={(e) =>
              onUpdate("workTime", {
                ...row.original.workTime,
                end: e.target.value,
              })
            }
            label={""}
            id={""}
          />
        </div>
      ),
    },
    {
      accessorKey: "isDayOff.monday",
      header: "Пон",
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.isDayOff.monday ? "Почивен" : "Работен"}
        </span>
      ),
      editableCell: ({ row }, onUpdate) => (
        <Switch
          checked={!row.original.isDayOff.monday}
          onCheckedChange={(checked) =>
            onUpdate("isDayOff", { ...row.original.isDayOff, monday: !checked })
          }
        />
      ),
    },
    {
      accessorKey: "isDayOff.tuesday",
      header: "Втор",
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.isDayOff.tuesday ? "Почивен" : "Работен"}
        </span>
      ),
      editableCell: ({ row }, onUpdate) => (
        <Switch
          checked={!row.original.isDayOff.tuesday}
          onCheckedChange={(checked) =>
            onUpdate("isDayOff", {
              ...row.original.isDayOff,
              tuesday: !checked,
            })
          }
        />
      ),
    },
    {
      accessorKey: "isDayOff.wednesday",
      header: "Сря",
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.isDayOff.wednesday ? "Почивен" : "Работен"}
        </span>
      ),
      editableCell: ({ row }, onUpdate) => (
        <Switch
          checked={!row.original.isDayOff.wednesday}
          onCheckedChange={(checked) =>
            onUpdate("isDayOff", {
              ...row.original.isDayOff,
              wednesday: !checked,
            })
          }
        />
      ),
    },
    {
      accessorKey: "isDayOff.thursday",
      header: "Четв",
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.isDayOff.thursday ? "Почивен" : "Работен"}
        </span>
      ),
      editableCell: ({ row }, onUpdate) => (
        <Switch
          checked={!row.original.isDayOff.thursday}
          onCheckedChange={(checked) =>
            onUpdate("isDayOff", {
              ...row.original.isDayOff,
              thursday: !checked,
            })
          }
        />
      ),
    },
    {
      accessorKey: "isDayOff.friday",
      header: "Пет",
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.isDayOff.friday ? "Почивен" : "Работен"}
        </span>
      ),
      editableCell: ({ row }, onUpdate) => (
        <Switch
          checked={!row.original.isDayOff.friday}
          onCheckedChange={(checked) =>
            onUpdate("isDayOff", { ...row.original.isDayOff, friday: !checked })
          }
        />
      ),
    },
    {
      accessorKey: "isDayOff.saturday",
      header: "Съб",
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.isDayOff.saturday ? "Почивен" : "Работен"}
        </span>
      ),
      editableCell: ({ row }, onUpdate) => (
        <Switch
          checked={!row.original.isDayOff.saturday}
          onCheckedChange={(checked) =>
            onUpdate("isDayOff", {
              ...row.original.isDayOff,
              saturday: !checked,
            })
          }
        />
      ),
    },
    {
      accessorKey: "isDayOff.sunday",
      header: "Нед",
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.isDayOff.sunday ? "Почивен" : "Работен"}
        </span>
      ),
      editableCell: ({ row }, onUpdate) => (
        <Switch
          checked={!row.original.isDayOff.sunday}
          onCheckedChange={(checked) =>
            onUpdate("isDayOff", { ...row.original.isDayOff, sunday: !checked })
          }
        />
      ),
    },
    {
      accessorKey: "break1",
      header: "Почивка 1",
      cell: ({ row }) => (
        <span>
          {row.original.break1?.start} - {row.original.break1?.end}
        </span>
      ),
      editableCell: ({ row }, onUpdate) => (
        <div className="flex space-x-2">
          <LabeledInput
            type="time"
            value={row.original.break1?.start || ""}
            onChange={(e) =>
              onUpdate("break1", {
                ...row.original.break1,
                start: e.target.value,
              })
            }
            label={""}
            id={""}
          />
          <LabeledInput
            type="time"
            value={row.original.break1?.end || ""}
            onChange={(e) =>
              onUpdate("break1", {
                ...row.original.break1,
                end: e.target.value,
              })
            }
            label={""}
            id={""}
          />
        </div>
      ),
    },
    {
      accessorKey: "break2",
      header: "Почивка 2",
      cell: ({ row }) => (
        <span>
          {row.original.break2?.start} - {row.original.break2?.end}
        </span>
      ),
      editableCell: ({ row }, onUpdate) => (
        <div className="flex space-x-2">
          <LabeledInput
            type="time"
            value={row.original.break2?.start || ""}
            onChange={(e) =>
              onUpdate("break2", {
                ...row.original.break2,
                start: e.target.value,
              })
            }
            label={""}
            id={""}
          />
          <LabeledInput
            type="time"
            value={row.original.break2?.end || ""}
            onChange={(e) =>
              onUpdate("break2", {
                ...row.original.break2,
                end: e.target.value,
              })
            }
            label={""}
            id={""}
          />
        </div>
      ),
    },
    {
      accessorKey: "break3",
      header: "Почивка 3",
      cell: ({ row }) => (
        <span>
          {row.original.break3?.start} - {row.original.break3?.end}
        </span>
      ),
      editableCell: ({ row }, onUpdate) => (
        <div className="flex space-x-2">
          <LabeledInput
            type="time"
            value={row.original.break3?.start || ""}
            onChange={(e) =>
              onUpdate("break3", {
                ...row.original.break3,
                start: e.target.value,
              })
            }
            label={""}
            id={""}
          />
          <LabeledInput
            type="time"
            value={row.original.break3?.end || ""}
            onChange={(e) =>
              onUpdate("break3", {
                ...row.original.break3,
                end: e.target.value,
              })
            }
            label={""}
            id={""}
          />
        </div>
      ),
    },
    {
      accessorKey: "actions",
      header: "Действия",
      cell: ({ row }) => (
        <div className="flex items-center gap-0.5 mobile-actions">
          <CustomTooltip
            onClick={() => router.push(`/schedule/${row.original._id}`)}
            tooltipText={t("View Details")}
            icon={<Eye />}
          />
          <CustomTooltip
            onClick={() => openScheduleModal(row.original)}
            tooltipText={t("Edit")}
            icon={<Pencil />}
          />
          <CustomTooltip
            onClick={() => removeSchedule(row.original._id)}
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
      <GenericTable
        data={schedules}
        columns={columns}
        editable
        onSave={handleSave}
      />
      {/* Заменен модал за създаване/редактиране */}
      <ScheduleModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleCreateOrEdit}
        schedule={scheduleToEdit}
      />

      <Modal
        label="Apply Schedule to All"
        open={isApplyToAllModalOpen}
        onOpenChange={setIsApplyToAllModalOpen}
      >
        <div className="p-4 text-center">
          <h2 className="text-xl font-bold mb-2">
            Apply schedule to the whole business?
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Do you want to apply this schedule to all staff in the business?
            Staff members will be able to edit it individually afterwards.
          </p>
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => {
                applyScheduleToAll(false);
              }}
            >
              No, for me only
            </Button>
            <Button onClick={() => applyScheduleToAll(true)}>
              Yes, apply to all
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
