import type { Apiary, Inspection, NavItem, Treatment } from "./types";

export const navItems: NavItem[] = [
  { id: "dashboard", label: "Panel", icon: "P" },
  { id: "field", label: "Campo", icon: "C" },
  { id: "production", label: "Produccion", icon: "M" },
  { id: "sales", label: "Ventas", icon: "$" },
  { id: "compliance", label: "SAG / SIPEC", icon: "S" },
  { id: "settings", label: "Configuracion", icon: "S" }
];

export const apiaries: Apiary[] = [
  {
    id: "API-001",
    name: "El Manzano",
    commune: "San Carlos",
    region: "Nuble",
    coordinates: "-36.4242, -71.9581",
    latitude: -36.4242,
    longitude: -71.9581,
    activity: "Miel, cera, polinizacion",
    hives: 32,
    health: "ok",
    lastInspection: "18 may 2026",
    harvestKg: 320,
    mapX: 60,
    mapY: 26
  },
  {
    id: "API-002",
    name: "Las Palmas",
    commune: "San Fabian",
    region: "Nuble",
    coordinates: "-36.5691, -71.5450",
    latitude: -36.5691,
    longitude: -71.545,
    activity: "Miel, nucleos, propoleo",
    hives: 28,
    health: "watch",
    lastInspection: "17 may 2026",
    harvestKg: 260,
    mapX: 66,
    mapY: 72
  },
  {
    id: "API-003",
    name: "El Arrayan",
    commune: "Quillon",
    region: "Nuble",
    coordinates: "-36.7421, -72.4700",
    latitude: -36.7421,
    longitude: -72.47,
    activity: "Miel, autoconsumo",
    hives: 24,
    health: "watch",
    lastInspection: "15 may 2026",
    harvestKg: 210,
    mapX: 44,
    mapY: 50
  },
  {
    id: "API-004",
    name: "Los Boldos",
    commune: "Coihueco",
    region: "Nuble",
    coordinates: "-36.6158, -71.8325",
    latitude: -36.6158,
    longitude: -71.8325,
    activity: "Miel, seleccion/cria",
    hives: 44,
    health: "risk",
    lastInspection: "12 may 2026",
    harvestKg: 410,
    mapX: 24,
    mapY: 76
  }
];

export const inspections: Inspection[] = [
  { hive: "Colmena 24", apiary: "El Manzano", date: "20 may 2026", owner: "Maria Apicultora", status: "ok" },
  { hive: "Colmena 11", apiary: "El Manzano", date: "21 may 2026", owner: "Maria Apicultora", status: "watch" },
  { hive: "Colmena 07", apiary: "Las Palmas", date: "22 may 2026", owner: "Maria Apicultora", status: "watch" }
];

export const treatments: Treatment[] = [
  {
    diagnosis: "Varroa destructor",
    hive: "Colmena 18",
    apiary: "El Manzano",
    medicine: "Acido oxalico",
    activeIngredient: "Oxalico",
    dose: "5 ml/calle",
    batch: "OX-2605",
    appliedAt: "15 may 2026",
    withdrawal: "Sin carencia miel",
    status: "risk"
  },
  {
    diagnosis: "Loque Americana",
    hive: "Colmena 05",
    apiary: "Las Palmas",
    medicine: "Muestra laboratorio",
    activeIngredient: "Diagnostico",
    dose: "1 muestra",
    batch: "LAB-118",
    appliedAt: "Pendiente",
    withdrawal: "Aislar material",
    status: "watch"
  }
];

export const healthLabel = {
  ok: "Buena",
  watch: "Revision",
  risk: "Critica"
} as const;
