import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ConnectorProps {
  /** "solid" for completed paths, "dashed" for upcoming branches */
  variant: "solid" | "dashed";
  /** Height in pixels */
  height?: number;
  /** Delay for staggered animation */
  delay?: number;
  /** Whether this is a fork connector (branches out) */
  fork?: boolean;
}

/**
 * Vertical SVG connector line between roadmap nodes.
 * Uses monochrome styling per Studyond brand -- no decorative color.
 */
export function RoadmapConnector({
  variant = "solid",
  height = 40,
  delay = 0,
  fork = false,
}: ConnectorProps) {
  const strokeColor = variant === "solid" ? "var(--foreground)" : "var(--border)";
  const strokeOpacity = variant === "solid" ? 0.2 : 0.6;
  const strokeDasharray = variant === "dashed" ? "4 4" : undefined;

  if (fork) {
    return null; // Fork visual is handled by the layout in RoadmapViewer
  }

  return (
    <div className={cn("flex justify-center")} style={{ height }}>
      <svg
        width="2"
        height={height}
        viewBox={`0 0 2 ${height}`}
        className="overflow-visible"
      >
        <motion.line
          x1="1"
          y1="0"
          x2="1"
          y2={height}
          stroke={strokeColor}
          strokeOpacity={strokeOpacity}
          strokeWidth={1.5}
          strokeDasharray={strokeDasharray}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 0.3,
            delay,
            ease: "easeOut",
          }}
        />
      </svg>
    </div>
  );
}
