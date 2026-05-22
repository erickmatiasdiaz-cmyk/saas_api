"use client";

import type { CSSProperties } from "react";
import type { CompanyProfile } from "@/lib/types";

interface LoginScreenProps {
  company: CompanyProfile;
  onLogin: () => void;
}

export function LoginScreen({ company, onLogin }: LoginScreenProps) {
  return (
    <section className="login-screen">
      <div className="login-art" aria-hidden="true">
        <div className="login-copy">
          <span className="pill">SaaS apicola</span>
          <h1>Gestiona tu apiario con trazabilidad profesional.</h1>
          <p>Inspecciones rapidas, QR/NFC, cosecha, ventas y respaldo SAG/SIPEC para productores chilenos.</p>
        </div>
      </div>

      <form
        className="login-card"
        onSubmit={(event) => {
          event.preventDefault();
          onLogin();
        }}
      >
        <div className="brand">
          <span className={`brand-mark ${company.brandIcon}`} style={{ "--brand-accent": company.accentColor } as CSSProperties}>
            {company.shortName}
          </span>
          <div>
            <strong>{company.productName}</strong>
            <small>{company.region}</small>
          </div>
        </div>
        <div>
          <p className="eyebrow">Acceso privado</p>
          <h2>Entrar al panel</h2>
        </div>
        <label>
          Correo
          <input defaultValue={company.email} type="email" />
        </label>
        <label>
          Clave
          <input defaultValue="demo2026" type="password" />
        </label>
        <button className="primary-button" type="submit">
          Ingresar al dashboard
        </button>
        <button className="ghost-button" onClick={onLogin} type="button">
          Usar acceso demo
        </button>
      </form>
    </section>
  );
}
