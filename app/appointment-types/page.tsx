"use client";
import { useEffect, useState } from "react";
import type React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Clock, DollarSign, Sparkles } from "lucide-react";
import { usePageTitle } from "@/context/PageTitleContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRightNav } from "@/context/RightNavContext";

interface AppointmentType {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  color: string;
}

const mockAppointmentTypes: AppointmentType[] = [
  {
    id: "1",
    name: "Business Consultation",
    description: "Initial consultation for business strategy and planning",
    duration: 60,
    price: 150,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "2",
    name: "Strategy Session",
    description: "Deep dive into strategic planning and implementation",
    duration: 90,
    price: 200,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "3",
    name: "Follow-up Meeting",
    description: "Progress review and next steps discussion",
    duration: 30,
    price: 75,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "4",
    name: "Project Review",
    description: "Comprehensive project evaluation and feedback",
    duration: 45,
    price: 100,
    color: "from-orange-500 to-red-500",
  },
];

type CreateNewDashboardMenuProps = {
  onOpenModal: () => void;
};
const CreateNewTypeMenu = ({ onOpenModal }: CreateNewDashboardMenuProps) => {
  return (
    <TooltipProvider>
      <div className="flex flex-col items-center space-y-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onOpenModal}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <Plus className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add New Type</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default function AppointmentTypesPage() {
  const [appointmentTypes, setAppointmentTypes] =
    useState<AppointmentType[]>(mockAppointmentTypes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<AppointmentType | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: "",
    price: "",
    color: "from-blue-500 to-cyan-500",
  });

  const { setPageTitle } = usePageTitle();
  const { setExtraRightNavMenu, setIsRightNavVisible } = useRightNav();

  useEffect(() => {
    setPageTitle("Appointment Types");
    setExtraRightNavMenu(
      <CreateNewTypeMenu onOpenModal={() => setIsModalOpen(true)} />
    );
    setIsRightNavVisible(true);
    return () => {
      setPageTitle(null);
      setExtraRightNavMenu(null);
      setIsRightNavVisible(false);
    };
  }, [setPageTitle, setExtraRightNavMenu, setIsRightNavVisible]);

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
        description: type.description,
        duration: type.duration.toString(),
        price: type.price.toString(),
        color: type.color,
      });
    } else {
      setEditingType(null);
      setFormData({
        name: "",
        description: "",
        duration: "",
        price: "",
        color: "from-blue-500 to-cyan-500",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newType: AppointmentType = {
      id: editingType?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      duration: Number.parseInt(formData.duration),
      price: Number.parseFloat(formData.price),
      color: formData.color,
    };

    if (editingType) {
      setAppointmentTypes((prev) =>
        prev.map((type) => (type.id === editingType.id ? newType : type))
      );
    } else {
      setAppointmentTypes((prev) => [...prev, newType]);
    }

    setIsModalOpen(false);
  };

  const deleteType = (id: string) => {
    setAppointmentTypes((prev) => prev.filter((type) => type.id !== id));
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  return (
    <div className="min-h-screen">
      {/* <div className="flex justify-end">
        <Button
          onClick={() => openModal()}
          className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 rounded-xl"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Appointment Type
        </Button>
      </div> */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appointmentTypes.map((type) => (
          <Card
            key={type.id}
            className="border-2 shadow-2xl bg-card/70 backdrop-blur-lg border-primary/20 hover:shadow-3xl transition-all duration-300"
          >
            <CardContent className="p-6">
              <div className="space-y-4">
                <div
                  className={`h-3 w-full bg-gradient-to-r ${type.color} rounded-full`}
                ></div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">
                    {type.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {type.description}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {formatDuration(type.duration)}
                  </div>
                  <div className="flex items-center gap-2 text-lg font-bold text-primary">
                    <DollarSign className="h-5 w-5" />
                    {type.price}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openModal(type)}
                    className="flex-1 rounded-xl bg-transparent"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteType(type.id)}
                    className="rounded-xl bg-transparent text-red-500 hover:text-red-600 hover:border-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {appointmentTypes.length === 0 && (
        <Card className="border-2 shadow-2xl bg-card/70 backdrop-blur-lg border-primary/20">
          <CardContent className="p-12 text-center">
            <Sparkles className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">
              No appointment types configured
            </h3>
            <p className="text-muted-foreground mb-4">
              Create your first appointment type to get started
            </p>
            <Button
              onClick={() => openModal()}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Appointment Type
            </Button>
          </CardContent>
        </Card>
      )}
      {/* </div> */}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md bg-card/95 backdrop-blur-lg border-2 border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {editingType ? "Edit Appointment Type" : "New Appointment Type"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Business Consultation"
                className="h-12 border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Brief description of the service"
                className="border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm font-medium">
                  Duration (minutes)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      duration: e.target.value,
                    }))
                  }
                  placeholder="60"
                  className="h-12 border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl"
                  required
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-medium">
                  Price ($)
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, price: e.target.value }))
                  }
                  placeholder="150.00"
                  className="h-12 border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl"
                  required
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Color Theme</Label>
              <div className="grid grid-cols-4 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, color }))}
                    className={`h-10 bg-gradient-to-r ${color} rounded-lg border-2 transition-all duration-200 ${
                      formData.color === color
                        ? "border-primary scale-110"
                        : "border-transparent hover:scale-105"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 rounded-xl bg-transparent"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 rounded-xl"
              >
                {editingType ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
