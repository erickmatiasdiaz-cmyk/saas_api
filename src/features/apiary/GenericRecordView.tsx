"use client";

import { useEffect, useState } from "react";
import {
  getRecordFormConfig,
  getRecordViewData,
  saveRecordForView,
  type RecordFormConfig,
  type RecordFormField,
  type RecordViewData
} from "@/lib/supabase-data";
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
  const [formConfig, setFormConfig] = useState<RecordFormConfig | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setConfig(loadingData);

    Promise.all([getRecordViewData(view), getRecordFormConfig(view)])
      .then(([data, nextFormConfig]) => {
        if (!mounted) return;
        setConfig(data);
        setFormConfig(nextFormConfig);
        setFormValues(nextFormConfig?.initialValues ?? {});
        setFeedback("");
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
  }, [view, refreshKey]);

  async function handleSubmit() {
    if (!formConfig) return;

    const missing = formConfig.fields.find((field) => field.required && !formValues[field.name]);
    if (missing) {
      setFeedback(`Falta completar: ${missing.label}`);
      return;
    }

    setSaving(true);
    setFeedback("");
    try {
      const id = await saveRecordForView(view, formValues);
      setFeedback(`Registro guardado en Supabase: ${id.slice(0, 8)}`);
      setFormOpen(false);
      setRefreshKey((key) => key + 1);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "No se pudo guardar el registro");
    } finally {
      setSaving(false);
    }
  }

  function updateValue(name: string, value: string) {
    setFormValues((current) => ({ ...current, [name]: value }));
  }

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

      {formConfig && (
        <section className={`card record-editor ${formOpen ? "open" : ""}`}>
          <div className="panel-header">
            <div>
              <span className="pill">Registro conectado</span>
              <h2>{formConfig.title}</h2>
              <p>Guarda nuevos datos en Supabase y actualiza esta pantalla al instante.</p>
            </div>
            <button className="primary-button" onClick={() => setFormOpen((open) => !open)} type="button">
              {formOpen ? "Cerrar formulario" : "Nuevo registro"}
            </button>
          </div>
          {feedback && <p className="inline-feedback">{feedback}</p>}
          {formOpen && (
            <>
              <div className="form-grid triple">
                {formConfig.fields.map((field) => (
                  <FormField field={field} key={field.name} onChange={updateValue} value={formValues[field.name] ?? ""} />
                ))}
              </div>
              <div className="modal-actions">
                <button className="ghost-button" onClick={() => setFormValues(formConfig.initialValues)} type="button">Limpiar</button>
                <button className="primary-button" disabled={saving} onClick={() => void handleSubmit()} type="button">
                  {saving ? "Guardando..." : formConfig.submitLabel}
                </button>
              </div>
            </>
          )}
        </section>
      )}

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

function FormField({ field, value, onChange }: { field: RecordFormField; value: string; onChange: (name: string, value: string) => void }) {
  if (field.type === "textarea") {
    return (
      <label className="form-field wide-field">
        {field.label}
        <textarea placeholder={field.placeholder} rows={4} value={value} onChange={(event) => onChange(field.name, event.target.value)} />
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <label className="form-field">
        {field.label}
        <select value={value} onChange={(event) => onChange(field.name, event.target.value)}>
          {(field.options ?? []).map((option) => <option key={option.value || option.label} value={option.value}>{option.label}</option>)}
        </select>
      </label>
    );
  }

  return (
    <label className="form-field">
      {field.label}
      <input
        min={field.type === "number" ? "0" : undefined}
        placeholder={field.placeholder}
        step={field.type === "number" ? "0.01" : undefined}
        type={field.type}
        value={value}
        onChange={(event) => onChange(field.name, event.target.value)}
      />
    </label>
  );
}
