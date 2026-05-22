import type { ViewId } from "@/lib/types";

interface FieldHubProps {
  onNavigate: (view: ViewId) => void;
  onToast: (message: string) => void;
}

export function FieldHub({ onNavigate, onToast }: FieldHubProps) {
  return (
    <>
      <div className="hero-strip">
        <div>
          <span className="pill">Offline-first</span>
          <h2>Registra una inspeccion en terreno sin pelear con el telefono.</h2>
          <p>Escanea la colmena, dicta observaciones, completa checklist sanitario y guarda acciones de seguimiento.</p>
        </div>
        <div className="quick-actions">
          <button className="primary-button" onClick={() => onToast("Nota de voz convertida en checklist")} type="button">Grabar nota de voz</button>
          <button className="ghost-button" onClick={() => onToast("QR/NFC detectado: Colmena MZ-024")} type="button">Escanear QR/NFC</button>
        </div>
      </div>
      <div className="module-grid">
        {[
          ["Inspeccion rapida", "Reina, cria, reservas, temperamento, varroa, salud y acciones.", "inspections"],
          ["QR/NFC de colmena", "Abre el historial exacto de la colmena antes de registrar.", "hives"],
          ["Apiarios y colmenas", "Mapa, ubicacion, historial y estructura de cada apiario.", "apiaries"],
          ["Tratamientos", "Medicamento, principio activo, dosis, lote, aplicacion y retiro.", "treatments"],
          ["Bioseguridad", "Limpieza, renovacion de cera, material externo y mortalidad.", "biosecurity"]
        ].map(([title, copy, target]) => (
          <article className="module-card action-card" key={title}>
            <span className="tag ok">Abrir</span>
            <h2>{title}</h2>
            <p>{copy}</p>
            <button className="ghost-button" onClick={() => onNavigate(target as ViewId)} type="button">Entrar</button>
          </article>
        ))}
        <article className="module-card">
          <strong>24h</strong>
          <h2>Clima y floracion</h2>
          <p>Ventana favorable para inspeccion: templado, viento bajo, floracion media.</p>
        </article>
      </div>
    </>
  );
}
