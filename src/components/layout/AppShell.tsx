"use client";

import { useEffect, useMemo, useState } from "react";
import { FloatingActions } from "./FloatingActions";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { LoginScreen } from "@/features/auth/LoginScreen";
import { GenericRecordView } from "@/features/apiary/GenericRecordView";
import { ComplianceHub } from "@/features/compliance/ComplianceHub";
import { DashboardView } from "@/features/dashboard/DashboardView";
import { FieldHub } from "@/features/field/FieldHub";
import { InspectionView } from "@/features/field/InspectionView";
import { ProductionHub } from "@/features/production/ProductionHub";
import { SalesView } from "@/features/sales/SalesView";
import { SettingsView } from "@/features/settings/SettingsView";
import { getCurrentSession, onAuthChange, signOut } from "@/lib/auth";
import { navItems } from "@/lib/mock-data";
import { getCompanyProfile } from "@/lib/supabase-data";
import type { CompanyProfile, ViewId } from "@/lib/types";

const viewMeta: Record<ViewId, { title: string; eyebrow: string }> = {
  dashboard: { title: "Panel Apicola", eyebrow: "Temporada 2025/2026" },
  field: { title: "Campo", eyebrow: "Trabajo rapido en terreno" },
  production: { title: "Produccion", eyebrow: "Cosecha, trazabilidad e inventario" },
  sales: { title: "Ventas", eyebrow: "Comercializacion" },
  compliance: { title: "SAG / SIPEC", eyebrow: "Registros y respaldos" },
  settings: { title: "Configuracion", eyebrow: "Cuenta y parametros" },
  inspections: { title: "Inspecciones", eyebrow: "Checklist sanitario" },
  apiaries: { title: "Apiarios", eyebrow: "FRADA y ubicacion" },
  hives: { title: "Colmenas", eyebrow: "Inventario productivo" },
  treatments: { title: "Tratamientos", eyebrow: "Sanidad apicola" },
  biosecurity: { title: "Bioseguridad", eyebrow: "Control preventivo" },
  traceability: { title: "Trazabilidad", eyebrow: "Lotes con QR" },
  inventory: { title: "Inventario", eyebrow: "Insumos y bodega" },
  reports: { title: "Reportes", eyebrow: "PDF y Excel" },
  sipec: { title: "SIPEC Octubre", eyebrow: "Declaracion anual" },
  sagProfile: { title: "Perfil Apicultor SAG", eyebrow: "Datos FRADA" },
  priorities: { title: "Prioridades", eyebrow: "Roadmap operativo" }
};

const initialCompany: CompanyProfile = {
  productName: "ApiGestor",
  companyName: "Apicola del Valle",
  shortName: "AG",
  brandIcon: "comb",
  accentColor: "#e7a928",
  ownerName: "Maria Apicultora",
  ownerInitials: "MA",
  businessLine: "Produccion y comercializacion apicola",
  taxId: "76.543.210-9",
  sagCode: "FRADA-16-2026",
  email: "maria@apigestor.cl",
  phone: "+56 9 6123 4567",
  website: "www.apicoladelvalle.cl",
  address: "Camino El Manzano km 8",
  commune: "San Carlos",
  region: "Nuble",
  billingEmail: "facturacion@apicoladelvalle.cl",
  plan: "Piloto comercial"
};

export function AppShell() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeView, setActiveView] = useState<ViewId>("dashboard");
  const [company, setCompany] = useState<CompanyProfile>(initialCompany);
  const [moduleIcons, setModuleIcons] = useState<Record<string, string>>(
    () => Object.fromEntries(navItems.map((item) => [item.id, item.icon]))
  );
  const [toast, setToast] = useState("");
  const meta = viewMeta[activeView];
  const navigationItems = useMemo(
    () => navItems.map((item) => ({ ...item, icon: moduleIcons[item.id] || item.icon })),
    [moduleIcons]
  );

  useEffect(() => {
    let mounted = true;
    getCompanyProfile().then((profile) => {
      if (profile && mounted) setCompany(profile);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    getCurrentSession().then((session) => {
      if (mounted) setLoggedIn(Boolean(session));
    });
    const unsubscribe = onAuthChange((session) => setLoggedIn(Boolean(session)));
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const content = useMemo(() => {
    switch (activeView) {
      case "dashboard":
        return <DashboardView onToast={showToast} />;
      case "field":
        return <FieldHub onNavigate={setActiveView} onToast={showToast} />;
      case "production":
        return <ProductionHub onNavigate={setActiveView} onToast={showToast} />;
      case "sales":
        return <SalesView onToast={showToast} />;
      case "compliance":
        return <ComplianceHub onNavigate={setActiveView} onToast={showToast} />;
      case "settings":
        return <SettingsView company={company} moduleIcons={moduleIcons} onSave={setCompany} onSaveModuleIcons={setModuleIcons} onToast={showToast} />;
      case "inspections":
        return <InspectionView onToast={showToast} />;
      default:
        return <GenericRecordView view={activeView} />;
    }
  }, [activeView, company, moduleIcons]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }

  async function handleLogout() {
    try {
      await signOut();
      setLoggedIn(false);
      showToast("Sesion cerrada");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "No se pudo cerrar sesion");
    }
  }

  return (
    <>
      {!loggedIn && <LoginScreen company={company} onLogin={() => setLoggedIn(true)} onToast={showToast} />}
      <Sidebar activeView={activeView} company={company} items={navigationItems} onNavigate={setActiveView} onPrepareProposal={() => showToast("Propuesta piloto preparada")} />
      <main className="app-shell">
        <Topbar
          company={company}
          eyebrow={meta.eyebrow}
          onExport={() => showToast(`Exportando respaldo de ${meta.title}`)}
          onLogout={handleLogout}
          onNewInspection={() => setActiveView("inspections")}
          title={meta.title}
        />
        {content}
      </main>
      <FloatingActions onNavigate={setActiveView} onToast={showToast} />
      <div className={`toast ${toast ? "show" : ""}`}>{toast}</div>
    </>
  );
}
