import type { ViewId } from "@/lib/types";

interface FieldHubProps {
  onNavigate: (view: ViewId) => void;
}

export function FieldHub({ onNavigate }: FieldHubProps) {
  const actions: Array<{
    title: string;
    copy: string;
    detail: string;
    badge: string;
    cta: string;
    target: ViewId;
    visual: string;
    metric: string;
  }> = [
    {
      title: "Inspeccion rapida",
      copy: "Checklist tecnico para reina, cria, reservas, temperamento, varroa y acciones de seguimiento.",
      detail: "Guarda evidencia sanitaria y deja proxima visita agendada.",
      badge: "Campo",
      cta: "Registrar",
      target: "inspections",
      visual: "inspection",
      metric: "5 min"
    },
    {
      title: "QR/NFC de colmena",
      copy: "Consulta el historial exacto de una colmena antes de intervenirla en terreno.",
      detail: "Ideal para equipos con varias zonas productivas.",
      badge: "Historial",
      cta: "Ver historial",
      target: "hives",
      visual: "qr",
      metric: "1 escaneo"
    },
    {
      title: "Apiarios y colmenas",
      copy: "Mapa, coordenadas, actividad apicola, conteo de colmenas y estado general.",
      detail: "Base para FRADA, planificacion de rutas y declaracion SIPEC.",
      badge: "Operacion",
      cta: "Gestionar",
      target: "apiaries",
      visual: "apiaries",
      metric: "GPS"
    },
    {
      title: "Tratamientos",
      copy: "Registra medicamento, principio activo, dosis, lote, aplicacion y periodo de retiro.",
      detail: "Trazabilidad sanitaria lista para respaldo y auditoria.",
      badge: "Sanidad",
      cta: "Gestionar",
      target: "treatments",
      visual: "treatments",
      metric: "Lote"
    },
    {
      title: "Bioseguridad",
      copy: "Controla limpieza, material externo, renovacion de cera, mortalidad y causa probable.",
      detail: "Reduce riesgo sanitario y ordena acciones preventivas.",
      badge: "Riesgo",
      cta: "Revisar",
      target: "biosecurity",
      visual: "biosecurity",
      metric: "Alertas"
    }
  ];

  return (
    <>
      <div className="hero-strip">
        <div>
          <span className="pill">Offline-first</span>
          <h2>Registra una inspeccion en terreno sin pelear con el telefono.</h2>
          <p>Escanea la colmena, dicta observaciones, completa checklist sanitario y guarda acciones de seguimiento.</p>
        </div>
        <div className="quick-actions">
          <button className="primary-button" onClick={() => onNavigate("inspections")} type="button">Nueva inspeccion</button>
          <button className="ghost-button" onClick={() => onNavigate("hives")} type="button">Abrir colmenas</button>
        </div>
      </div>
      <div className="module-grid">
        {actions.map(({ title, copy, detail, badge, cta, target, visual, metric }) => (
          <article className="module-card action-card field-feature-card" key={title}>
            <div className={`field-card-visual ${visual}`}>
              <span>{metric}</span>
            </div>
            <div className="field-card-copy">
              <span className="tag ok">{badge}</span>
              <h2>{title}</h2>
              <p>{copy}</p>
              <small>{detail}</small>
            </div>
            <button className="ghost-button" onClick={() => onNavigate(target)} type="button">{cta}</button>
          </article>
        ))}
        <article className="module-card field-feature-card weather-card">
          <div className="field-card-visual weather">
            <span>24h</span>
          </div>
          <div className="field-card-copy">
            <span className="tag watch">Clima</span>
            <h2>Clima y floracion</h2>
            <p>Ventana favorable para inspeccion: templado, viento bajo y floracion media.</p>
            <small>Planifica visitas evitando lluvia, viento alto o baja temperatura.</small>
          </div>
        </article>
      </div>
    </>
  );
}
