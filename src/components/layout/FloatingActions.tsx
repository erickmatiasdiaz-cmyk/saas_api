import type { ViewId } from "@/lib/types";

interface FloatingActionsProps {
  onNavigate: (view: ViewId) => void;
  onToast: (message: string) => void;
}

export function FloatingActions({ onNavigate, onToast }: FloatingActionsProps) {
  return (
    <div className="floating-actions">
      <button onClick={() => onNavigate("inspections")} type="button">Inspeccion</button>
      <button
        onClick={() => {
          onNavigate("inspections");
          onToast("Nota de voz demo: checklist sanitario completado");
        }}
        type="button"
      >
        Voz
      </button>
      <button
        onClick={() => {
          onNavigate("hives");
          onToast("QR/NFC detectado: Colmena MZ-024");
        }}
        type="button"
      >
        QR
      </button>
    </div>
  );
}
