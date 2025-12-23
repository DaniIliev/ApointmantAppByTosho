import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Clock, Euro, Settings } from "lucide-react";
import { formatPriceEUR } from "@/Global/Utils/commonFn";
import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";
import { AppointmentType } from "@/Global/Types/types";

type AppointmentCardProps = {
  type: AppointmentType;
  openModal: (type: AppointmentType) => void;
  handleDelete: (type: AppointmentType) => void;
  formatDuration: (minutes: number) => string;
  setSelectedType: (type: AppointmentType) => void;
};

const AppointmentCard = ({
  type,
  openModal,
  handleDelete,
  formatDuration,
  setSelectedType,
}: AppointmentCardProps) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const toggleMenu = (typeId: string) => {
    setOpenMenuId(openMenuId === typeId ? null : typeId);
  };

  return (
    <Card
      key={type._id}
      onClick={() => setSelectedType(type)}
      className="border-2 shadow-2xl bg-card/70 backdrop-blur-lg border-primary/20 hover:scale-[1.02] hover:shadow-3xl transition-all duration-300 transform cursor-pointer flex flex-col overflow-hidden max-h-86"
    >
      <div className="relative w-full h-[70%] bg-gray-200">
        {type.imageUrl && (
          <img
            src={type.imageUrl}
            alt={type.name}
            className="w-full h-full object-contain"
          />
        )}
        <div
          className="absolute top-4 right-4 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <CustomTooltip
            onClick={() => {
              toggleMenu(type._id);
            }}
            tooltipText="Settings"
            icon={
              <Settings className="text-black hover:text-gray-500 transition-colors" />
            }
          />
          {openMenuId === type._id && (
            <div className="absolute top-full right-0 mt-2 bg-card/90 backdrop-blur-md p-2 rounded-md shadow-lg flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  openModal(type);
                  setOpenMenuId(null);
                }}
                className="rounded-xl p-2 h-auto hover:bg-muted"
              >
                <Edit className="h-4 w-4 text-primary" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(type);
                  setOpenMenuId(null);
                }}
                className="rounded-xl p-2 h-auto hover:bg-muted"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          )}
        </div>
      </div>
      <CardContent className="px-6 flex flex-col flex-grow">
        <div
          className={`h-3 w-full bg-gradient-to-r ${type.color} rounded-full`}
        ></div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-foreground">{type.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-3 overflow-hidden">
            {type.description?.length > 40
              ? type.description.slice(0, 40) + "..."
              : type.description}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {formatDuration(type.duration)}
          </div>
          <div className="flex items-center gap-2 text-lg font-bold text-primary">
            <Euro className="h-5 w-5" />
            {formatPriceEUR(type.price)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentCard;
