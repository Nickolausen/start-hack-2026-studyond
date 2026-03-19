/**
 * Decision Roadmap data model.
 *
 * A roadmap is a tree of decision nodes. Each node represents a state in a
 * journey (e.g. thesis process). The viewer shows:
 *   - The path of parent nodes leading to the current node (linear, no siblings)
 *   - The current node, highlighted
 *   - Future branches (children of the current node)
 *
 * Past branches are hidden -- they represent decisions already taken.
 */

export type NodeStatus = "completed" | "current" | "upcoming" | "skipped";

export interface RoadmapNode {
  /** Human-readable unique identifier, e.g. "orientation-01" */
  id: string;
  /** Display label for the node */
  label: string;
  /** Optional longer description */
  description?: string;
  /** Node status in the journey */
  status: NodeStatus;
  /** Optional icon name from Lucide */
  icon?: string;
  /** Child nodes representing future decision branches */
  children?: RoadmapNode[];
}

/**
 * The full roadmap tree data structure.
 * Contains the complete decision tree -- the viewer computes which
 * ancestors to display based on the current node.
 */
export interface RoadmapData {
  /** Root node of the decision tree */
  root: RoadmapNode;
  /** Title of this roadmap */
  title: string;
  /** Optional subtitle / description */
  subtitle?: string;
}

/**
 * Computed view model: the linear path of ancestors + current node + future branches.
 */
export interface RoadmapView {
  /** Ordered ancestor path from root to the parent of current (no siblings) */
  ancestors: RoadmapNode[];
  /** The currently active node */
  current: RoadmapNode;
  /** Direct children of the current node (future branches) */
  branches: RoadmapNode[];
}
