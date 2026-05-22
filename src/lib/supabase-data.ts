import { supabase } from "./supabase-client";
import { apiaries as fallbackApiaries, inspections as fallbackInspections, treatments as fallbackTreatments } from "./mock-data";
import type { Apiary, BrandIcon, CompanyProfile, HealthStatus, Inspection, Treatment } from "./types";

const demoCompanyId = "00000000-0000-4000-8000-000000000001";

type ApiaryRow = {
  id: string;
  code: string;
  name: string;
  commune: string;
  region: string;
  latitude: number | null;
  longitude: number | null;
  activity: string[] | null;
  hives_count: number;
  health: HealthStatus;
  notes: string | null;
};

type InspectionRow = {
  id: string;
  inspected_at: string;
  inspected_by: string;
  sanitary_status: HealthStatus;
  hives: { code: string } | null;
  apiaries: { name: string } | null;
};

type TreatmentRow = {
  diagnosis: string;
  medicine: string;
  active_ingredient: string | null;
  dose: string;
  batch: string | null;
  applied_at: string;
  withdrawal_until: string | null;
  status: HealthStatus;
  hives: { code: string } | null;
  apiaries: { name: string } | null;
};

export async function getCompanyProfile(): Promise<CompanyProfile | null> {
  const { data, error } = await supabase.from("companies").select("*").eq("id", demoCompanyId).single();
  if (error || !data) return null;

  return {
    productName: data.product_name,
    companyName: data.name,
    shortName: data.short_name,
    brandIcon: data.brand_icon as BrandIcon,
    accentColor: data.accent_color,
    ownerName: "Maria Apicultora",
    ownerInitials: "MA",
    businessLine: data.business_line ?? "",
    taxId: data.tax_id ?? "",
    sagCode: data.sag_code ?? "",
    email: data.email ?? "",
    phone: data.phone ?? "",
    website: data.website ?? "",
    address: data.address ?? "",
    commune: data.commune ?? "",
    region: data.region ?? "",
    billingEmail: data.billing_email ?? "",
    plan: data.plan
  };
}

export async function getApiaries(): Promise<Apiary[]> {
  const { data, error } = await supabase
    .from("apiaries")
    .select("id, code, name, commune, region, latitude, longitude, activity, hives_count, health, notes")
    .eq("company_id", demoCompanyId)
    .order("code");

  if (error || !data) return fallbackApiaries;

  return (data as ApiaryRow[]).map((item, index) => ({
    id: item.code,
    name: item.name,
    commune: item.commune,
    region: item.region,
    coordinates: `${item.latitude ?? ""}, ${item.longitude ?? ""}`,
    activity: (item.activity ?? []).join(", "),
    hives: item.hives_count,
    health: item.health,
    lastInspection: "Sincronizado",
    harvestKg: 0,
    mapX: [60, 66, 44, 24][index] ?? 50,
    mapY: [26, 72, 50, 76][index] ?? 50
  }));
}

export async function getInspections(): Promise<Inspection[]> {
  const { data, error } = await supabase
    .from("inspections")
    .select("id, inspected_at, inspected_by, sanitary_status, hives(code), apiaries(name)")
    .eq("company_id", demoCompanyId)
    .order("inspected_at", { ascending: false })
    .limit(6);

  if (error || !data) return fallbackInspections;

  return (data as unknown as InspectionRow[]).map((item) => ({
    hive: item.hives?.code ?? "Apiario completo",
    apiary: item.apiaries?.name ?? "Sin apiario",
    date: formatDate(item.inspected_at),
    owner: item.inspected_by,
    status: item.sanitary_status
  }));
}

export async function getTreatments(): Promise<Treatment[]> {
  const { data, error } = await supabase
    .from("treatments")
    .select("diagnosis, medicine, active_ingredient, dose, batch, applied_at, withdrawal_until, status, hives(code), apiaries(name)")
    .eq("company_id", demoCompanyId)
    .order("applied_at", { ascending: false })
    .limit(6);

  if (error || !data) return fallbackTreatments;

  return (data as unknown as TreatmentRow[]).map((item) => ({
    diagnosis: item.diagnosis,
    hive: item.hives?.code ?? "Apiario completo",
    apiary: item.apiaries?.name ?? "Sin apiario",
    medicine: item.medicine,
    activeIngredient: item.active_ingredient ?? "",
    dose: item.dose,
    batch: item.batch ?? "",
    appliedAt: formatDate(item.applied_at),
    withdrawal: item.withdrawal_until ? formatDate(item.withdrawal_until) : "Sin retiro",
    status: item.status
  }));
}

export async function getSalesOrders() {
  const { data } = await supabase
    .from("sales_orders")
    .select("customer_name, product, quantity, total_amount, status")
    .eq("company_id", demoCompanyId)
    .order("ordered_at", { ascending: false });

  return data ?? [];
}

export async function getHarvestLots() {
  const { data } = await supabase
    .from("harvest_lots")
    .select("lot_code, product, kilos, container_count, sale_price_per_kg, estimated_cost, status")
    .eq("company_id", demoCompanyId)
    .order("harvest_date", { ascending: false });

  return data ?? [];
}

export async function getInventoryItems() {
  const { data } = await supabase
    .from("inventory_items")
    .select("name, quantity, min_quantity, unit, location")
    .eq("company_id", demoCompanyId)
    .order("name");

  return data ?? [];
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CL", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}
