"use client";

import { useEffect, useState } from "react";
import {
  deleteRecordForView,
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
  rows: [{ id: "loading", cells: ["Sincronizando datos reales desde Supabase"] }]
};

const errorData: RecordViewData = {
  title: "No se pudo consultar",
  source: "Supabase",
  cards: [["!", "Error", "Revisa Supabase"]],
  headers: ["Detalle"],
  rows: [{ id: "error", cells: ["La vista no pudo leer la informacion de la base de datos"] }]
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
  const [editingId, setEditingId] = useState<string | null>(null);

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
        setEditingId(null);
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
      const id = await saveRecordForView(view, formValues, editingId);
      setFeedback(`${editingId ? "Registro actualizado" : "Registro guardado"} en Supabase: ${id.slice(0, 8)}`);
      setFormOpen(false);
      setEditingId(null);
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

  function startEdit(rowId: string) {
    const row = config.rows.find((item) => item.id === rowId);
    if (!row?.values || !formConfig) return;
    setEditingId(rowId);
    setFormValues({ ...formConfig.initialValues, ...row.values });
    setFormOpen(true);
    setFeedback(`Editando registro ${rowId.slice(0, 8)}`);
  }

  async function handleDelete(rowId: string) {
    const confirmed = window.confirm("¿Seguro que quieres eliminar o archivar este registro?");
    if (!confirmed) return;

    setSaving(true);
    try {
      await deleteRecordForView(view, rowId);
      setFeedback(`Registro eliminado/archivado: ${rowId.slice(0, 8)}`);
      setRefreshKey((key) => key + 1);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "No se pudo eliminar el registro");
    } finally {
      setSaving(false);
    }
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
              <h2>{editingId ? `Editar ${formConfig.title.toLowerCase()}` : formConfig.title}</h2>
              <p>Guarda nuevos datos en Supabase y actualiza esta pantalla al instante.</p>
            </div>
            <button className="primary-button" onClick={() => {
              setEditingId(null);
              setFormValues(formConfig.initialValues);
              setFormOpen((open) => !open);
            }} type="button">
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
                <button className="ghost-button" onClick={() => {
                  setEditingId(null);
                  setFormValues(formConfig.initialValues);
                }} type="button">Limpiar</button>
                <button className="primary-button" disabled={saving} onClick={() => void handleSubmit()} type="button">
                  {saving ? "Guardando..." : editingId ? "Guardar cambios" : formConfig.submitLabel}
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
              <tr>
                {config.headers.map((header) => <th key={header}>{header}</th>)}
                {config.rows.some((row) => row.editable || row.deletable) && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {config.rows.length ? (
                config.rows.map((row) => (
                  <tr key={row.id}>
                    {row.cells.map((cell, index) => <td key={`${row.id}-${index}`}>{cell || "Sin dato"}</td>)}
                    {(row.editable || row.deletable) && (
                      <td>
                        <div className="row-actions">
                          {row.editable && <button className="text-button" onClick={() => startEdit(row.id)} type="button">Editar</button>}
                          {row.deletable && <button className="text-button danger" disabled={saving} onClick={() => void handleDelete(row.id)} type="button">Eliminar</button>}
                        </div>
                      </td>
                    )}
                  </tr>
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
