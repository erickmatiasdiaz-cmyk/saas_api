"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import { signInWithEmail, signUpWithEmail } from "@/lib/auth";
import type { CompanyProfile } from "@/lib/types";

interface LoginScreenProps {
  company: CompanyProfile;
  onLogin: () => void;
  onToast: (message: string) => void;
}

const emptyCompany: CompanyProfile = {
  productName: "ApiGestor",
  companyName: "",
  shortName: "AG",
  brandIcon: "comb",
  accentColor: "#e7a928",
  ownerName: "",
  ownerInitials: "",
  businessLine: "",
  taxId: "",
  sagCode: "",
  email: "",
  phone: "",
  website: "",
  address: "",
  commune: "",
  region: "",
  billingEmail: "",
  plan: "Piloto comercial"
};

export function LoginScreen({ company, onLogin, onToast }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [profile, setProfile] = useState<CompanyProfile>(emptyCompany);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function update<K extends keyof CompanyProfile>(key: K, value: CompanyProfile[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit() {
    setLoading(true);
    setErrorMessage("");
    try {
      const signupProfile = {
        ...profile,
        email,
        billingEmail: profile.billingEmail || email,
        ownerInitials: profile.ownerInitials || initials(profile.ownerName),
        shortName: profile.shortName || initials(profile.companyName)
      };
      const session = mode === "signin"
        ? await signInWithEmail(email.trim(), password)
        : await signUpWithEmail(email.trim(), password, signupProfile);

      if (!session && mode === "signup") {
        onToast("Cuenta creada. Revisa tu correo si Supabase pide confirmacion.");
        setMode("signin");
        return;
      }

      onToast(mode === "signin" ? "Sesion iniciada" : "Usuario y empresa creados");
      onLogin();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo iniciar sesion";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }

  const isSignup = mode === "signup";

  return (
    <section className="login-screen">
      <div className="login-art" aria-hidden="true">
        <div className="login-bee">
          <span className="bee-wing left" />
          <span className="bee-wing right" />
          <span className="bee-body" />
        </div>
        <div className="login-copy">
          <span className="pill">SaaS apicola</span>
          <h1>Gestiona tu apiario con trazabilidad profesional.</h1>
          <p>Inspecciones rapidas, QR/NFC, cosecha, ventas y respaldo SAG/SIPEC para productores chilenos.</p>
          <div className="login-proof">
            <span>Respaldo sanitario</span>
            <span>Operacion trazable</span>
            <span>Control comercial</span>
          </div>
        </div>
      </div>

      <form
        className={`login-card ${isSignup ? "signup-card" : ""}`}
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <div className="login-card-head">
          <div className="brand login-brand-lockup">
            <span className={`brand-mark ${company.brandIcon}`} style={{ "--brand-accent": company.accentColor } as CSSProperties}>
              {company.shortName}
            </span>
            <div>
              <strong>{company.productName}</strong>
              <small>Gestion apicola</small>
            </div>
          </div>
          <span className="login-secure-badge">Acceso seguro</span>
        </div>
        <div className="login-heading">
          <p className="eyebrow">{isSignup ? "Onboarding apicola" : "Acceso privado"}</p>
          <h2>{isSignup ? "Crear cuenta empresa" : "Entrar al panel"}</h2>
          <p>{isSignup ? "Completa los datos base de tu operacion para dejar el sistema listo desde el primer ingreso." : "Administra campo, cosecha, ventas y cumplimiento desde una sola cuenta."}</p>
        </div>

        <label className="premium-field">
          Correo
          <input autoComplete="email" onChange={(event) => setEmail(event.target.value)} placeholder="correo@tuempresa.cl" required type="email" value={email} />
        </label>
        <label className="premium-field">
          Clave
          <input autoComplete={isSignup ? "new-password" : "current-password"} minLength={6} onChange={(event) => setPassword(event.target.value)} placeholder={isSignup ? "Crea una clave de minimo 6 caracteres" : "Ingresa tu clave"} required type="password" value={password} />
        </label>

        {isSignup && (
          <div className="signup-grid">
            <label>Nombre software<input placeholder="ApiGestor" value={profile.productName} onChange={(event) => update("productName", event.target.value)} /></label>
            <label>Sigla<input maxLength={3} placeholder="AG" value={profile.shortName} onChange={(event) => update("shortName", event.target.value.toUpperCase())} /></label>
            <label>Razon social<input placeholder="Apicola del Valle SpA" required value={profile.companyName} onChange={(event) => update("companyName", event.target.value)} /></label>
            <label>RUT empresa<input placeholder="76.543.210-9" required value={profile.taxId} onChange={(event) => update("taxId", event.target.value)} /></label>
            <label>Codigo SAG / FRADA<input placeholder="FRADA-16-2026" value={profile.sagCode} onChange={(event) => update("sagCode", event.target.value)} /></label>
            <label>Giro comercial<input placeholder="Produccion y venta de miel" value={profile.businessLine} onChange={(event) => update("businessLine", event.target.value)} /></label>
            <label>Responsable<input placeholder="Maria Apicultora" required value={profile.ownerName} onChange={(event) => update("ownerName", event.target.value)} /></label>
            <label>Iniciales<input maxLength={3} placeholder="MA" value={profile.ownerInitials} onChange={(event) => update("ownerInitials", event.target.value.toUpperCase())} /></label>
            <label>Telefono<input placeholder="+56 9 6123 4567" value={profile.phone} onChange={(event) => update("phone", event.target.value)} /></label>
            <label>Sitio web<input placeholder="www.apicoladelvalle.cl" value={profile.website} onChange={(event) => update("website", event.target.value)} /></label>
            <label>Direccion<input placeholder="Camino El Manzano km 8" value={profile.address} onChange={(event) => update("address", event.target.value)} /></label>
            <label>Comuna<input placeholder="San Carlos" required value={profile.commune} onChange={(event) => update("commune", event.target.value)} /></label>
            <label>Region<input placeholder="Nuble" required value={profile.region} onChange={(event) => update("region", event.target.value)} /></label>
            <label>Correo facturacion<input placeholder="facturacion@apicoladelvalle.cl" value={profile.billingEmail} onChange={(event) => update("billingEmail", event.target.value)} /></label>
            <label>Plan<select value={profile.plan} onChange={(event) => update("plan", event.target.value)}><option>Piloto comercial</option><option>Profesional</option><option>Cooperativa</option></select></label>
            <label>Icono marca<select value={profile.brandIcon} onChange={(event) => update("brandIcon", event.target.value as CompanyProfile["brandIcon"])}><option value="comb">Panal</option><option value="hive">Colmena</option><option value="queen">Reina</option><option value="leaf">Natural</option></select></label>
          </div>
        )}

        {errorMessage && <p className="auth-error">{errorMessage}</p>}
        <button className="primary-button login-submit" type="submit">
          {loading ? "Conectando..." : isSignup ? "Crear usuario" : "Acceder"}
        </button>
        <button className="ghost-button login-secondary" onClick={() => setMode(isSignup ? "signin" : "signup")} type="button">
          {isSignup ? "Ya tengo cuenta" : "Crear usuario"}
        </button>
        <p className="login-note">Acceso reservado para empresas y equipos autorizados.</p>
      </form>
    </section>
  );
}

function initials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "AG";
}
