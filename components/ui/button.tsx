import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import {
  Eye,
  Edit,
  Trash2,
  Save,
  Plus,
  X,
  Check,
  Printer,
  Download,
  Upload,
  Search,
  Settings,
  FileText,
  AlertTriangle,
  AlertCircle,
  RotateCw,
  Share2,
  Copy,
  ChevronDown,
  Filter,
  BarChart,
  Clipboard,
  ZoomIn,
  ZoomOut,
  ChevronUp,
  Info,
  XCircle,
  RefreshCcw,
  ArrowRight,
  ArrowLeft,
  Send,
  CheckCircle,
  Repeat,
} from "lucide-react";

export type IconType =
  | "view"
  | "edit"
  | "delete"
  | "save"
  | "add"
  | "cancel"
  | "check"
  | "print"
  | "download"
  | "upload"
  | "search"
  | "settings"
  | "details"
  | "warning"
  | "error"
  | "refresh"
  | "share"
  | "copy"
  | "expand"
  | "filter"
  | "chart"
  | "paste"
  | "zoomIn"
  | "zoomOut"
  | "collapse"
  | "reset"
  | "info"
  | "clear"
  | "process"
  | "next"
  | "back"
  | "send"
  | "confirm"
  | "repeatable"
  | "reject"
  | "approve";

const IconMap: Record<IconType, React.ElementType> = {
  view: Eye,
  edit: Edit,
  delete: Trash2,
  save: Save,
  add: Plus,
  cancel: XCircle,
  check: Check,
  print: Printer,
  download: Download,
  upload: Upload,
  search: Search,
  settings: Settings,
  details: FileText,
  warning: AlertTriangle,
  error: AlertCircle,
  refresh: RotateCw,
  share: Share2,
  copy: Copy,
  expand: ChevronDown,
  filter: Filter,
  chart: BarChart,
  paste: Clipboard,
  zoomIn: ZoomIn,
  zoomOut: ZoomOut,
  collapse: ChevronUp,
  reset: RefreshCcw,
  info: Info,
  clear: X,
  process: RefreshCcw,
  next: ArrowRight,
  back: ArrowLeft,
  send: Send,
  confirm: Check,
  repeatable: Repeat,
  approve: CheckCircle,
  reject: XCircle,
};

const buttonVariants = cva(
  "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all transform hover:scale-105 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary-dark",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline: `border border-primary/50 text-primary bg-transparent shadow-xs hover:bg-primary/10 dark:bg-input/30 dark:border-input dark:hover:bg-input/50`,
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
      tone: {
        error:
          "bg-red-500 text-white border border-red-600 shadow-xs hover:bg-red-600 focus-visible:ring-red-500/30 dark:bg-red-600 dark:hover:bg-red-500",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  tone,
  asChild = false,
  iconType,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    iconType?: IconType;
    tone?: "error";
  }) {
  const Comp = asChild ? Slot : "button";

  const IconComponent = iconType ? IconMap[iconType] : null;

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, tone, className }))}
      {...props}
    >
      {!asChild && IconComponent && <IconComponent />}
      {children}
    </Comp>
  );
}

export { Button, buttonVariants };
