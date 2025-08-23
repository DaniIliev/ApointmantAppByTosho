import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface KPICardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: "increase" | "decrease"
  }
  icon?: React.ReactNode
  className?: string
}

export function KPICard({ title, value, change, icon, className }: KPICardProps) {
  return (
    <Card
      className={cn(
        "border-2 shadow-2xl bg-card/70 backdrop-blur-lg border-primary/20",
        "hover:shadow-2xl transition-all duration-300",
        className,
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {value}
            </p>
            {change && (
              <p className={cn("text-xs mt-1", change.type === "increase" ? "text-green-500" : "text-red-500")}>
                {change.type === "increase" ? "+" : "-"}
                {Math.abs(change.value)}% from last period
              </p>
            )}
          </div>
          {icon && <div className="h-8 w-8 text-primary">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  )
}
