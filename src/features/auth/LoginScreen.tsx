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
        <div className="login-copy">
          <span className="pill">SaaS apicola</span>
          <h1>Gestiona tu apiario con trazabilidad profesional.</h1>
          <p>Inspecciones rapidas, QR/NFC, cosecha, ventas y respaldo SAG/SIPEC para productores chilenos.</p>
        </div>
      </div>

      <form
        className={`login-card ${isSignup ? "signup-card" : ""}`}
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
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
          <p className="eyebrow">{isSignup ? "Nueva cuenta" : "Acceso privado"}</p>
          <h2>{isSignup ? "Crear usuario" : "Entrar al panel"}</h2>
        </div>

        <label>
          Correo
          <input autoComplete="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
        </label>
        <label>
          Clave
          <input autoComplete={isSignup ? "new-password" : "current-password"} minLength={6} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
        </label>

        {isSignup && (
          <div className="signup-grid">
            <label>Nombre software<input value={profile.productName} onChange={(event) => update("productName", event.target.value)} /></label>
            <label>Sigla<input maxLength={3} value={profile.shortName} onChange={(event) => update("shortName", event.target.value.toUpperCase())} /></label>
            <label>Razon social<input required value={profile.companyName} onChange={(event) => update("companyName", event.target.value)} /></label>
            <label>RUT empresa<input required value={profile.taxId} onChange={(event) => update("taxId", event.target.value)} /></label>
            <label>Codigo SAG / FRADA<input value={profile.sagCode} onChange={(event) => update("sagCode", event.target.value)} /></label>
            <label>Giro comercial<input value={profile.businessLine} onChange={(event) => update("businessLine", event.target.value)} /></label>
            <label>Responsable<input required value={profile.ownerName} onChange={(event) => update("ownerName", event.target.value)} /></label>
            <label>Iniciales<input maxLength={3} value={profile.ownerInitials} onChange={(event) => update("ownerInitials", event.target.value.toUpperCase())} /></label>
            <label>Telefono<input value={profile.phone} onChange={(event) => update("phone", event.target.value)} /></label>
            <label>Sitio web<input value={profile.website} onChange={(event) => update("website", event.target.value)} /></label>
            <label>Direccion<input value={profile.address} onChange={(event) => update("address", event.target.value)} /></label>
            <label>Comuna<input required value={profile.commune} onChange={(event) => update("commune", event.target.value)} /></label>
            <label>Region<input required value={profile.region} onChange={(event) => update("region", event.target.value)} /></label>
            <label>Correo facturacion<input value={profile.billingEmail} onChange={(event) => update("billingEmail", event.target.value)} /></label>
            <label>Plan<select value={profile.plan} onChange={(event) => update("plan", event.target.value)}><option>Piloto comercial</option><option>Profesional</option><option>Cooperativa</option></select></label>
            <label>Icono marca<select value={profile.brandIcon} onChange={(event) => update("brandIcon", event.target.value as CompanyProfile["brandIcon"])}><option value="comb">Panal</option><option value="hive">Colmena</option><option value="queen">Reina</option><option value="leaf">Natural</option></select></label>
          </div>
        )}

        {errorMessage && <p className="auth-error">{errorMessage}</p>}
        <button className="primary-button" type="submit">
          {loading ? "Conectando..." : isSignup ? "Crear usuario" : "Acceder"}
        </button>
        <button className="ghost-button" onClick={() => setMode(isSignup ? "signin" : "signup")} type="button">
          {isSignup ? "Ya tengo cuenta" : "Crear usuario"}
        </button>
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
