"use client";

import { BadgeCheck, Building2, Crown, Hexagon, Leaf, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import type { CSSProperties } from "react";
import type { BrandIcon, CompanyProfile } from "@/lib/types";
import { navItems } from "@/lib/mock-data";
import { saveCompanyProfile } from "@/lib/supabase-data";

interface SettingsViewProps {
  company: CompanyProfile;
  moduleIcons: Record<string, string>;
  onSave: (company: CompanyProfile) => void;
  onSaveModuleIcons: (icons: Record<string, string>) => void;
  onToast: (message: string) => void;
}

const iconOptions: Array<{ id: BrandIcon; label: string; description: string; Icon: typeof Hexagon }> = [
  { id: "comb", label: "Panal", description: "Marca tecnica y apicola", Icon: Hexagon },
  { id: "hive", label: "Colmena", description: "Productor y terreno", Icon: Building2 },
  { id: "queen", label: "Reina", description: "Premium y seleccion", Icon: Crown },
  { id: "leaf", label: "Natural", description: "Organico y sustentable", Icon: Leaf }
];

const accentOptions = ["#e7a928", "#2b8a58", "#3c83b6", "#d75a45", "#7b5c2e"];

const moduleDetails: Record<string, string> = {
  dashboard: "Resumen ejecutivo",
  field: "Inspecciones y apiarios",
  production: "Cosecha, lotes e inventario",
  sales: "Clientes y cotizaciones",
  compliance: "Registros oficiales",
  settings: "Administracion"
};

export function SettingsView({ company, moduleIcons, onSave, onSaveModuleIcons, onToast }: SettingsViewProps) {
  const [draft, setDraft] = useState<CompanyProfile>(company);
  const [iconDraft, setIconDraft] = useState<Record<string, string>>(moduleIcons);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof CompanyProfile>(key: K, value: CompanyProfile[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function saveSettings() {
    setSaving(true);
    try {
      await saveCompanyProfile(draft, iconDraft);
      onSave(draft);
      onSaveModuleIcons(iconDraft);
      onToast("Cuenta empresa guardada en Supabase");
    } catch (error) {
      onToast(error instanceof Error ? error.message : "No se pudo guardar configuracion");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="settings-workspace">
      <section className="settings-hero">
        <div>
          <span className="pill">Centro de administracion</span>
          <h2>Marca, cuenta empresa y parametros comerciales.</h2>
          <p>Configura como se presenta el SaaS al cliente final: identidad visual, datos tributarios, cuenta SAG, usuarios y preferencias de operacion.</p>
        </div>
        <div className="brand-preview">
          <span className={`brand-mark ${draft.brandIcon}`} style={{ "--brand-accent": draft.accentColor } as CSSProperties}>
            {draft.shortName}
          </span>
          <div>
            <strong>{draft.productName}</strong>
            <small>{draft.companyName}</small>
          </div>
        </div>
      </section>

      <div className="settings-layout enhanced">
        <section className="card settings-card wide">
          <div className="panel-header">
            <div>
              <h2>Identidad visual</h2>
              <p>Nombre, icono, color principal y apariencia del producto.</p>
            </div>
            <span className="tag ok">Editable</span>
          </div>

          <div className="brand-editor">
            <label>
              Nombre del software
              <input value={draft.productName} onChange={(event) => update("productName", event.target.value)} />
            </label>
            <label>
              Sigla del logo
              <input maxLength={3} value={draft.shortName} onChange={(event) => update("shortName", event.target.value.toUpperCase())} />
            </label>
          </div>

          <div className="icon-picker" aria-label="Selector de icono de marca">
            {iconOptions.map(({ id, label, description, Icon }) => (
              <button className={draft.brandIcon === id ? "selected" : ""} key={id} onClick={() => update("brandIcon", id)} type="button">
                <Icon size={22} />
                <strong>{label}</strong>
                <small>{description}</small>
              </button>
            ))}
          </div>

          <div className="color-row" aria-label="Color principal">
            {accentOptions.map((color) => (
              <button
                aria-label={`Usar color ${color}`}
                className={draft.accentColor === color ? "active" : ""}
                key={color}
                onClick={() => update("accentColor", color)}
                style={{ background: color }}
                type="button"
              />
            ))}
          </div>
        </section>

        <section className="card settings-card">
          <div className="panel-header">
            <h2>Iconos de modulos</h2>
            <Sparkles size={20} />
          </div>
          <div className="module-icon-list">
            {navItems.map((item) => (
              <article key={item.id}>
                <span>{iconDraft[item.id] || item.icon}</span>
                <div>
                  <strong>{item.label}</strong>
                  <small>{moduleDetails[item.id]}</small>
                </div>
                <input
                  aria-label={`Icono ${item.label}`}
                  maxLength={2}
                  value={iconDraft[item.id] || ""}
                  onChange={(event) => setIconDraft((current) => ({ ...current, [item.id]: event.target.value.toUpperCase() }))}
                />
              </article>
            ))}
          </div>
        </section>

        <section className="card settings-card">
          <div className="panel-header">
            <h2>Seguridad</h2>
            <ShieldCheck size={20} />
          </div>
          <div className="toggle-list">
            <label><input defaultChecked type="checkbox" /> Autenticacion en dos pasos</label>
            <label><input defaultChecked type="checkbox" /> Backup automatico diario</label>
            <label><input defaultChecked type="checkbox" /> Registro de cambios por usuario</label>
            <label><input type="checkbox" /> Acceso invitado para contador</label>
          </div>
        </section>
      </div>

      <div className="settings-layout account">
        <section className="card settings-card wide">
          <div className="panel-header">
            <div>
              <h2>Cuenta de la empresa</h2>
              <p>Datos comerciales visibles en reportes, PDF, Excel y fichas de trazabilidad.</p>
            </div>
            <BadgeCheck size={20} />
          </div>
          <div className="form-grid triple">
            <label>Razon social<input value={draft.companyName} onChange={(event) => update("companyName", event.target.value)} /></label>
            <label>RUT empresa<input value={draft.taxId} onChange={(event) => update("taxId", event.target.value)} /></label>
            <label>Codigo SAG / FRADA<input value={draft.sagCode} onChange={(event) => update("sagCode", event.target.value)} /></label>
            <label>Responsable<input value={draft.ownerName} onChange={(event) => update("ownerName", event.target.value)} /></label>
            <label>Iniciales usuario<input maxLength={3} value={draft.ownerInitials} onChange={(event) => update("ownerInitials", event.target.value.toUpperCase())} /></label>
            <label>Giro comercial<input value={draft.businessLine} onChange={(event) => update("businessLine", event.target.value)} /></label>
            <label>Correo principal<input value={draft.email} onChange={(event) => update("email", event.target.value)} /></label>
            <label>Telefono<input value={draft.phone} onChange={(event) => update("phone", event.target.value)} /></label>
            <label>Sitio web<input value={draft.website} onChange={(event) => update("website", event.target.value)} /></label>
            <label>Direccion<input value={draft.address} onChange={(event) => update("address", event.target.value)} /></label>
            <label>Comuna<input value={draft.commune} onChange={(event) => update("commune", event.target.value)} /></label>
            <label>Region<input value={draft.region} onChange={(event) => update("region", event.target.value)} /></label>
          </div>
        </section>

        <section className="card settings-card">
          <div className="panel-header"><h2>Plan y facturacion</h2></div>
          <div className="form-grid single">
            <label>Plan activo<select value={draft.plan} onChange={(event) => update("plan", event.target.value)}><option>Piloto comercial</option><option>Profesional</option><option>Cooperativa</option></select></label>
            <label>Correo facturacion<input value={draft.billingEmail} onChange={(event) => update("billingEmail", event.target.value)} /></label>
            <label>Moneda<select defaultValue="CLP"><option>CLP</option><option>USD</option></select></label>
            <label>Formato documentos<select defaultValue="pdf-excel"><option value="pdf-excel">PDF y Excel</option><option value="excel">Solo Excel</option><option value="pdf">Solo PDF</option></select></label>
          </div>
        </section>
      </div>

      <section className="card settings-card">
        <div className="panel-header">
          <div>
            <h2>Operacion del sistema</h2>
            <p>Parametros por defecto para temporada, terreno y recordatorios.</p>
          </div>
          <button className="primary-button" disabled={saving} onClick={() => void saveSettings()} type="button">
            {saving ? "Guardando..." : "Guardar configuracion"}
          </button>
        </div>
        <div className="form-grid triple">
          <label>Temporada activa<input defaultValue="2025/2026" /></label>
          <label>Zona horaria<select defaultValue="america-santiago"><option value="america-santiago">America/Santiago</option></select></label>
          <label>Unidad de cosecha<select defaultValue="kg"><option value="kg">Kilogramos</option><option value="lb">Libras</option></select></label>
          <label>Modo terreno<select defaultValue="offline"><option value="offline">Offline-first</option><option value="online">Online obligatorio</option></select></label>
          <label>Retencion de respaldos<select defaultValue="5"><option value="5">5 temporadas</option><option value="10">10 temporadas</option></select></label>
          <label>Canal avisos<select defaultValue="email-whatsapp"><option value="email-whatsapp">Email y WhatsApp</option><option value="email">Solo email</option></select></label>
        </div>
      </section>
    </div>
  );
}
