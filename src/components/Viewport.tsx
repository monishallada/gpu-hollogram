import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { GpuScene } from "./GpuScene";
import { Toolbar } from "./Toolbar";
import { useAppStore } from "../store/useAppStore";

function SceneWrapper() {
  const showGrid = useAppStore((s) => s.showGrid);
  return (
    <>
      <GpuScene />
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={0.25}
        maxDistance={2.5}
        maxPolarAngle={Math.PI * 0.85}
        target={[0, 0.02, 0]}
      />
      <Environment preset="warehouse" environmentIntensity={0.35} />
      <ContactShadows
        position={[0, -0.12, 0]}
        opacity={0.4}
        scale={1.2}
        blur={2.5}
        far={0.4}
      />
      {!showGrid && null}
    </>
  );
}

export function Viewport() {
  return (
    <main className="viewport">
      <div className="viewport__chrome">
        <span className="viewport__title">3D View — Perspective</span>
        <span className="viewport__coords">WCS · mm · ISO 8015</span>
      </div>
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        className="viewport__canvas"
      >
        <color attach="background" args={["#0a0e12"]} />
        <fog attach="fog" args={["#0a0e12", 1.2, 3.5]} />
        <Suspense fallback={null}>
          <SceneWrapper />
        </Suspense>
      </Canvas>
      <Toolbar />
      <div className="viewport__overlay-corner">
        <div className="axis-gizmo">
          <span className="axis-x">X</span>
          <span className="axis-y">Y</span>
          <span className="axis-z">Z</span>
        </div>
      </div>
      <div className="scanlines" aria-hidden />
    </main>
  );
}
