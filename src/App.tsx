import { AssemblyTree } from "./components/AssemblyTree";
import { Inspector } from "./components/Inspector";
import { Viewport } from "./components/Viewport";
import { GPU_MODEL, PARTS } from "./data/gpuParts";
import { useAppStore } from "./store/useAppStore";
import "./styles/app.css";

function StatusBar() {
  const selectedId = useAppStore((s) => s.selectedId);
  const viewMode = useAppStore((s) => s.viewMode);
  const displayMode = useAppStore((s) => s.displayMode);
  const part = PARTS[selectedId];

  return (
    <footer className="status-bar">
      <span>NUCORE Digital Twin Platform v4.2.1</span>
      <span className="status-bar__sep">|</span>
      <span>Project: {GPU_MODEL.project}</span>
      <span className="status-bar__sep">|</span>
      <span>
        Selection: {part.designation} — {part.name}
      </span>
      <span className="status-bar__sep">|</span>
      <span>
        View: {viewMode} · {displayMode}
      </span>
      <span className="status-bar__right">Validation session · Read-only</span>
    </footer>
  );
}

function AppHeader() {
  return (
    <header className="app-header">
      <div className="app-header__brand">
        <div className="logo-mark" aria-hidden />
        <div>
          <span className="brand-name">NUCORE</span>
          <span className="brand-sub">Digital Twin · Enterprise CAD Viewer</span>
        </div>
      </div>
      <nav className="app-header__nav">
        <span className="nav-item nav-item--active">Assembly</span>
        <span className="nav-item">Thermal</span>
        <span className="nav-item">SI/PI</span>
        <span className="nav-item">BOM</span>
        <span className="nav-item">Change Log</span>
      </nav>
      <div className="app-header__meta">
        <span className="sku">{GPU_MODEL.sku}</span>
        <span className="revision">{GPU_MODEL.revision}</span>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <div className="app">
      <AppHeader />
      <div className="workspace">
        <AssemblyTree />
        <Viewport />
        <Inspector />
      </div>
      <StatusBar />
    </div>
  );
}
