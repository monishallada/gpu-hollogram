import { useAppStore, type ViewMode, type DisplayMode } from "../store/useAppStore";

const VIEW_MODES: { id: ViewMode; label: string }[] = [
  { id: "hologram", label: "Hologram" },
  { id: "wireframe", label: "Wireframe" },
  { id: "solid", label: "Solid" },
  { id: "xray", label: "X-Ray" },
];

const DISPLAY_MODES: { id: DisplayMode; label: string }[] = [
  { id: "assembled", label: "Assembled" },
  { id: "section", label: "Section" },
  { id: "exploded", label: "Exploded" },
];

export function Toolbar() {
  const viewMode = useAppStore((s) => s.viewMode);
  const displayMode = useAppStore((s) => s.displayMode);
  const explodeFactor = useAppStore((s) => s.explodeFactor);
  const showLabels = useAppStore((s) => s.showLabels);
  const showDimensions = useAppStore((s) => s.showDimensions);
  const showGrid = useAppStore((s) => s.showGrid);
  const isolateSelection = useAppStore((s) => s.isolateSelection);
  const siliconView = useAppStore((s) => s.siliconView);
  const setViewMode = useAppStore((s) => s.setViewMode);
  const setDisplayMode = useAppStore((s) => s.setDisplayMode);
  const setExplodeFactor = useAppStore((s) => s.setExplodeFactor);
  const toggleLabels = useAppStore((s) => s.toggleLabels);
  const toggleDimensions = useAppStore((s) => s.toggleDimensions);
  const toggleGrid = useAppStore((s) => s.toggleGrid);
  const toggleIsolate = useAppStore((s) => s.toggleIsolate);
  const toggleSiliconView = useAppStore((s) => s.toggleSiliconView);
  const setCameraPreset = useAppStore((s) => s.setCameraPreset);

  return (
    <div className="viewport-toolbar">
      <div className="toolbar-group">
        <span className="toolbar-label">View</span>
        {VIEW_MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            className={viewMode === m.id ? "active" : ""}
            onClick={() => setViewMode(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="toolbar-group">
        <span className="toolbar-label">Display</span>
        {DISPLAY_MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            className={displayMode === m.id ? "active" : ""}
            onClick={() => setDisplayMode(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="toolbar-group toolbar-group--slider">
        <span className="toolbar-label">Explode</span>
        <input
          type="range"
          min={0}
          max={100}
          value={explodeFactor * 100}
          onChange={(e) => setExplodeFactor(Number(e.target.value) / 100)}
        />
        <span className="toolbar-value">{Math.round(explodeFactor * 100)}%</span>
      </div>

      <div className="toolbar-group">
        <button type="button" className={siliconView ? "active" : ""} onClick={toggleSiliconView}>
          Die Topology
        </button>
        <button type="button" className={showLabels ? "active" : ""} onClick={toggleLabels}>
          Labels
        </button>
        <button type="button" className={showDimensions ? "active" : ""} onClick={toggleDimensions}>
          Dimensions
        </button>
        <button type="button" className={showGrid ? "active" : ""} onClick={toggleGrid}>
          Grid
        </button>
        <button type="button" className={isolateSelection ? "active" : ""} onClick={toggleIsolate}>
          Isolate
        </button>
      </div>

      <div className="toolbar-group">
        <span className="toolbar-label">Camera</span>
        <button type="button" onClick={() => setCameraPreset("front")}>
          Front
        </button>
        <button type="button" onClick={() => setCameraPreset("top")}>
          Top
        </button>
        <button type="button" onClick={() => setCameraPreset("die")}>
          Die
        </button>
      </div>
    </div>
  );
}
