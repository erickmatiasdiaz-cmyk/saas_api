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

export function LoginScreen({ company, onLogin, onToast }: LoginScreenProps) {
  const [email, setEmail] = useState(company.email);
  const [password, setPassword] = useState("demo2026");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit() {
    setLoading(true);
    setErrorMessage("");
    try {
      const session = mode === "signin"
        ? await signInWithEmail(email.trim(), password)
        : await signUpWithEmail(email.trim(), password);

      if (!session && mode === "signup") {
        onToast("Cuenta creada. Revisa tu correo si Supabase pide confirmacion.");
        setMode("signin");
        return;
      }

      onToast("Sesion iniciada con Supabase");
      onLogin();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo iniciar sesion";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }

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
          <p className="eyebrow">Acceso privado</p>
          <h2>Entrar al panel</h2>
        </div>
        <label>
          Correo
          <input autoComplete="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
        </label>
        <label>
          Clave
          <input autoComplete={mode === "signin" ? "current-password" : "new-password"} minLength={6} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
        </label>
        {errorMessage && <p className="auth-error">{errorMessage}</p>}
        <button className="primary-button" type="submit">
          {loading ? "Conectando..." : mode === "signin" ? "Ingresar con Supabase" : "Crear cuenta"}
        </button>
        <button className="ghost-button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")} type="button">
          {mode === "signin" ? "Crear usuario en Supabase" : "Ya tengo cuenta"}
        </button>
      </form>
    </section>
  );
}
