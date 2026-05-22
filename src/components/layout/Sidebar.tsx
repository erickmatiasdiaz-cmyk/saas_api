"use client";

import type { CSSProperties } from "react";
import { navItems } from "@/lib/mock-data";
import type { CompanyProfile, NavItem, ViewId } from "@/lib/types";

interface SidebarProps {
  activeView: ViewId;
  company: CompanyProfile;
  items?: NavItem[];
  onNavigate: (view: ViewId) => void;
  onPrepareProposal: () => void;
}

const brandIconLabel = {
  comb: "AG",
  hive: "HC",
  queen: "Q",
  leaf: "LV"
};

export function Sidebar({ activeView, company, items = navItems, onNavigate, onPrepareProposal }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="honeycomb-bg" aria-hidden="true" />
      <div className="brand">
        <span className={`brand-mark ${company.brandIcon}`} style={{ "--brand-accent": company.accentColor } as CSSProperties}>
          {company.shortName || brandIconLabel[company.brandIcon]}
        </span>
        <div>
          <strong>{company.productName}</strong>
          <small>{company.region}</small>
        </div>
      </div>

      <nav className="nav" aria-label="Modulos principales">
        {items.map((item) => (
          <button
            className={`nav-item ${activeView === item.id ? "active" : ""}`}
            key={item.id}
            onClick={() => onNavigate(item.id)}
            type="button"
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-card">
        <span className="pill">Piloto comercial</span>
        <p>Gestion sanitaria, cosecha, ventas y trazabilidad para productores apicolas.</p>
        <button className="sidebar-cta" onClick={onPrepareProposal} type="button">Preparar propuesta</button>
      </div>
    </aside>
  );
}
