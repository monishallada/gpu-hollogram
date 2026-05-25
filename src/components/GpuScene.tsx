import { useRef, useMemo, useEffect, type ReactNode } from "react";
import { useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import { Edges, Grid, Html, Line, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { PARTS, getDescendants } from "../data/gpuParts";
import { useAppStore } from "../store/useAppStore";
import { createHologramMaterial, createSolidMaterial } from "../shaders/hologramMaterial";

const SCALE = 1;

interface PartMeshProps {
  meshKey: string;
  partId: string;
  geometry: ReactNode;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  visible?: boolean;
}

function PartMesh({
  meshKey,
  partId,
  geometry,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  visible = true,
}: PartMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const selectedId = useAppStore((s) => s.selectedId);
  const hoveredId = useAppStore((s) => s.hoveredId);
  const viewMode = useAppStore((s) => s.viewMode);
  const explodeFactor = useAppStore((s) => s.explodeFactor);
  const isolateSelection = useAppStore((s) => s.isolateSelection);
  const setSelected = useAppStore((s) => s.setSelected);
  const setHovered = useAppStore((s) => s.setHovered);

  const part = PARTS[partId];
  const isSelected = selectedId === partId || getDescendants(selectedId).includes(partId);
  const isDirectSelected = selectedId === partId;
  const isHovered = hoveredId === partId;
  const isHighlighted = isDirectSelected || isHovered;

  const descendants = useMemo(() => getDescendants(selectedId), [selectedId]);
  const dimmed =
    isolateSelection &&
    selectedId !== partId &&
    !descendants.includes(partId) &&
    selectedId !== "root";

  const targetOffset = useMemo(() => {
    const e = part.explode;
    return new THREE.Vector3(e[0] * explodeFactor, e[1] * explodeFactor, e[2] * explodeFactor);
  }, [part.explode, explodeFactor]);

  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.Material | null>(null);

  useEffect(() => {
    if (materialRef.current) materialRef.current.dispose();
    if (viewMode === "solid" || viewMode === "xray") {
      const m = createSolidMaterial(part.highlightColor, 0.55, 0.4);
      if (viewMode === "xray") {
        m.transparent = true;
        m.opacity = dimmed ? 0.08 : isHighlighted ? 0.95 : 0.35;
      }
      materialRef.current = m;
    } else {
      materialRef.current = createHologramMaterial(part.highlightColor, {
        wireframe: viewMode === "wireframe",
      });
    }
    if (meshRef.current) meshRef.current.material = materialRef.current;
    return () => {
      materialRef.current?.dispose();
    };
  }, [part.highlightColor, viewMode, dimmed, isHighlighted]);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.position.lerp(targetOffset, 0.12);
    const mat = meshRef.current;
    if (mat?.material && "uniforms" in mat.material) {
      const um = mat.material as THREE.ShaderMaterial;
      um.uniforms.uTime.value = state.clock.elapsedTime;
      um.uniforms.uHighlight.value = THREE.MathUtils.lerp(
        um.uniforms.uHighlight.value,
        isHighlighted ? 1 : 0,
        0.15
      );
      um.uniforms.uOpacity.value = dimmed ? 0.12 : isHighlighted ? 0.95 : 0.55;
    }
  });

  if (!visible) return null;

  const scaleArr = Array.isArray(scale) ? scale : ([scale, scale, scale] as [number, number, number]);

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scaleArr}>
      <mesh
        ref={meshRef}
        name={meshKey}
        castShadow
        receiveShadow
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          if (part.selectable) setSelected(partId);
        }}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
          setHovered(partId);
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default";
          setHovered(null);
        }}
      >
        {geometry}
        {(viewMode === "wireframe" || isDirectSelected) && (
          <Edges
            threshold={15}
            color={isDirectSelected ? "#00e5ff" : "#546e7a"}
            linewidth={isDirectSelected ? 2 : 1}
          />
        )}
      </mesh>
      {isDirectSelected && <SelectionRing color={part.highlightColor} />}
    </group>
  );
}

function SelectionRing({ color }: { color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.z = state.clock.elapsedTime * 0.5;
  });
  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.12, 0.125, 64]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Box({ args }: { args: [number, number, number] }) {
  return <boxGeometry args={args.map((a) => a * SCALE) as [number, number, number]} />;
}

function Cyl({ args }: { args: [number, number, number, number?] }) {
  return (
    <cylinderGeometry
      args={[
        (args[0] ?? 0.5) * SCALE,
        (args[1] ?? 0.5) * SCALE,
        (args[2] ?? 1) * SCALE,
        args[3] ?? 32,
      ]}
    />
  );
}

function GpuAssembly() {
  const showLabels = useAppStore((s) => s.showLabels);
  const selectedId = useAppStore((s) => s.selectedId);
  const siliconView = useAppStore((s) => s.siliconView);

  return (
    <group rotation={[-0.15, 0.55, 0]} position={[0, 0, 0]}>
      {/* PCB */}
      <PartMesh meshKey="pcb" partId="pcb" position={[0, -0.02, 0]}>
        <Box args={[0.32, 0.006, 0.14]} />
      </PartMesh>

      {/* GPU Die */}
      <PartMesh meshKey="gpu_die" partId="gpu_die" position={[0, 0.008, 0.01]}>
        <Box args={[0.055, 0.004, 0.055]} />
      </PartMesh>

      {/* GPC clusters on die */}
      {Array.from({ length: 7 }, (_, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = (col - 1) * 0.016;
        const z = (row - 1) * 0.016 + (i === 6 ? 0.024 : 0);
        return (
          <PartMesh
            key={`gpc_${i}`}
            meshKey={`gpc_${i}`}
            partId={`gpc_${i}`}
            position={[x, 0.012, z]}
            visible={siliconView || selectedId === "gpu_die" || selectedId.startsWith("gpc")}
          >
            <Box args={[0.014, 0.002, 0.014]} />
          </PartMesh>
        );
      })}

      {/* SM units */}
      {Array.from({ length: 7 }, (_, i) =>
        ["a", "b", "c"].map((suffix, j) => (
          <PartMesh
            key={`sm_${i}_${suffix}`}
            meshKey={`sm_${i}_${suffix}`}
            partId={`sm_${i}_${suffix}`}
            position={[(j - 1) * 0.005, 0.014, (i % 3) * 0.004 - 0.004]}
            visible={siliconView}
          >
            <Box args={[0.004, 0.001, 0.004]} />
          </PartMesh>
        ))
      )}

      <PartMesh meshKey="l2_cache" partId="l2_cache" position={[0.022, 0.011, 0]} visible={siliconView}>
        <Box args={[0.02, 0.0015, 0.04]} />
      </PartMesh>
      <PartMesh meshKey="memory_controller" partId="memory_controller" position={[-0.022, 0.011, 0]} visible={siliconView}>
        <Box args={[0.018, 0.0015, 0.035]} />
      </PartMesh>
      <PartMesh meshKey="nvenc" partId="nvenc_block" position={[0.024, 0.01, -0.02]} visible={siliconView}>
        <Box args={[0.012, 0.0015, 0.012]} />
      </PartMesh>
      <PartMesh meshKey="pcie_phy" partId="pcie_phy" position={[0, 0.009, -0.028]} visible={siliconView}>
        <Box args={[0.03, 0.001, 0.008]} />
      </PartMesh>

      {/* Memory chips */}
      {Array.from({ length: 16 }, (_, i) => {
        const row = Math.floor(i / 8);
        const col = i % 8;
        return (
          <PartMesh
            key={`mem_${i}`}
            meshKey={`mem_${i}`}
            partId={`mem_${i}`}
            position={[(col - 3.5) * 0.034, 0.006, (row - 0.5) * 0.038 + 0.05]}
          >
            <Box args={[0.028, 0.008, 0.014]} />
          </PartMesh>
        );
      })}

      {/* VRM */}
      <PartMesh meshKey="vrm" partId="vrm" position={[0.12, 0.008, 0.02]}>
        <Box args={[0.08, 0.012, 0.1]} />
      </PartMesh>
      <PartMesh meshKey="vrm_ctrl" partId="vrm_controller" position={[0.14, 0.014, 0.04]}>
        <Box args={[0.012, 0.004, 0.012]} />
      </PartMesh>
      <PartMesh meshKey="vrm_phases" partId="vrm_phases" position={[0.12, 0.01, 0.02]}>
        <Box args={[0.07, 0.008, 0.08]} />
      </PartMesh>

      {/* PCIe edge */}
      <PartMesh meshKey="pcie_edge" partId="pcie_edge" position={[0, -0.01, -0.1]}>
        <Box args={[0.28, 0.008, 0.04]} />
      </PartMesh>

      {/* Power connector */}
      <PartMesh meshKey="power_conn" partId="power_12v2x6" position={[0.16, 0.02, 0.05]}>
        <Box args={[0.025, 0.02, 0.05]} />
      </PartMesh>

      {/* Display IO */}
      <PartMesh meshKey="display_io" partId="display_io" position={[-0.17, 0, 0.04]}>
        <Box args={[0.02, 0.04, 0.1]} />
      </PartMesh>

      <PartMesh meshKey="mcu" partId="mcu" position={[-0.1, 0.008, 0.03]}>
        <Box args={[0.008, 0.003, 0.008]} />
      </PartMesh>

      {/* Cooling */}
      <PartMesh meshKey="vapor_chamber" partId="vapor_chamber" position={[0, 0.03, 0.01]}>
        <Box args={[0.2, 0.008, 0.12]} />
      </PartMesh>
      <PartMesh meshKey="heatpipes" partId="heatpipes" position={[0.04, 0.05, 0]}>
        <Box args={[0.22, 0.04, 0.06]} />
      </PartMesh>
      <PartMesh meshKey="fins" partId="fins" position={[0, 0.07, 0]}>
        <Box args={[0.28, 0.05, 0.13]} />
      </PartMesh>

      {/* Fans */}
      {Array.from({ length: 3 }, (_, i) => (
        <PartMesh key={i} meshKey={`fan_${i}`} partId={`fan_${i}`} position={[(i - 1) * 0.1, 0.1, 0.06]}>
          <Cyl args={[0.045, 0.045, 0.022, 48]} />
        </PartMesh>
      ))}

      {/* Shroud — founders-style frame */}
      <PartMesh meshKey="shroud" partId="shroud" position={[0, 0.08, 0.02]}>
        <Box args={[0.33, 0.06, 0.15]} />
      </PartMesh>
      <PartMesh meshKey="shroud_logo" partId="shroud_logo" position={[0, 0.11, 0.09]}>
        <Box args={[0.06, 0.008, 0.02]} />
      </PartMesh>

      {/* Backplate */}
      <PartMesh meshKey="backplate" partId="backplate" position={[0, -0.04, -0.02]}>
        <Box args={[0.32, 0.004, 0.14]} />
      </PartMesh>
      <PartMesh meshKey="nvlink" partId="nvlink_slot" position={[-0.05, -0.035, 0.05]}>
        <Box args={[0.04, 0.006, 0.02]} />
      </PartMesh>

      <PartMesh meshKey="power_bracket" partId="power_bracket" position={[0.14, -0.03, 0.04]}>
        <Box args={[0.03, 0.08, 0.04]} />
      </PartMesh>

      {/* Root invisible hit area */}
      <PartMesh meshKey="root" partId="root" visible={false}>
        <Box args={[0.34, 0.14, 0.16]} />
      </PartMesh>

      {showLabels && selectedId && (
        <PartLabel partId={selectedId} />
      )}
    </group>
  );
}

function PartLabel({ partId }: { partId: string }) {
  const part = PARTS[partId];
  const pos = part.explode;
  return (
    <Html position={[pos[0], pos[1] + 0.2, pos[2]]} center distanceFactor={6} style={{ pointerEvents: "none" }}>
      <div className="viewport-label">
        <span className="viewport-label__id">{part.designation}</span>
        <span className="viewport-label__name">{part.name}</span>
      </div>
    </Html>
  );
}

function DimensionLines() {
  const show = useAppStore((s) => s.showDimensions);
  if (!show) return null;
  const points: [number, number, number][] = [
    [-0.17, -0.12, 0.08],
    [0.17, -0.12, 0.08],
  ];
  return (
    <group>
      <Line points={points} color="#5c7a8a" lineWidth={1} dashed dashSize={0.02} gapSize={0.01} />
      <Html position={[0, -0.14, 0.1]} center distanceFactor={8} style={{ pointerEvents: "none" }}>
        <span className="dim-callout">332.00 mm</span>
      </Html>
    </group>
  );
}

function ScanPlane() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.08 + 0.05;
    }
  });
  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={[0.5, 0.5]} />
      <meshBasicMaterial
        color="#00bcd4"
        transparent
        opacity={0.06}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

export function GpuScene() {
  const showGrid = useAppStore((s) => s.showGrid);
  const viewMode = useAppStore((s) => s.viewMode);
  const cameraPreset = useAppStore((s) => s.cameraPreset);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0.55, 0.35, 0.55]} fov={42} near={0.01} far={100} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-4, 2, -3]} intensity={0.4} color="#4fc3f7" />
      <pointLight position={[0, 0.3, 0.2]} intensity={0.6} color="#00e5ff" />

      {showGrid && (
        <Grid
          infiniteGrid
          cellSize={0.05}
          sectionSize={0.25}
          cellColor="#1a3a4a"
          sectionColor="#2a5a6a"
          fadeDistance={4}
          position={[0, -0.12, 0]}
        />
      )}

      <GpuAssembly />
      <DimensionLines />
      {viewMode === "hologram" && <ScanPlane />}
      <AnimatedFans />

      <CameraController preset={cameraPreset} />
    </>
  );
}

function CameraController({ preset }: { preset: string | null }) {
  const { camera } = useThree();
  const setCameraPreset = useAppStore((s) => s.setCameraPreset);
  const target = useRef(new THREE.Vector3(0, 0.02, 0));

  useEffect(() => {
    if (!preset) return;
    const presets: Record<string, [number, number, number]> = {
      top: [0.02, 0.72, 0.02],
      front: [0.02, 0.08, 0.72],
      die: [0.18, 0.22, 0.18],
      power: [0.48, 0.18, 0.28],
    };
    const key = preset.startsWith("focus-") ? "die" : preset;
    const p = presets[key] ?? presets.die;
    camera.position.set(p[0], p[1], p[2]);
    camera.lookAt(target.current);
    const t = window.setTimeout(() => setCameraPreset(null), 50);
    return () => window.clearTimeout(t);
  }, [preset, camera, setCameraPreset]);

  return null;
}

function AnimatedFans() {
  const g0 = useRef<THREE.Group>(null);
  const g1 = useRef<THREE.Group>(null);
  const g2 = useRef<THREE.Group>(null);
  useFrame((state) => {
    const r = state.clock.elapsedTime * 2.2;
    if (g0.current) g0.current.rotation.y = r;
    if (g1.current) g1.current.rotation.y = r * 0.97;
    if (g2.current) g2.current.rotation.y = r * 1.03;
  });
  return (
    <>
      <group ref={g0} position={[-0.1, 0.1, 0.06]}>
        <FanBlades />
      </group>
      <group ref={g1} position={[0, 0.1, 0.06]}>
        <FanBlades />
      </group>
      <group ref={g2} position={[0.1, 0.1, 0.06]}>
        <FanBlades />
      </group>
    </>
  );
}

function FanBlades() {
  return (
    <group>
      {Array.from({ length: 11 }, (_, b) => (
        <mesh key={b} rotation={[0, (b / 11) * Math.PI * 2, 0]} position={[0, 0.012, 0]}>
          <boxGeometry args={[0.005, 0.022, 0.038]} />
          <meshStandardMaterial color="#263238" metalness={0.8} roughness={0.3} transparent opacity={0.35} />
        </mesh>
      ))}
    </group>
  );
}
