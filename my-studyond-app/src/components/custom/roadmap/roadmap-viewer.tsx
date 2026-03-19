import { useRoadmapStore } from "@/store/roadmap-store";
import { RoadmapNodeComponent } from "./roadmap-node";
import { RoadmapConnector } from "./roadmap-connector";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * RoadmapViewer -- the main component.
 *
 * Renders a vertical decision roadmap:
 *   1. Linear ancestor path (parent chain, no sibling branches)
 *   2. Current node (highlighted)
 *   3. Future branches (children of current node)
 *
 * Follows Studyond Editorial Minimalism:
 *   - Monochrome palette, functional color only
 *   - Generous whitespace, consistent rhythm
 *   - Subtle animation (300ms standard, no bounce)
 *   - Progressive disclosure on hover
 */
export function RoadmapViewer() {
  const view = useRoadmapStore((s) => s.view);
  const data = useRoadmapStore((s) => s.data);
  const navigateTo = useRoadmapStore((s) => s.navigateTo);

  if (!view || !data) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground ds-body">
        No roadmap data loaded.
      </div>
    );
  }

  const { ancestors, current, branches } = view;
  const totalAncestors = ancestors.length;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={current.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="flex w-full flex-col items-center"
      >
        {/* ── Title & Subtitle ── */}
        <div className="mb-10 text-center">
          <h1 className="header-lg text-foreground">{data.title}</h1>
          {data.subtitle && (
            <p className="ds-body mt-2 text-muted-foreground">
              {data.subtitle}
            </p>
          )}
        </div>

        {/* ── Ancestor path (linear, no siblings) ── */}
        {ancestors.map((ancestor, i) => (
          <div key={ancestor.id} className="flex flex-col items-center">
            <RoadmapNodeComponent
              node={ancestor}
              variant="ancestor"
              onClick={navigateTo}
              index={i}
            />
            <RoadmapConnector
              variant="solid"
              height={32}
              delay={i * 0.06 + 0.1}
            />
          </div>
        ))}

        {/* ── Current node ── */}
        <div className="flex flex-col items-center">
          <RoadmapNodeComponent
            node={current}
            variant="current"
            index={totalAncestors}
          />
        </div>

        {/* ── Future branches ── */}
        {branches.length > 0 && (
          <>
            {/* Connector from current to branch area */}
            <RoadmapConnector
              variant="dashed"
              height={40}
              delay={totalAncestors * 0.06 + 0.15}
            />

            {/* Branch label */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.3,
                delay: totalAncestors * 0.06 + 0.2,
              }}
              className="mb-4"
            >
              <span className="ds-caption uppercase tracking-widest text-muted-foreground">
                {branches.length === 1 ? "Next Step" : "Choose Your Path"}
              </span>
            </motion.div>

            {/* Branch cards */}
            <div
              className={cn(
                "flex w-full justify-center gap-4",
                branches.length === 1
                  ? "max-w-sm"
                  : branches.length === 2
                    ? "max-w-2xl"
                    : "max-w-4xl",
                "flex-wrap"
              )}
            >
              {branches.map((branch, i) => (
                <div key={branch.id} className="flex flex-col items-center">
                  {/* Individual dashed connector per branch */}
                  {branches.length > 1 && (
                    <ForkLine
                      index={i}
                      total={branches.length}
                      delay={totalAncestors * 0.06 + 0.25 + i * 0.05}
                    />
                  )}
                  <RoadmapNodeComponent
                    node={branch}
                    variant="branch"
                    onClick={navigateTo}
                    index={totalAncestors + 1 + i}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── End marker (if leaf node) ── */}
        {branches.length === 0 && (
          <>
            <RoadmapConnector
              variant="dashed"
              height={32}
              delay={totalAncestors * 0.06 + 0.15}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.3,
                delay: totalAncestors * 0.06 + 0.25,
              }}
              className="flex size-8 items-center justify-center rounded-full border-2 border-dashed border-border"
            >
              <div className="size-2 rounded-full bg-muted-foreground" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.3,
                delay: totalAncestors * 0.06 + 0.35,
              }}
              className="ds-caption mt-3 text-muted-foreground"
            >
              End of this path
            </motion.p>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * A small decorative dot above each fork branch.
 */
function ForkLine({ index, total, delay }: { index: number; total: number; delay: number }) {
  // Keep it simple: a small dot indicator
  void total; // used for potential spacing calculations in the future
  void index;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay }}
      className="mb-2 flex justify-center"
    >
      <div className="size-1.5 rounded-full bg-border" />
    </motion.div>
  );
}
