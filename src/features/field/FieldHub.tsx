"use client";

import { useEffect, useMemo, useState } from "react";
import type { ViewId } from "@/lib/types";

interface FieldHubProps {
  onNavigate: (view: ViewId) => void;
}

export function FieldHub({ onNavigate }: FieldHubProps) {
  const [weather, setWeather] = useState<WeatherState>({
    status: "loading",
    location: "Nuble / San Carlos",
    source: "Open-Meteo",
    temperature: null,
    apparent: null,
    humidity: null,
    wind: null,
    gusts: null,
    rain: null,
    code: null,
    updatedAt: ""
  });

  const actions: Array<{
    title: string;
    copy: string;
    detail: string;
    badge: string;
    cta: string;
    target: ViewId;
    visual: string;
    metric: string;
  }> = [
    {
      title: "Inspeccion rapida",
      copy: "Checklist tecnico para reina, cria, reservas, temperamento, varroa y acciones de seguimiento.",
      detail: "Guarda evidencia sanitaria y deja proxima visita agendada.",
      badge: "Campo",
      cta: "Registrar",
      target: "inspections",
      visual: "inspection",
      metric: "5 min"
    },
    {
      title: "QR/NFC de colmena",
      copy: "Consulta el historial exacto de una colmena antes de intervenirla en terreno.",
      detail: "Ideal para equipos con varias zonas productivas.",
      badge: "Historial",
      cta: "Ver historial",
      target: "hives",
      visual: "qr",
      metric: "1 escaneo"
    },
    {
      title: "Apiarios y colmenas",
      copy: "Mapa, coordenadas, actividad apicola, conteo de colmenas y estado general.",
      detail: "Base para FRADA, planificacion de rutas y declaracion SIPEC.",
      badge: "Operacion",
      cta: "Gestionar",
      target: "apiaries",
      visual: "apiaries",
      metric: "GPS"
    },
    {
      title: "Tratamientos",
      copy: "Registra medicamento, principio activo, dosis, lote, aplicacion y periodo de retiro.",
      detail: "Trazabilidad sanitaria lista para respaldo y auditoria.",
      badge: "Sanidad",
      cta: "Gestionar",
      target: "treatments",
      visual: "treatments",
      metric: "Lote"
    },
    {
      title: "Bioseguridad",
      copy: "Controla limpieza, material externo, renovacion de cera, mortalidad y causa probable.",
      detail: "Reduce riesgo sanitario y ordena acciones preventivas.",
      badge: "Riesgo",
      cta: "Revisar",
      target: "biosecurity",
      visual: "biosecurity",
      metric: "Alertas"
    }
  ];
  const weatherAdvice = useMemo(() => getInspectionAdvice(weather), [weather]);

  useEffect(() => {
    let mounted = true;

    async function loadWeather(latitude: number, longitude: number, location: string) {
      try {
        const url = new URL("https://api.open-meteo.com/v1/forecast");
        url.searchParams.set("latitude", String(latitude));
        url.searchParams.set("longitude", String(longitude));
        url.searchParams.set("timezone", "auto");
        url.searchParams.set("current", "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_gusts_10m");

        const response = await fetch(url.toString());
        if (!response.ok) throw new Error("No se pudo consultar clima");
        const data = await response.json() as OpenMeteoResponse;
        const current = data.current;

        if (!mounted || !current) return;
        setWeather({
          status: "ready",
          location,
          source: "Open-Meteo",
          temperature: current.temperature_2m,
          apparent: current.apparent_temperature,
          humidity: current.relative_humidity_2m,
          wind: current.wind_speed_10m,
          gusts: current.wind_gusts_10m,
          rain: current.precipitation,
          code: current.weather_code,
          updatedAt: current.time
        });
      } catch {
        if (mounted) {
          setWeather((current) => ({ ...current, status: "error" }));
        }
      }
    }

    const fallback = () => void loadWeather(-36.4242, -71.9581, "Nuble / San Carlos");

    if (!navigator.geolocation) {
      fallback();
      return () => {
        mounted = false;
      };
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        void loadWeather(position.coords.latitude, position.coords.longitude, "Ubicacion actual");
      },
      fallback,
      { enableHighAccuracy: false, maximumAge: 1000 * 60 * 20, timeout: 4500 }
    );

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <div className="hero-strip">
        <div>
          <span className="pill">Offline-first</span>
          <h2>Registra una inspeccion en terreno sin pelear con el telefono.</h2>
          <p>Escanea la colmena, dicta observaciones, completa checklist sanitario y guarda acciones de seguimiento.</p>
        </div>
        <div className="quick-actions">
          <button className="primary-button" onClick={() => onNavigate("inspections")} type="button">Nueva inspeccion</button>
          <button className="ghost-button" onClick={() => onNavigate("hives")} type="button">Abrir colmenas</button>
        </div>
      </div>
      <div className="module-grid">
        {actions.map(({ title, copy, detail, badge, cta, target, visual, metric }) => (
          <article className="module-card action-card field-feature-card" key={title}>
            <div className={`field-card-visual ${visual}`}>
              <span>{metric}</span>
            </div>
            <div className="field-card-copy">
              <span className="tag ok">{badge}</span>
              <h2>{title}</h2>
              <p>{copy}</p>
              <small>{detail}</small>
            </div>
            <button className="ghost-button" onClick={() => onNavigate(target)} type="button">{cta}</button>
          </article>
        ))}
        <article className="module-card field-feature-card weather-card">
          <div className={`field-card-visual weather ${weatherAdvice.tone}`}>
            <span>{weather.status === "loading" ? "..." : `${weather.temperature ?? "--"} C`}</span>
          </div>
          <div className="field-card-copy">
            <span className={`tag ${weatherAdvice.tone}`}>{weatherAdvice.label}</span>
            <h2>Clima en terreno</h2>
            <p>{weatherAdvice.copy}</p>
            <div className="weather-metrics">
              <span><b>{weather.wind ?? "--"} km/h</b> viento</span>
              <span><b>{weather.humidity ?? "--"}%</b> humedad</span>
              <span><b>{weather.rain ?? "--"} mm</b> lluvia</span>
            </div>
            <small>{weather.status === "error" ? "No se pudo actualizar el clima. Intenta nuevamente mas tarde." : `${weather.location} · ${weather.source}${weather.updatedAt ? ` · ${formatWeatherTime(weather.updatedAt)}` : ""}`}</small>
          </div>
        </article>
      </div>
    </>
  );
}

type WeatherState = {
  status: "loading" | "ready" | "error";
  location: string;
  source: string;
  temperature: number | null;
  apparent: number | null;
  humidity: number | null;
  wind: number | null;
  gusts: number | null;
  rain: number | null;
  code: number | null;
  updatedAt: string;
};

type OpenMeteoResponse = {
  current?: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_gusts_10m: number;
  };
};

function getInspectionAdvice(weather: WeatherState) {
  if (weather.status === "loading") {
    return { label: "Actualizando", tone: "watch", copy: "Consultando clima actual para estimar la ventana de inspeccion." };
  }

  if (weather.status === "error") {
    return { label: "Sin conexion", tone: "risk", copy: "Mantiene criterio de terreno: evita abrir colmenas con lluvia, frio o viento alto." };
  }

  const temperature = weather.temperature ?? 0;
  const wind = weather.wind ?? 0;
  const rain = weather.rain ?? 0;
  const rainyCode = weather.code !== null && [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(weather.code);
  const favorable = temperature >= 14 && temperature <= 28 && wind <= 20 && rain <= 0.1 && !rainyCode;

  if (favorable) {
    return { label: "Ventana favorable", tone: "ok", copy: "Condiciones buenas para revisar colmenas: temperatura adecuada, viento bajo y sin lluvia relevante." };
  }

  return { label: "Revisar antes", tone: "watch", copy: "Condiciones variables. Prioriza inspecciones cortas y evita abrir cria si hay viento, lluvia o baja temperatura." };
}

function formatWeatherTime(value: string) {
  return new Intl.DateTimeFormat("es-CL", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}
