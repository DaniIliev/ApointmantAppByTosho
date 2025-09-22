// components/EmptyStateCard.tsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus } from "lucide-react";

type EmptyStateProps = {
  onOpenModal: () => void;
};

const EmptyState = ({ onOpenModal }: EmptyStateProps) => {
  return (
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
          onClick={onOpenModal}
          className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 rounded-xl"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Appointment Type
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyState;
