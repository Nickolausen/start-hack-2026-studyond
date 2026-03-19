import { cn } from "@/lib/utils";
import type { NodeStatus, RoadmapNode as RoadmapNodeType } from "@/lib/types";
import { motion } from "framer-motion";
import {
  Check,
  ChevronRight,
  Circle,
  Compass,
  Search,
  Target,
  Building2,
  GraduationCap,
  Lightbulb,
  ClipboardList,
  FlaskConical,
  FileText,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Compass,
  Search,
  Target,
  Building2,
  GraduationCap,
  Lightbulb,
  ClipboardList,
  FlaskConical,
  FileText,
  Users,
};

interface RoadmapNodeProps {
  node: RoadmapNodeType;
  variant: "ancestor" | "current" | "branch";
  onClick?: (nodeId: string) => void;
  index?: number;
}

function getStatusStyles(status: NodeStatus, variant: string) {
  if (variant === "current") {
    return {
      ring: "ring-2 ring-foreground ring-offset-2 ring-offset-background",
      bg: "bg-primary",
      text: "text-primary-foreground",
      iconColor: "text-primary-foreground",
    };
  }

  if (variant === "ancestor") {
    return {
      ring: "",
      bg: "bg-secondary",
      text: "text-secondary-foreground",
      iconColor: "text-muted-foreground",
    };
  }

  // branch
  switch (status) {
    case "completed":
      return {
        ring: "",
        bg: "bg-secondary",
        text: "text-secondary-foreground",
        iconColor: "text-muted-foreground",
      };
    case "upcoming":
    default:
      return {
        ring: "",
        bg: "bg-card border border-border",
        text: "text-foreground",
        iconColor: "text-muted-foreground",
      };
  }
}

function StatusIndicator({ status, variant }: { status: NodeStatus; variant: string }) {
  if (variant === "current") {
    return (
      <div className="flex size-5 items-center justify-center rounded-full bg-primary-foreground">
        <Circle className="size-2.5 fill-primary text-primary" />
      </div>
    );
  }

  if (status === "completed") {
    return (
      <div className="flex size-5 items-center justify-center rounded-full bg-foreground/10">
        <Check className="size-3 text-foreground" />
      </div>
    );
  }

  return (
    <div className="flex size-5 items-center justify-center rounded-full bg-border">
      <Circle className="size-2 text-muted-foreground" />
    </div>
  );
}

export function RoadmapNodeComponent({
  node,
  variant,
  onClick,
  index = 0,
}: RoadmapNodeProps) {
  const styles = getStatusStyles(node.status, variant);
  const NodeIcon = node.icon ? ICON_MAP[node.icon] : null;

  const isClickable = variant === "branch" || variant === "ancestor";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.06,
        ease: "easeOut",
      }}
      className={cn(
        "group relative w-full",
        variant === "branch" && "max-w-sm",
        variant === "current" && "max-w-md",
        variant === "ancestor" && "max-w-xs"
      )}
    >
      <button
        type="button"
        onClick={() => isClickable && onClick?.(node.id)}
        disabled={!isClickable}
        className={cn(
          "flex w-full items-start gap-3 rounded-xl p-4 text-left transition-all duration-300",
          styles.bg,
          isClickable && "cursor-pointer hover:shadow-lg",
          !isClickable && "cursor-default",
          variant === "current" && styles.ring
        )}
      >
        <div className="flex flex-col items-center gap-1 pt-0.5">
          <StatusIndicator status={node.status} variant={variant} />
          {NodeIcon && (
            <NodeIcon
              className={cn("mt-1 size-4", styles.iconColor)}
            />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "ds-label truncate",
                styles.text,
                variant === "current" && "font-semibold"
              )}
            >
              {node.label}
            </span>
            {isClickable && (
              <ChevronRight
                className={cn(
                  "size-3.5 flex-shrink-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100",
                  styles.iconColor
                )}
              />
            )}
          </div>
          {node.description && (
            <p
              className={cn(
                "ds-caption line-clamp-2",
                variant === "current"
                  ? "text-primary-foreground/70"
                  : "text-muted-foreground"
              )}
            >
              {node.description}
            </p>
          )}
        </div>
      </button>
    </motion.div>
  );
}
