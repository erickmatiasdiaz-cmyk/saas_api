"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, StatCard } from "@/components/ui/Card";
import { apiaries, healthLabel, inspections, treatments } from "@/lib/mock-data";
import { getApiaries, getDashboardStats, getInspections, getTreatments } from "@/lib/supabase-data";
import type { Apiary, Inspection, Treatment } from "@/lib/types";

interface DashboardViewProps {
  onToast: (message: string) => void;
}

export function DashboardView({ onToast }: DashboardViewProps) {
  const [remoteApiaries, setRemoteApiaries] = useState<Apiary[]>(apiaries);
  const [remoteInspections, setRemoteInspections] = useState<Inspection[]>(inspections);
  const [remoteTreatments, setRemoteTreatments] = useState<Treatment[]>(treatments);
  const [stats, setStats] = useState({
    totalHives: 128,
    healthPercent: 91,
    upcomingInspections: 7,
    alertCount: 3,
    healthBuckets: { ok: 82, watch: 11, risk: 5 }
  });
  const [userLocation, setUserLocation] = useState<GpsLocation | null>(null);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const mapPoints = useMemo(() => projectApiaryMap(remoteApiaries, userLocation), [remoteApiaries, userLocation]);

  useEffect(() => {
    let mounted = true;
    Promise.all([getApiaries(), getInspections(), getTreatments(), getDashboardStats()]).then(([apiaryData, inspectionData, treatmentData, dashboardStats]) => {
      if (!mounted) return;
      setRemoteApiaries(apiaryData);
      setRemoteInspections(inspectionData);
      setRemoteTreatments(treatmentData);
      if (dashboardStats) setStats(dashboardStats);
    });
    return () => {
      mounted = false;
    };
  }, []);

  function requestGps() {
    if (!navigator.geolocation) {
      setGpsStatus("error");
      onToast("Este dispositivo no entrega GPS en el navegador");
      return;
    }

    setGpsStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setGpsStatus("ready");
        onToast("GPS conectado al mapa de apiarios");
      },
      () => {
        setGpsStatus("error");
        onToast("No se pudo obtener GPS. Revisa permisos del navegador");
      },
      { enableHighAccuracy: true, maximumAge: 1000 * 60 * 5, timeout: 8000 }
    );
  }

  return (
    <>
      <div className="season-row">
        <select aria-label="Seleccionar temporada" defaultValue="2025/2026">
          <option value="2025/2026">Temporada 2025/2026</option>
        </select>
        <span className="sync-pill">Sincronizado hace 4 min</span>
      </div>

      <div className="kpi-grid">
        <StatCard detail="+6 este mes" label="Total colmenas" tone="honey" value={String(stats.totalHives)} />
        <StatCard detail="Buena" label="Salud del apiario" tone="green" value={`${stats.healthPercent}%`} />
        <StatCard detail="Seguimiento abierto" label="Proximas inspecciones" tone="blue" value={String(stats.upcomingInspections)} />
        <StatCard detail="Requieren atencion" label="Alertas" tone="red" value={String(stats.alertCount)} />
      </div>

      <div className="dashboard-grid">
        <Card className="map-panel">
          <div className="panel-header">
            <div>
              <h2>Mapa GPS de apiarios</h2>
              <p>Ubicacion desde coordenadas registradas en cada apiario.</p>
            </div>
            <div className="map-actions">
              <button className="ghost-button" onClick={requestGps} type="button">{gpsStatus === "loading" ? "Buscando..." : "Usar mi GPS"}</button>
              <select defaultValue="all">
                <option value="all">Todos los apiarios</option>
              </select>
            </div>
          </div>
          <div className="map-layout">
            <div className="apiary-map">
              {mapPoints.apiaries.map(({ apiary, x, y }) => (
                <button
                  className={`map-pin ${apiary.health}`}
                  key={apiary.id}
                  onClick={() => onToast(`${apiary.name}: ${apiary.hives} colmenas - ${formatCoords(apiary)}`)}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  type="button"
                >
                  <span>{apiary.hives}</span>
                </button>
              ))}
              {mapPoints.user && (
                <span className="user-gps-pin" style={{ left: `${mapPoints.user.x}%`, top: `${mapPoints.user.y}%` }}>
                  <i />
                </span>
              )}
              <div className="map-compass">GPS</div>
            </div>
            <div className="apiary-list">
              {userLocation && (
                <article className="apiary-row gps-row">
                  <div>
                    <strong>Tu ubicacion</strong>
                    <small>{userLocation.latitude.toFixed(5)}, {userLocation.longitude.toFixed(5)}</small>
                  </div>
                  <span className="status ok">GPS</span>
                </article>
              )}
              {remoteApiaries.map((apiary) => (
                <article className="apiary-row" key={apiary.id}>
                  <div>
                    <strong>{apiary.name}</strong>
                    <small>{apiary.hives} colmenas - {formatCoords(apiary)}</small>
                  </div>
                  <span className={`status ${apiary.health}`}>{healthLabel[apiary.health]}</span>
                </article>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="panel-header">
            <h2>Proximas inspecciones</h2>
          </div>
          <div className="inspection-list">
            {remoteInspections.map((inspection) => (
              <article className="inspection-row" key={`${inspection.hive}-${inspection.date}`}>
                <div>
                  <strong>{inspection.hive} - {inspection.apiary}</strong>
                  <small>{inspection.date} - {inspection.owner}</small>
                </div>
                <span className={`tag ${inspection.status}`}>{inspection.status === "ok" ? "Lista" : "Pendiente"}</span>
              </article>
            ))}
          </div>
        </Card>

        <Card>
          <div className="panel-header">
            <h2>Alertas de tratamientos</h2>
          </div>
          <div className="treatment-list">
            {remoteTreatments.map((treatment) => (
              <article className="treatment-row" key={`${treatment.hive}-${treatment.medicine}`}>
                <div>
                  <strong>{treatment.diagnosis} - {treatment.hive}</strong>
                  <small>{treatment.apiary}</small>
                </div>
                <span className={`tag ${treatment.status}`}>{treatment.appliedAt}</span>
              </article>
            ))}
          </div>
        </Card>

        <Card>
          <div className="panel-header">
            <h2>Salud del apiario</h2>
          </div>
          <div className="health-content">
            <div className="donut">
              <strong>{stats.healthPercent}%</strong>
              <span>Salud general</span>
            </div>
            <div className="health-legend">
              <span><i className="dot green" />Buena <b>{stats.healthBuckets.ok} colmenas</b></span>
              <span><i className="dot honey" />Regular <b>{stats.healthBuckets.watch} colmenas</b></span>
              <span><i className="dot orange" />Baja <b>{Math.max(0, Math.round(stats.healthBuckets.risk / 2))} colmenas</b></span>
              <span><i className="dot red" />Critica <b>{Math.max(0, stats.healthBuckets.risk - Math.round(stats.healthBuckets.risk / 2))} colmenas</b></span>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

type GpsLocation = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

function projectApiaryMap(apiaries: Apiary[], userLocation: GpsLocation | null) {
  const apiaryCoords = apiaries
    .map((apiary) => ({ apiary, point: getApiaryCoords(apiary) }))
    .filter((item): item is { apiary: Apiary; point: { latitude: number; longitude: number } } => Boolean(item.point));
  const points = [...apiaryCoords.map((item) => item.point), ...(userLocation ? [{ latitude: userLocation.latitude, longitude: userLocation.longitude }] : [])];

  if (!points.length) {
    return {
      apiaries: apiaries.map((apiary) => ({ apiary, x: apiary.mapX, y: apiary.mapY })),
      user: null
    };
  }

  const latitudes = points.map((point) => point.latitude);
  const longitudes = points.map((point) => point.longitude);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);
  const latRange = Math.max(maxLat - minLat, 0.01);
  const lngRange = Math.max(maxLng - minLng, 0.01);

  function project(latitude: number, longitude: number) {
    return {
      x: clamp(8 + ((longitude - minLng) / lngRange) * 84, 8, 92),
      y: clamp(92 - ((latitude - minLat) / latRange) * 84, 8, 92)
    };
  }

  return {
    apiaries: apiaries.map((apiary) => {
      const point = getApiaryCoords(apiary);
      const projected = point ? project(point.latitude, point.longitude) : { x: apiary.mapX, y: apiary.mapY };
      return { apiary, ...projected };
    }),
    user: userLocation ? project(userLocation.latitude, userLocation.longitude) : null
  };
}

function getApiaryCoords(apiary: Apiary) {
  if (typeof apiary.latitude === "number" && typeof apiary.longitude === "number") {
    return { latitude: apiary.latitude, longitude: apiary.longitude };
  }
  const [latitude, longitude] = apiary.coordinates.split(",").map((value) => Number(value.trim()));
  if (Number.isFinite(latitude) && Number.isFinite(longitude)) return { latitude, longitude };
  return null;
}

function formatCoords(apiary: Apiary) {
  const point = getApiaryCoords(apiary);
  return point ? `${point.latitude.toFixed(4)}, ${point.longitude.toFixed(4)}` : "Sin GPS";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
