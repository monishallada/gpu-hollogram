import { create } from "zustand";
import { PARTS } from "../data/gpuParts";

export type ViewMode = "solid" | "wireframe" | "hologram" | "xray";
export type DisplayMode = "assembled" | "exploded" | "section";

interface AppState {
  selectedId: string;
  hoveredId: string | null;
  expandedNodes: Set<string>;
  viewMode: ViewMode;
  displayMode: DisplayMode;
  explodeFactor: number;
  showLabels: boolean;
  showDimensions: boolean;
  showGrid: boolean;
  isolateSelection: boolean;
  siliconView: boolean;
  cameraPreset: string | null;

  setSelected: (id: string) => void;
  setHovered: (id: string | null) => void;
  toggleExpanded: (id: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
  setViewMode: (mode: ViewMode) => void;
  setDisplayMode: (mode: DisplayMode) => void;
  setExplodeFactor: (v: number) => void;
  toggleLabels: () => void;
  toggleDimensions: () => void;
  toggleGrid: () => void;
  toggleIsolate: () => void;
  toggleSiliconView: () => void;
  setCameraPreset: (preset: string | null) => void;
  selectAndFocus: (id: string) => void;
}

const defaultExpanded = new Set(["root", "pcb", "gpu_die", "cooling_core"]);

export const useAppStore = create<AppState>((set, get) => ({
  selectedId: "root",
  hoveredId: null,
  expandedNodes: defaultExpanded,
  viewMode: "hologram",
  displayMode: "assembled",
  explodeFactor: 0,
  showLabels: true,
  showDimensions: true,
  showGrid: true,
  isolateSelection: false,
  siliconView: false,
  cameraPreset: null,

  setSelected: (id) => set({ selectedId: id, cameraPreset: null }),
  setHovered: (id) => set({ hoveredId: id }),
  toggleExpanded: (id) => {
    const next = new Set(get().expandedNodes);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    set({ expandedNodes: next });
  },
  expandAll: () =>
    set({ expandedNodes: new Set(Object.keys(PARTS)) }),
  collapseAll: () => set({ expandedNodes: new Set(["root"]) }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setDisplayMode: (mode) => {
    const explode =
      mode === "exploded" ? 1 : mode === "section" ? 0.45 : 0;
    set({ displayMode: mode, explodeFactor: explode });
  },
  setExplodeFactor: (v) =>
    set({
      explodeFactor: v,
      displayMode: v > 0.8 ? "exploded" : v > 0.1 ? "section" : "assembled",
    }),
  toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),
  toggleDimensions: () => set((s) => ({ showDimensions: !s.showDimensions })),
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  toggleIsolate: () => set((s) => ({ isolateSelection: !s.isolateSelection })),
  toggleSiliconView: () => {
    const next = !get().siliconView;
    set({
      siliconView: next,
      selectedId: next ? "gpu_die" : "root",
      explodeFactor: next ? 0.85 : get().explodeFactor,
      expandedNodes: next
        ? new Set([...get().expandedNodes, "gpu_die", ...PARTS.gpu_die.children])
        : get().expandedNodes,
    });
  },
  setCameraPreset: (preset) => set({ cameraPreset: preset }),
  selectAndFocus: (id) =>
    set({ selectedId: id, cameraPreset: `focus-${id}` }),
}));
