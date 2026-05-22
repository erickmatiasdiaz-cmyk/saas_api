import type { CompanyProfile } from "@/lib/types";

interface TopbarProps {
  company: CompanyProfile;
  eyebrow: string;
  onExport: () => void;
  title: string;
  onNewInspection: () => void;
  onLogout: () => void;
}

export function Topbar({ company, eyebrow, onExport, onNewInspection, title, onLogout }: TopbarProps) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      <div className="profile">
        <button className="ghost-button" onClick={onExport} type="button">Exportar</button>
        <button className="primary-button" onClick={onNewInspection} type="button">Nueva inspeccion</button>
        <span className="notification">3</span>
        <span className="avatar">{company.ownerInitials}</span>
        <div>
          <strong>{company.ownerName}</strong>
          <small>{company.companyName}</small>
        </div>
        <button className="logout-button" onClick={onLogout} type="button">Salir</button>
      </div>
    </header>
  );
}
