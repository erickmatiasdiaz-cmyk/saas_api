"use client";

import { createExportJob } from "@/lib/supabase-data";
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

  async function handleExportPackage() {
    try {
      const id = await createExportJob("sag_sipec", "zip");
      onToast(`Paquete SAG/SIPEC registrado: ${id.slice(0, 8)}`);
    } catch (error) {
      onToast(error instanceof Error ? error.message : "No se pudo registrar respaldo");
    }
  }

  return (
    <>
      <div className="compliance-dashboard">
        <section className="card compliance-score">
          <span className="pill">Chile / SAG</span>
          <strong>86%</strong>
          <h2>Preparacion documental</h2>
          <p>Perfil, FRADA, SIPEC, tratamientos, bioseguridad y reportes en un solo flujo.</p>
          <button className="primary-button" onClick={() => void handleExportPackage()} type="button">Exportar paquete SAG</button>
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
