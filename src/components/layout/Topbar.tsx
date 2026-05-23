import type { CompanyProfile } from "@/lib/types";

interface TopbarProps {
  company: CompanyProfile;
  eyebrow: string;
  title: string;
  onLogout: () => void;
}

export function Topbar({ company, eyebrow, title, onLogout }: TopbarProps) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      <div className="profile">
        <span className="notification">3</span>
        <span className="avatar">{company.ownerInitials}</span>
        <div>
          <strong>{company.ownerName}</strong>
          <small>{company.companyName}</small>
        </div>
        <button className="logout-button mobile-logout" onClick={onLogout} type="button">Salir</button>
      </div>
    </header>
  );
}
