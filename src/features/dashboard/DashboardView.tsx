"use client";

import { useEffect, useState } from "react";
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
            <h2>Mapa de apiarios</h2>
            <select defaultValue="all">
              <option value="all">Todos los apiarios</option>
            </select>
          </div>
          <div className="map-layout">
            <div className="apiary-map">
              {remoteApiaries.map((apiary) => (
                <button
                  className={`map-pin ${apiary.health}`}
                  key={apiary.id}
                  onClick={() => onToast(`${apiary.name}: ${apiary.hives} colmenas, salud ${healthLabel[apiary.health]}`)}
                  style={{ left: `${apiary.mapX}%`, top: `${apiary.mapY}%` }}
                  type="button"
                >
                  <span>{apiary.hives}</span>
                </button>
              ))}
            </div>
            <div className="apiary-list">
              {remoteApiaries.map((apiary) => (
                <article className="apiary-row" key={apiary.id}>
                  <div>
                    <strong>{apiary.name}</strong>
                    <small>{apiary.hives} colmenas</small>
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
                  <small>{inspection.date} · {inspection.owner}</small>
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
