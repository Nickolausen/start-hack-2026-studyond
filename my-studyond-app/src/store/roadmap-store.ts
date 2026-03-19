import { create } from "zustand";
import type { RoadmapData, RoadmapNode, RoadmapView } from "@/lib/types";

interface RoadmapState {
  /** The full roadmap tree data */
  data: RoadmapData | null;
  /** ID of the currently highlighted / active node */
  currentNodeId: string | null;
  /** Cached computed view (computed once per action, not per-render) */
  view: RoadmapView | null;

  /** Set the roadmap data and optionally the initial current node */
  setData: (data: RoadmapData, initialNodeId?: string) => void;
  /** Navigate to a specific node by id */
  navigateTo: (nodeId: string) => void;
}

/**
 * Find a node by ID in the tree.
 */
function findNode(
  node: RoadmapNode,
  id: string
): RoadmapNode | null {
  if (node.id === id) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findNode(child, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Find the path from root to a target node (inclusive).
 * Returns null if the target is not found.
 */
function findPathToNode(
  node: RoadmapNode,
  targetId: string,
  path: RoadmapNode[] = []
): RoadmapNode[] | null {
  const currentPath = [...path, node];

  if (node.id === targetId) {
    return currentPath;
  }

  if (node.children) {
    for (const child of node.children) {
      const result = findPathToNode(child, targetId, currentPath);
      if (result) return result;
    }
  }

  return null;
}

/**
 * Find the first node with status "current" in the tree.
 */
function findCurrentNode(node: RoadmapNode): string | null {
  if (node.status === "current") return node.id;
  if (node.children) {
    for (const child of node.children) {
      const found = findCurrentNode(child);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Apply correct statuses based on the active node path.
 * Ancestors of the active node become "completed",
 * the active node becomes "current",
 * descendants become "upcoming".
 */
function applyStatuses(
  node: RoadmapNode,
  pathIds: Set<string>,
  currentId: string
): RoadmapNode {
  let status: RoadmapNode["status"];

  if (node.id === currentId) {
    status = "current";
  } else if (pathIds.has(node.id)) {
    status = "completed";
  } else {
    status = "upcoming";
  }

  return {
    ...node,
    status,
    children: node.children?.map((child) =>
      applyStatuses(child, pathIds, currentId)
    ),
  };
}

/**
 * Compute the view model from the full data tree and current node ID.
 * This is called once per action (setData/navigateTo), not per-render.
 * Result is cached in state to avoid infinite loops.
 */
function computeView(
  data: RoadmapData | null,
  currentNodeId: string | null
): RoadmapView | null {
  if (!data || !currentNodeId) return null;

  const path = findPathToNode(data.root, currentNodeId);
  if (!path || path.length === 0) return null;

  // Apply correct statuses based on navigation
  const pathIds = new Set(path.map((n) => n.id));
  const updatedRoot = applyStatuses(data.root, pathIds, currentNodeId);

  // Re-find path in updated tree
  const updatedPath = findPathToNode(updatedRoot, currentNodeId);
  if (!updatedPath || updatedPath.length === 0) return null;

  const current = updatedPath[updatedPath.length - 1];
  const ancestors = updatedPath.slice(0, -1);
  const branches = current.children ?? [];

  return {
    ancestors,
    current,
    branches,
  };
}

export const useRoadmapStore = create<RoadmapState>((set) => ({
  data: null,
  currentNodeId: null,
  view: null,

  setData: (data, initialNodeId) => {
    const nodeId =
      initialNodeId ?? findCurrentNode(data.root) ?? data.root.id;
    const view = computeView(data, nodeId);
    set({ data, currentNodeId: nodeId, view });
  },

  navigateTo: (nodeId) => {
    set((state) => {
      if (!state.data) return state;

      const node = findNode(state.data.root, nodeId);
      if (!node) return state;

      const view = computeView(state.data, nodeId);
      return { currentNodeId: nodeId, view };
    });
  },
}));
