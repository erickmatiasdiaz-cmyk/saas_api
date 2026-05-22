"use client";

import { useEffect, useMemo, useState } from "react";
import { getCurrentSession } from "@/lib/auth";
import { getInspectionFormData, saveInspection } from "@/lib/supabase-data";
import type { InspectionFormApiary, InspectionFormHive } from "@/lib/supabase-data";

interface InspectionViewProps {
  onToast: (message: string) => void;
}

export function InspectionView({ onToast }: InspectionViewProps) {
  const [apiaries, setApiaries] = useState<InspectionFormApiary[]>([]);
  const [hives, setHives] = useState<InspectionFormHive[]>([]);
  const [apiaryId, setApiaryId] = useState("");
  const [hiveId, setHiveId] = useState("");
  const [queenSeen, setQueenSeen] = useState(true);
  const [queenCells, setQueenCells] = useState(false);
  const [mediumReserves, setMediumReserves] = useState(true);
  const [checkVarroa, setCheckVarroa] = useState(true);
  const [notes, setNotes] = useState("Colmena fuerte, postura normal y reserva media. Revisar varroa en 7 dias.");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    getInspectionFormData().then(({ apiaries: apiaryRows, hives: hiveRows }) => {
      if (!mounted) return;
      setApiaries(apiaryRows);
      setHives(hiveRows);
      setApiaryId(apiaryRows[0]?.id ?? "");
      setHiveId(hiveRows.find((hive) => hive.apiary_id === apiaryRows[0]?.id)?.id ?? "");
    });
    return () => {
      mounted = false;
    };
  }, []);

  const filteredHives = useMemo(() => hives.filter((hive) => hive.apiary_id === apiaryId), [apiaryId, hives]);

  async function handleSave() {
    if (!apiaryId) {
      onToast("Selecciona un apiario antes de guardar");
      return;
    }

    setSaving(true);
    try {
      const session = await getCurrentSession();
      const inspectionId = await saveInspection({
        apiaryId,
        hiveId: hiveId || null,
        inspectedBy: session?.user.email ?? "Usuario terreno",
        queenSeen,
        queenCells,
        mediumReserves,
        checkVarroa,
        notes
      });
      onToast(`Inspeccion guardada en Supabase: ${inspectionId.slice(0, 8)}`);
    } catch (error) {
      onToast(error instanceof Error ? error.message : "No se pudo guardar inspeccion");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dashboard-grid">
      <section className="card">
        <div className="panel-header">
          <h2>Inspeccion rapida de colmena</h2>
          <span className="tag ok">Modo terreno</span>
        </div>
        <label>
          Apiario
          <select
            value={apiaryId}
            onChange={(event) => {
              const nextApiaryId = event.target.value;
              setApiaryId(nextApiaryId);
              setHiveId(hives.find((hive) => hive.apiary_id === nextApiaryId)?.id ?? "");
            }}
          >
            {apiaries.map((apiary) => <option key={apiary.id} value={apiary.id}>{apiary.name}</option>)}
          </select>
        </label>
        <label>
          Colmena
          <select value={hiveId} onChange={(event) => setHiveId(event.target.value)}>
            <option value="">Apiario completo</option>
            {filteredHives.map((hive) => <option key={hive.id} value={hive.id}>{hive.code}</option>)}
          </select>
        </label>
        {["Cria y reina", "Recursos y poblacion", "Salud y preocupaciones"].map((section) => (
          <div className="inspection-section" key={section}>
            <h3>{section}</h3>
            <div className="checklist-grid">
              <label><input checked={queenSeen} onChange={(event) => setQueenSeen(event.target.checked)} type="checkbox" /> Reina vista</label>
              <label><input checked={queenCells} onChange={(event) => setQueenCells(event.target.checked)} type="checkbox" /> Celdas reales</label>
              <label><input checked={mediumReserves} onChange={(event) => setMediumReserves(event.target.checked)} type="checkbox" /> Reservas medias</label>
              <label><input checked={checkVarroa} onChange={(event) => setCheckVarroa(event.target.checked)} type="checkbox" /> Revisar varroa</label>
            </div>
          </div>
        ))}
        <label>Notas<textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={5} /></label>
        <button className="primary-button" disabled={saving} onClick={() => void handleSave()} type="button">
          {saving ? "Guardando..." : "Guardar inspeccion"}
        </button>
      </section>
      <section className="card">
        <div className="panel-header"><h2>Acciones sugeridas</h2></div>
        <div className="compliance-list">
          <article><strong>Control varroa</strong><span className="tag watch">7 dias</span></article>
          <article><strong>Agregar alza</strong><span className="tag ok">Si aumenta flujo</span></article>
          <article><strong>Foto de postura</strong><span className="tag watch">Proxima visita</span></article>
        </div>
      </section>
    </div>
  );
}
