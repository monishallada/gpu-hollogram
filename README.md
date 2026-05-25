# NUCORE GPU Hologram — Digital Twin Viewer

Enterprise CAD-style 3D digital twin for the **NUCORE RTX-5080Ti** (Blackwell-class reference design). Interactive assembly tree, explodable BOM hierarchy, hologram / wireframe / solid / X-ray modes, and die-level silicon topology.

## Run locally

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

## Features

- **80+ components** in the assembly tree (fans, VRM, GDDDR7, GPC/SM die blocks, NVLink, etc.)
- Click parts in the viewport or tree to inspect specifications
- **Explode slider** and assembled / section / exploded presets
- **Die Topology** mode for GPC / SM / L2 / memory controller blocks
- Corporate UI: IBM Plex, slate palette, dimension callouts, validation session chrome

## Stack

React 18 · Vite · Three.js · React Three Fiber · Zustand
