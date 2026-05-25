export type PartCategory =
  | "assembly"
  | "cooling"
  | "pcb"
  | "silicon"
  | "power"
  | "enclosure"
  | "interface";

export interface GpuPart {
  id: string;
  name: string;
  designation: string;
  category: PartCategory;
  parentId: string | null;
  children: string[];
  description: string;
  material: string;
  massG: number;
  thermalW: number | null;
  specs: Record<string, string>;
  /** Explode offset from assembly origin (meters, scaled) */
  explode: [number, number, number];
  highlightColor: string;
  selectable: boolean;
  /** Mesh group key in scene */
  meshKey: string;
}

export const GPU_MODEL = {
  product: "NUCORE RTX-5080Ti",
  codename: "Blackwell GB203-450",
  revision: "Rev.B — EVT-2",
  project: "DT-7742-VALIDATION",
  sku: "NC-5080TI-FE-24G",
  tdp: "575W",
  process: "TSMC 4N",
  cudaCores: "21,760",
  rtCores: "3rd Gen × 170",
  tensorCores: "5th Gen × 680",
  memory: "24 GB GDDDR7 @ 32 Gbps",
  bus: "384-bit",
  pcie: "Gen5 ×16",
};

const P = (
  partial: Omit<GpuPart, "children"> & { children?: string[] }
): GpuPart => ({
  ...partial,
  children: partial.children ?? [],
});

export const PARTS: Record<string, GpuPart> = {
  root: P({
    id: "root",
    name: "RTX-5080Ti Founders Edition",
    designation: "NC-5080TI-FE-ASSY-000",
    category: "assembly",
    parentId: null,
    children: [
      "shroud",
      "backplate",
      "pcb",
      "cooling_core",
      "fans",
      "power_bracket",
    ],
    description:
      "Top-level assembly. Triple-slot reference design with vapor chamber, 20-phase VRM, and GB203-450 GPU complex.",
    material: "Multi-material assembly",
    massG: 1842,
    thermalW: 575,
    specs: {
      FormFactor: "332 × 140 × 61 mm",
      Slot: "3.0",
      WarrantyClass: "Enterprise DT",
    },
    explode: [0, 0, 0],
    highlightColor: "#4fc3f7",
    selectable: true,
    meshKey: "root",
  }),

  shroud: P({
    id: "shroud",
    name: "Founders Shroud",
    designation: "NC-5080TI-SHRD-AL-001",
    category: "enclosure",
    parentId: "root",
    children: ["shroud_logo", "shroud_rails"],
    description:
      "Die-cast aluminum shroud with acoustic tuning channels and RGB light guide (disabled in validation mode).",
    material: "ADC12 Aluminum, anodized",
    massG: 312,
    thermalW: null,
    specs: { Finish: "Matte obsidian", Tolerance: "±0.08 mm" },
    explode: [0, 0.14, 0.02],
    highlightColor: "#90a4ae",
    selectable: true,
    meshKey: "shroud",
  }),

  shroud_logo: P({
    id: "shroud_logo",
    name: "NUCORE Brand Insert",
    designation: "NC-5080TI-LOGO-PC-002",
    category: "enclosure",
    parentId: "shroud",
    description: "Polycarbonate illuminated logo insert.",
    material: "PC + diffuser film",
    massG: 4,
    thermalW: null,
    specs: { Luminance: "42 cd/m² (max)" },
    explode: [0, 0.18, 0.04],
    highlightColor: "#76ff03",
    selectable: true,
    meshKey: "shroud_logo",
  }),

  shroud_rails: P({
    id: "shroud_rails",
    name: "Shroud Mount Rails",
    designation: "NC-5080TI-RAIL-SS-003",
    category: "enclosure",
    parentId: "shroud",
    description: "Stainless mounting rails — 6× M2.5.",
    material: "SS304",
    massG: 18,
    thermalW: null,
    specs: { Torque: "0.35 N·m" },
    explode: [0.08, 0.16, 0],
    highlightColor: "#b0bec5",
    selectable: true,
    meshKey: "shroud_rails",
  }),

  backplate: P({
    id: "backplate",
    name: "Structural Backplate",
    designation: "NC-5080TI-BKP-AL-010",
    category: "enclosure",
    parentId: "root",
    children: ["backplate_thermal_pad", "nvlink_slot"],
    description:
      "3 mm aluminum backplate with thermal interface to rear memory and VRM phases.",
    material: "Al6061-T6",
    massG: 198,
    thermalW: null,
    specs: { Coating: "Nickel-graphite EMI" },
    explode: [0, -0.12, -0.01],
    highlightColor: "#78909c",
    selectable: true,
    meshKey: "backplate",
  }),

  backplate_thermal_pad: P({
    id: "backplate_thermal_pad",
    name: "Rear TIM Stack",
    designation: "NC-5080TI-TIM-GR-011",
    category: "cooling",
    parentId: "backplate",
    description: "Graphite-polymer TIM, 1.5 mm.",
    material: "Graphite composite",
    massG: 6,
    thermalW: null,
    specs: { k: "12 W/m·K" },
    explode: [0, -0.15, -0.02],
    highlightColor: "#ff6e40",
    selectable: true,
    meshKey: "backplate_pad",
  }),

  nvlink_slot: P({
    id: "nvlink_slot",
    name: "NVLink Bridge Connector",
    designation: "NC-5080TI-NVL-012",
    category: "interface",
    parentId: "backplate",
    description: "NVLink Gen4 ×2 edge connector for dual-GPU fabric.",
    material: "Gold-plated copper",
    massG: 12,
    thermalW: null,
    specs: { Bandwidth: "112.5 GB/s bidir" },
    explode: [-0.06, -0.1, 0.03],
    highlightColor: "#ffd54f",
    selectable: true,
    meshKey: "nvlink",
  }),

  pcb: P({
    id: "pcb",
    name: "Main PCB Assembly",
    designation: "NC-5080TI-PCB-020",
    category: "pcb",
    parentId: "root",
    children: [
      "gpu_die",
      "vrm",
      "memory_array",
      "pcie_edge",
      "power_12v2x6",
      "display_io",
      "mcu",
    ],
    description:
      "14-layer HDI PCB, 2 oz copper planes, impedance-controlled DDR7 and PCIe Gen5 lanes.",
    material: "FR-4 + ENIG",
    massG: 142,
    thermalW: null,
    specs: { Layers: "14", Copper: "2 oz" },
    explode: [0, -0.04, 0],
    highlightColor: "#1b5e20",
    selectable: true,
    meshKey: "pcb",
  }),

  gpu_die: P({
    id: "gpu_die",
    name: "GB203-450 GPU Die",
    designation: "NC-GB203-450-A1",
    category: "silicon",
    parentId: "pcb",
    children: [
      "gpc_0",
      "gpc_1",
      "gpc_2",
      "gpc_3",
      "gpc_4",
      "gpc_5",
      "gpc_6",
      "l2_cache",
      "memory_controller",
      "nvenc_block",
      "pcie_phy",
    ],
    description:
      "Blackwell GB203 with 7 GPCs, 21,760 CUDA cores, 680 Tensor cores, 170 RT cores. 378 mm² die.",
    material: "Silicon @ TSMC 4N",
    massG: 0.42,
    thermalW: 420,
    specs: {
      DieSize: "378 mm²",
      Transistors: "92.1B",
      BoostClock: "2.62 GHz",
    },
    explode: [0, 0.06, 0.02],
    highlightColor: "#00e5ff",
    selectable: true,
    meshKey: "gpu_die",
  }),

  ...Object.fromEntries(
    Array.from({ length: 7 }, (_, i) => {
      const id = `gpc_${i}`;
      return [
        id,
        P({
          id,
          name: `Graphics Processing Cluster ${i}`,
          designation: `NC-GB203-GPC${i}`,
          category: "silicon",
          parentId: "gpu_die",
          children: [`sm_${i}_a`, `sm_${i}_b`, `sm_${i}_c`],
          description: `GPC ${i}: 3 SM partitions, 3,072 CUDA cores, 24 RT cores, 96 Tensor cores.`,
          material: "Silicon",
          massG: 0.06,
          thermalW: 58,
          specs: {
            CUDA: "3,072",
            RT: "24",
            Tensor: "96",
            L1: "128 KB / SM group",
          },
          explode: [
            (i % 3) * 0.04 - 0.04,
            0.12 + Math.floor(i / 3) * 0.03,
            (i % 2) * 0.02,
          ],
          highlightColor: `hsl(${185 + i * 8}, 90%, 55%)`,
          selectable: true,
          meshKey: id,
        }),
      ];
    })
  ) as Record<string, GpuPart>,

  ...Object.fromEntries(
    Array.from({ length: 7 }, (_, i) =>
      ["a", "b", "c"].map((suffix, j) => {
        const id = `sm_${i}_${suffix}`;
        return [
          id,
          P({
            id,
            name: `Streaming Multiprocessor ${i}${suffix.toUpperCase()}`,
            designation: `NC-GB203-SM${i}${suffix.toUpperCase()}`,
            category: "silicon",
            parentId: `gpc_${i}`,
            description: `SM unit: 128 CUDA cores, warp scheduler, 4th-gen RT core pair, Tensor core array.`,
            material: "Silicon",
            massG: 0.02,
            thermalW: 19,
            specs: { CUDA: "128", Warps: "48 max active" },
            explode: [(j - 1) * 0.018, 0.16 + i * 0.008, j * 0.008],
            highlightColor: "#18ffff",
            selectable: true,
            meshKey: id,
          }),
        ];
      })
    ).flat()
  ) as Record<string, GpuPart>,

  l2_cache: P({
    id: "l2_cache",
    name: "L2 Cache Fabric",
    designation: "NC-GB203-L2",
    category: "silicon",
    parentId: "gpu_die",
    description: "96 MB L2 cache crossbar — unified last-level cache.",
    material: "Silicon SRAM",
    massG: 0.08,
    thermalW: 35,
    specs: { Capacity: "96 MB", Bandwidth: "12 TB/s" },
    explode: [0.05, 0.14, 0.01],
    highlightColor: "#7c4dff",
    selectable: true,
    meshKey: "l2_cache",
  }),

  memory_controller: P({
    id: "memory_controller",
    name: "Memory Controller Hub",
    designation: "NC-GB203-MCH",
    category: "silicon",
    parentId: "gpu_die",
    description: "384-bit GDDDR7 controller with ECC enterprise path.",
    material: "Silicon",
    massG: 0.05,
    thermalW: 28,
    specs: { Width: "384-bit", ECC: "Enabled (DT)" },
    explode: [-0.05, 0.13, 0.01],
    highlightColor: "#e040fb",
    selectable: true,
    meshKey: "memory_controller",
  }),

  nvenc_block: P({
    id: "nvenc_block",
    name: "NVENC / NVDEC Block",
    designation: "NC-GB203-VID",
    category: "silicon",
    parentId: "gpu_die",
    description: "9th-gen NVENC dual-engine, AV1 4:2:2 10-bit.",
    material: "Silicon",
    massG: 0.03,
    thermalW: 12,
    specs: { Codecs: "AV1, HEVC, H.264" },
    explode: [0.06, 0.11, -0.01],
    highlightColor: "#ff4081",
    selectable: true,
    meshKey: "nvenc",
  }),

  pcie_phy: P({
    id: "pcie_phy",
    name: "PCIe Gen5 PHY",
    designation: "NC-GB203-PCIE5",
    category: "silicon",
    parentId: "gpu_die",
    description: "PCIe 5.0 ×16 PHY — 64 GT/s aggregate.",
    material: "Silicon",
    massG: 0.02,
    thermalW: 8,
    specs: { Lanes: "×16", Speed: "32 GT/s/lane" },
    explode: [0, 0.08, -0.04],
    highlightColor: "#69f0ae",
    selectable: true,
    meshKey: "pcie_phy",
  }),

  vrm: P({
    id: "vrm",
    name: "20-Phase VRM Array",
    designation: "NC-5080TI-VRM-030",
    category: "power",
    parentId: "pcb",
    children: ["vrm_controller", "vrm_phases"],
    description:
      "Digital 20-phase VRM, 90 A peak per phase, Monolithic Power Systems controllers.",
    material: "Copper + ferrite",
    massG: 68,
    thermalW: 85,
    specs: { Phases: "20", Peak: "1800 A transient" },
    explode: [0.1, 0.02, 0.01],
    highlightColor: "#ffab00",
    selectable: true,
    meshKey: "vrm",
  }),

  vrm_controller: P({
    id: "vrm_controller",
    name: "VRM Digital Controller",
    designation: "NC-5080TI-PWM-031",
    category: "power",
    parentId: "vrm",
    description: "SPI-configurable PWM controller with per-phase telemetry.",
    material: "BGA IC",
    massG: 1.2,
    thermalW: 2,
    specs: { Interface: "SPI + I2C telemetry" },
    explode: [0.12, 0.05, 0.02],
    highlightColor: "#ffc400",
    selectable: true,
    meshKey: "vrm_ctrl",
  }),

  vrm_phases: P({
    id: "vrm_phases",
    name: "Power Stage Modules",
    designation: "NC-5080TI-PSU-032",
    category: "power",
    parentId: "vrm",
    description: "20× integrated power stages with dual-sided cooling.",
    material: "GaN + copper",
    massG: 52,
    thermalW: 83,
    specs: { Efficiency: "94.2% @ 575W" },
    explode: [0.11, 0.01, 0.015],
    highlightColor: "#ff6d00",
    selectable: true,
    meshKey: "vrm_phases",
  }),

  memory_array: P({
    id: "memory_array",
    name: "GDDDR7 Memory Array",
    designation: "NC-5080TI-GDDR7-040",
    category: "pcb",
    parentId: "pcb",
    children: Array.from({ length: 16 }, (_, i) => `mem_${i}`),
    description: "16× 2 GB Micron GDDDR7 modules, 32 Gbps, 768 GB/s bandwidth.",
    material: "FBGA packages",
    massG: 48,
    thermalW: 42,
    specs: { Capacity: "24 GB", Speed: "32 Gbps" },
    explode: [0, 0.03, 0.025],
    highlightColor: "#536dfe",
    selectable: true,
    meshKey: "memory_array",
  }),

  ...Object.fromEntries(
    Array.from({ length: 16 }, (_, i) => {
      const row = Math.floor(i / 8);
      const col = i % 8;
      return [
        `mem_${i}`,
        P({
          id: `mem_${i}`,
          name: `GDDDR7 Module U${i + 1}`,
          designation: `NC-GDDR7-2G-${String(i + 1).padStart(2, "0")}`,
          category: "pcb",
          parentId: "memory_array",
          description: `2 GB GDDDR7 chip — channel ${Math.floor(i / 2)}, rank ${i % 2}.`,
          material: "Micron GDDDR7",
          massG: 3,
          thermalW: 2.6,
          specs: { Channel: String(Math.floor(i / 2)), Rank: String(i % 2) },
          explode: [
            (col - 3.5) * 0.022,
            0.05,
            (row - 0.5) * 0.028 + 0.02,
          ],
          highlightColor: "#448aff",
          selectable: true,
          meshKey: `mem_${i}`,
        }),
      ];
    })
  ) as Record<string, GpuPart>,

  pcie_edge: P({
    id: "pcie_edge",
    name: "PCIe Gen5 Edge Connector",
    designation: "NC-5080TI-PCIE-050",
    category: "interface",
    parentId: "pcb",
    description: "Gold finger edge — ×16, retention notch per CEM 5.0.",
    material: "Gold / FR-4",
    massG: 8,
    thermalW: null,
    specs: { Gen: "5.0 ×16" },
    explode: [0, -0.08, -0.06],
    highlightColor: "#ffd740",
    selectable: true,
    meshKey: "pcie_edge",
  }),

  power_12v2x6: P({
    id: "power_12v2x6",
    name: "12V-2×6 Power Connector",
    designation: "NC-5080TI-PWR-051",
    category: "interface",
    parentId: "pcb",
    description: "PCI-SIG 12V-2×6, 600 W rated, sense pins active.",
    material: "Copper alloy",
    massG: 5,
    thermalW: null,
    specs: { Rating: "600 W continuous" },
    explode: [0.14, -0.02, 0.04],
    highlightColor: "#ff5252",
    selectable: true,
    meshKey: "power_conn",
  }),

  display_io: P({
    id: "display_io",
    name: "Display I/O Stack",
    designation: "NC-5080TI-IO-052",
    category: "interface",
    parentId: "pcb",
    description: "3× DisplayPort 2.1 UHBR20, 1× HDMI 2.1b.",
    material: "Shielded receptacles",
    massG: 14,
    thermalW: null,
    specs: { DP: "2.1 ×3", HDMI: "2.1b ×1" },
    explode: [-0.14, 0, 0.03],
    highlightColor: "#40c4ff",
    selectable: true,
    meshKey: "display_io",
  }),

  mcu: P({
    id: "mcu",
    name: "Board Management MCU",
    designation: "NC-5080TI-MCU-053",
    category: "pcb",
    parentId: "pcb",
    description: "I2C/SMBus MCU — thermal, fan, RGB, telemetry to DT server.",
    material: "ARM Cortex-M4",
    massG: 0.8,
    thermalW: 0.5,
    specs: { Firmware: "v3.2.1-EVT" },
    explode: [-0.08, 0.02, 0.02],
    highlightColor: "#80cbc4",
    selectable: true,
    meshKey: "mcu",
  }),

  cooling_core: P({
    id: "cooling_core",
    name: "Vapor Chamber + Fin Stack",
    designation: "NC-5080TI-VC-060",
    category: "cooling",
    parentId: "root",
    children: ["vapor_chamber", "heatpipes", "fins"],
    description: "Nickel-plated copper vapor chamber with aluminum fin array.",
    material: "Cu + Al",
    massG: 420,
    thermalW: null,
    specs: { Tmax: "92°C junction (DT limit)" },
    explode: [0, 0.08, 0],
    highlightColor: "#b388ff",
    selectable: true,
    meshKey: "cooling_core",
  }),

  vapor_chamber: P({
    id: "vapor_chamber",
    name: "Vapor Chamber Base",
    designation: "NC-5080TI-VC-061",
    category: "cooling",
    parentId: "cooling_core",
    description: "CNC copper vapor chamber, 2.5 mm wall, sintered wick.",
    material: "OFC Copper",
    massG: 185,
    thermalW: null,
    specs: { Area: "68 × 58 mm contact" },
    explode: [0, 0.1, 0.01],
    highlightColor: "#ce93d8",
    selectable: true,
    meshKey: "vapor_chamber",
  }),

  heatpipes: P({
    id: "heatpipes",
    name: "8× Heatpipe Matrix",
    designation: "NC-5080TI-HP-062",
    category: "cooling",
    parentId: "cooling_core",
    description: "8 mm × 8 composite heatpipes, sintered powder, 30 W each.",
    material: "Cu composite",
    massG: 96,
    thermalW: null,
    specs: { Count: "8", Diameter: "8 mm" },
    explode: [0.04, 0.11, 0.02],
    highlightColor: "#ea80fc",
    selectable: true,
    meshKey: "heatpipes",
  }),

  fins: P({
    id: "fins",
    name: "Aluminum Fin Array",
    designation: "NC-5080TI-FIN-063",
    category: "cooling",
    parentId: "cooling_core",
    description: "0.4 mm fins, 52 mm stack height, optimized for 3000 RPM tri-fan.",
    material: "Al1050",
    massG: 139,
    thermalW: null,
    specs: { Fins: "62", Pitch: "1.2 mm" },
    explode: [0, 0.13, 0],
    highlightColor: "#9fa8da",
    selectable: true,
    meshKey: "fins",
  }),

  fans: P({
    id: "fans",
    name: "Tri-Axial Fan Assembly",
    designation: "NC-5080TI-FAN-070",
    category: "cooling",
    parentId: "root",
    children: ["fan_0", "fan_1", "fan_2"],
    description: "3× 92 mm dual-ball bearing fans, 0–3000 RPM, PWM curve DT-7742.",
    material: "PBT + magnetic levitation",
    massG: 285,
    thermalW: null,
    specs: { Airflow: "112 CFM combined" },
    explode: [0, 0.2, 0.05],
    highlightColor: "#4dd0e1",
    selectable: true,
    meshKey: "fans",
  }),

  ...Object.fromEntries(
    Array.from({ length: 3 }, (_, i) => [
      `fan_${i}`,
      P({
        id: `fan_${i}`,
        name: `Axial Fan ${i + 1}`,
        designation: `NC-5080TI-FAN-${i}-071`,
        category: "cooling",
        parentId: "fans",
        description: `92 mm fan — blade pitch 38°, 11 blades, RGB ring omitted.`,
        material: "PBT GF30",
        massG: 95,
        thermalW: null,
        specs: { RPM: "3000 max", Noise: "38 dBA @ max" },
        explode: [(i - 1) * 0.09, 0.22, 0.06],
        highlightColor: "#26c6da",
        selectable: true,
        meshKey: `fan_${i}`,
      }),
    ])
  ) as Record<string, GpuPart>,

  power_bracket: P({
    id: "power_bracket",
    name: "Power Delivery Bracket",
    designation: "NC-5080TI-BKT-080",
    category: "power",
    parentId: "root",
    description: "Steel reinforcement bracket for 12V-2×6 strain relief.",
    material: "SPCC steel",
    massG: 22,
    thermalW: null,
    specs: { Coating: "Zinc phosphate" },
    explode: [0.12, -0.06, 0.02],
    highlightColor: "#a1887f",
    selectable: true,
    meshKey: "power_bracket",
  }),
};

// Wire parent children arrays
for (const part of Object.values(PARTS)) {
  if (part.parentId && PARTS[part.parentId]) {
    const parent = PARTS[part.parentId];
    if (!parent.children.includes(part.id)) {
      parent.children.push(part.id);
    }
  }
}

export function getAncestors(id: string): string[] {
  const chain: string[] = [];
  let current = PARTS[id]?.parentId;
  while (current) {
    chain.push(current);
    current = PARTS[current]?.parentId ?? null;
  }
  return chain;
}

export function getDescendants(id: string): string[] {
  const out: string[] = [];
  const walk = (pid: string) => {
    for (const cid of PARTS[pid]?.children ?? []) {
      out.push(cid);
      walk(cid);
    }
  };
  walk(id);
  return out;
}
