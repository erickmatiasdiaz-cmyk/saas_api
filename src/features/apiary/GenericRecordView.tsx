"use client";

import { useEffect, useState } from "react";
import { getRecordViewData, type RecordViewData } from "@/lib/supabase-data";
import type { ViewId } from "@/lib/types";

interface GenericRecordViewProps {
  view: ViewId;
}

const loadingData: RecordViewData = {
  title: "Cargando registros",
  source: "Supabase",
  cards: [["...", "Consultando", "Base de datos"]],
  headers: ["Estado"],
  rows: [["Sincronizando datos reales desde Supabase"]]
};

const errorData: RecordViewData = {
  title: "No se pudo consultar",
  source: "Supabase",
  cards: [["!", "Error", "Revisa Supabase"]],
  headers: ["Detalle"],
  rows: [["La vista no pudo leer la informacion de la base de datos"]]
};

export function GenericRecordView({ view }: GenericRecordViewProps) {
  const [config, setConfig] = useState<RecordViewData>(loadingData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setConfig(loadingData);

    getRecordViewData(view)
      .then((data) => {
        if (mounted) setConfig(data);
      })
      .catch(() => {
        if (mounted) setConfig(errorData);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [view]);

  return (
    <>
      <div className="module-grid">
        {config.cards.map(([value, label, detail]) => (
          <article className="module-card" key={`${value}-${label}`}>
            <strong>{value}</strong>
            <h2>{label}</h2>
            <p>{detail}</p>
          </article>
        ))}
      </div>
      <section className="card">
        <div className="panel-header">
          <div>
            <h2>{config.title}</h2>
            <p>{loading ? "Leyendo registros en vivo." : "Informacion cargada desde el origen indicado."}</p>
          </div>
          <span className={`tag ${config.source === "Supabase" ? "ok" : "watch"}`}>
            {loading ? "Consultando Supabase" : `Datos ${config.source}`}
          </span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>{config.headers.map((header) => <th key={header}>{header}</th>)}</tr>
            </thead>
            <tbody>
              {config.rows.length ? (
                config.rows.map((row) => (
                  <tr key={row.join("-")}>{row.map((cell, index) => <td key={`${cell}-${index}`}>{cell || "Sin dato"}</td>)}</tr>
                ))
              ) : (
                <tr>
                  <td colSpan={config.headers.length}>No hay registros guardados todavia.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
