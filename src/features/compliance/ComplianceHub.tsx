import type { ViewId } from "@/lib/types";

interface ComplianceHubProps {
  onNavigate: (view: ViewId) => void;
  onToast: (message: string) => void;
}

export function ComplianceHub({ onNavigate, onToast }: ComplianceHubProps) {
  const actions: Array<[string, string, ViewId]> = [
    ["Perfil Apicultor SAG", "RUT, registro, contacto, INDAP, certificacion y domicilio.", "sagProfile"],
    ["Declaracion SIPEC Octubre", "Flujo anual con apiarios, colmenas, cambios y respaldo.", "sipec"],
    ["Reportes PDF/Excel", "FRADA, sanidad, bioseguridad, produccion y trazabilidad.", "reports"],
    ["Prioridades de cumplimiento", "Checklist de completitud para vender e implementar.", "priorities"]
  ];

  return (
    <>
      <div className="compliance-dashboard">
        <section className="card compliance-score">
          <span className="pill">Chile / SAG</span>
          <strong>86%</strong>
          <h2>Preparacion documental</h2>
          <p>Perfil, FRADA, SIPEC, tratamientos, bioseguridad y reportes en un solo flujo.</p>
          <button className="primary-button" onClick={() => onToast("Paquete SAG/SIPEC exportado")} type="button">Exportar paquete SAG</button>
        </section>
        <section className="card">
          <div className="panel-header"><h2>Checklist cumplimiento</h2></div>
          <div className="flow-list compact">
            {["Perfil Apicultor SAG", "Apiarios FRADA", "SIPEC Octubre", "Reportes"].map((item, index) => (
              <article className={`flow-step ${index < 2 ? "done" : index === 2 ? "active" : ""}`} key={item}>
                <b>{index + 1}</b>
                <div><strong>{item}</strong><small>{index < 2 ? "Completo" : index === 2 ? "Borrador listo" : "Pendiente de exportar"}</small></div>
              </article>
            ))}
          </div>
        </section>
      </div>
      <div className="module-grid">
        {actions.map(([title, copy, target]) => (
          <article className="module-card action-card" key={title}>
            <span className="tag ok">Abrir</span>
            <h2>{title}</h2>
            <p>{copy}</p>
            <button className="ghost-button" onClick={() => onNavigate(target)} type="button">Entrar</button>
          </article>
        ))}
      </div>
    </>
  );
}
