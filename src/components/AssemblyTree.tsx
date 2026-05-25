import { useMemo } from "react";
import { PARTS, type GpuPart } from "../data/gpuParts";
import { useAppStore } from "../store/useAppStore";

const CATEGORY_ICON: Record<string, string> = {
  assembly: "ASM",
  cooling: "CLG",
  pcb: "PCB",
  silicon: "SLC",
  power: "PWR",
  enclosure: "ENC",
  interface: "IO",
};

function TreeNode({ part, depth }: { part: GpuPart; depth: number }) {
  const selectedId = useAppStore((s) => s.selectedId);
  const expandedNodes = useAppStore((s) => s.expandedNodes);
  const toggleExpanded = useAppStore((s) => s.toggleExpanded);
  const selectAndFocus = useAppStore((s) => s.selectAndFocus);

  const hasChildren = part.children.length > 0;
  const expanded = expandedNodes.has(part.id);
  const selected = selectedId === part.id;

  return (
    <div className="tree-node">
      <button
        type="button"
        className={`tree-row ${selected ? "tree-row--selected" : ""}`}
        style={{ paddingLeft: `${12 + depth * 14}px` }}
        onClick={() => selectAndFocus(part.id)}
      >
        {hasChildren ? (
          <span
            className="tree-expand"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpanded(part.id);
            }}
            role="presentation"
          >
            {expanded ? "▼" : "▶"}
          </span>
        ) : (
          <span className="tree-expand tree-expand--leaf" />
        )}
        <span className="tree-cat">{CATEGORY_ICON[part.category] ?? "—"}</span>
        <span className="tree-name" title={part.designation}>
          {part.name}
        </span>
      </button>
      {hasChildren && expanded && (
        <div className="tree-children">
          {part.children.map((cid) => (
            <TreeNode key={cid} part={PARTS[cid]} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function AssemblyTree() {
  const expandAll = useAppStore((s) => s.expandAll);
  const collapseAll = useAppStore((s) => s.collapseAll);
  const partCount = useMemo(() => Object.keys(PARTS).length, []);

  return (
    <aside className="panel panel--left">
      <header className="panel__header">
        <h2>Assembly Explorer</h2>
        <span className="panel__meta">{partCount} components</span>
      </header>
      <div className="panel__toolbar">
        <button type="button" onClick={expandAll}>
          Expand all
        </button>
        <button type="button" onClick={collapseAll}>
          Collapse
        </button>
      </div>
      <div className="tree-scroll">
        <TreeNode part={PARTS.root} depth={0} />
      </div>
    </aside>
  );
}
