import type { ViewId } from "@/lib/types";

interface ProductionHubProps {
  onNavigate: (view: ViewId) => void;
}

export function ProductionHub({ onNavigate }: ProductionHubProps) {
  return (
    <>
      <div className="ops-layout">
        <section className="card production-command">
          <div className="panel-header">
            <div>
              <span className="pill">De la colmena al frasco</span>
              <h2>Centro de produccion</h2>
            </div>
            <button className="primary-button" onClick={() => onNavigate("traceability")} type="button">Crear lote trazable</button>
          </div>
          <div className="batch-progress">
            {["Cosecha", "Filtrado", "Envasado", "Etiqueta QR", "Venta"].map((step, index) => (
              <div key={step}>
                <strong>{step}</strong>
                <span className={index < 2 ? "done" : index === 2 ? "active" : ""} />
              </div>
            ))}
          </div>
          <div className="lot-board">
            <article><span className="tag ok">Activo</span><strong>M2026-001</strong><p>El Manzano · 320 kg · 640 frascos</p><b>$672.000 margen</b></article>
            <article><span className="tag watch">Envasando</span><strong>M2026-002</strong><p>Las Palmas · 260 kg · 520 frascos</p><b>$524.000 margen</b></article>
            <article><span className="tag watch">Borrador</span><strong>M2026-003</strong><p>El Arrayan · 210 kg · 420 frascos</p><b>$386.000 margen</b></article>
          </div>
        </section>
        <section className="card">
          <div className="panel-header"><h2>Inventario critico</h2></div>
          <div className="stock-list">
            <article><strong>Frascos 500 g</strong><span>480 disponibles</span><progress max="100" value="62" /></article>
            <article><strong>Tapas doradas</strong><span>350 disponibles</span><progress max="100" value="38" /></article>
            <article><strong>Etiquetas QR</strong><span>640 impresas</span><progress max="100" value="78" /></article>
          </div>
        </section>
      </div>
      <div className="module-grid">
        <Action title="Cosecha y rendimiento" copy="Kilos por apiario, rendimiento por colmena y comparativo de temporada." target="traceability" onNavigate={onNavigate} />
        <Action title="Trazabilidad QR" copy="Lote, origen, fecha, envases, costos, margen y ficha publica." target="traceability" onNavigate={onNavigate} />
        <Action title="Inventario" copy="Frascos, tapas, marcos, medicamentos y alertas de stock." target="inventory" onNavigate={onNavigate} />
      </div>
    </>
  );
}

function Action({ title, copy, target, onNavigate }: { title: string; copy: string; target: ViewId; onNavigate: (view: ViewId) => void }) {
  return (
    <article className="module-card action-card">
      <span className="tag ok">Modulo</span>
      <h2>{title}</h2>
      <p>{copy}</p>
      <button className="ghost-button" onClick={() => onNavigate(target)} type="button">Gestionar</button>
    </article>
  );
}
