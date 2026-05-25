import { PARTS, GPU_MODEL } from "../data/gpuParts";
import { useAppStore } from "../store/useAppStore";
import { getAncestors } from "../data/gpuParts";

export function Inspector() {
  const selectedId = useAppStore((s) => s.selectedId);
  const hoveredId = useAppStore((s) => s.hoveredId);
  const part = PARTS[selectedId];
  const hovered = hoveredId ? PARTS[hoveredId] : null;
  const ancestors = getAncestors(selectedId).reverse();

  return (
    <aside className="panel panel--right">
      <header className="panel__header">
        <h2>Properties</h2>
        <span className="panel__meta">Inspector — DT-7742</span>
      </header>

      <section className="inspector-block">
        <h3>Product</h3>
        <dl className="spec-dl">
          <dt>Model</dt>
          <dd>{GPU_MODEL.product}</dd>
          <dt>Codename</dt>
          <dd>{GPU_MODEL.codename}</dd>
          <dt>Revision</dt>
          <dd>{GPU_MODEL.revision}</dd>
          <dt>CUDA Cores</dt>
          <dd>{GPU_MODEL.cudaCores}</dd>
          <dt>Memory</dt>
          <dd>{GPU_MODEL.memory}</dd>
          <dt>TDP</dt>
          <dd>{GPU_MODEL.tdp}</dd>
        </dl>
      </section>

      <section className="inspector-block inspector-block--selection">
        <h3>Selection</h3>
        <div className="breadcrumb">
          {ancestors.map((id) => (
            <span key={id}>
              {PARTS[id].name}
              <span className="breadcrumb__sep"> › </span>
            </span>
          ))}
          <span className="breadcrumb__current">{part.name}</span>
        </div>
        <p className="designation">{part.designation}</p>
        <p className="description">{part.description}</p>

        <dl className="spec-dl">
          <dt>Category</dt>
          <dd className="capitalize">{part.category}</dd>
          <dt>Material</dt>
          <dd>{part.material}</dd>
          <dt>Mass</dt>
          <dd>{part.massG} g</dd>
          {part.thermalW != null && (
            <>
              <dt>Thermal budget</dt>
              <dd>{part.thermalW} W</dd>
            </>
          )}
        </dl>

        <h4>Specifications</h4>
        <dl className="spec-dl spec-dl--compact">
          {Object.entries(part.specs).map(([k, v]) => (
            <div key={k} className="spec-row">
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>

        {part.children.length > 0 && (
          <div className="child-count">
            {part.children.length} sub-component
            {part.children.length !== 1 ? "s" : ""}
          </div>
        )}
      </section>

      {hovered && hovered.id !== selectedId && (
        <section className="inspector-block inspector-block--hover">
          <h3>Hover</h3>
          <p className="designation">{hovered.designation}</p>
          <p>{hovered.name}</p>
        </section>
      )}
    </aside>
  );
}
