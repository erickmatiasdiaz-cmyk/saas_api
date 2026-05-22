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

export type InspectionFormApiary = {
  id: string;
  name: string;
};

export type InspectionFormHive = {
  id: string;
  code: string;
  apiary_id: string;
};

export type SaveInspectionInput = {
  apiaryId: string;
  hiveId: string | null;
  inspectedBy: string;
  queenSeen: boolean;
  queenCells: boolean;
  mediumReserves: boolean;
  checkVarroa: boolean;
  notes: string;
};

export type DashboardStats = {
  totalHives: number;
  healthPercent: number;
  upcomingInspections: number;
  alertCount: number;
  healthBuckets: {
    ok: number;
    watch: number;
    risk: number;
  };
};

export async function getCompanyProfile(): Promise<CompanyProfile | null> {
  const { data, error } = await supabase.from("companies").select("*").eq("id", demoCompanyId).single();
  if (error || !data) return null;

  const uiSettings = (data.ui_settings ?? {}) as Partial<CompanyProfile>;

  return {
    productName: data.product_name,
    companyName: data.name,
    shortName: data.short_name,
    brandIcon: data.brand_icon as BrandIcon,
    accentColor: data.accent_color,
    ownerName: uiSettings.ownerName ?? "Maria Apicultora",
    ownerInitials: uiSettings.ownerInitials ?? "MA",
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

export async function getCompanyModuleIcons(): Promise<Record<string, string> | null> {
  const { data, error } = await supabase.from("companies").select("ui_settings").eq("id", demoCompanyId).single();
  if (error || !data) return null;
  const uiSettings = (data.ui_settings ?? {}) as { moduleIcons?: Record<string, string> };
  return uiSettings.moduleIcons ?? null;
}

export async function saveCompanyProfile(profile: CompanyProfile, moduleIcons: Record<string, string>) {
  const { error } = await supabase
    .from("companies")
    .update({
      name: profile.companyName,
      product_name: profile.productName,
      short_name: profile.shortName,
      brand_icon: profile.brandIcon,
      accent_color: profile.accentColor,
      tax_id: profile.taxId,
      sag_code: profile.sagCode,
      business_line: profile.businessLine,
      email: profile.email,
      phone: profile.phone,
      website: profile.website,
      address: profile.address,
      commune: profile.commune,
      region: profile.region,
      billing_email: profile.billingEmail,
      plan: profile.plan,
      ui_settings: {
        ownerName: profile.ownerName,
        ownerInitials: profile.ownerInitials,
        moduleIcons
      }
    })
    .eq("id", demoCompanyId);

  if (error) throw error;
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

export async function getDashboardStats(): Promise<DashboardStats | null> {
  const [apiaryResult, inspectionResult, treatmentResult] = await Promise.all([
    supabase.from("apiaries").select("hives_count, health").eq("company_id", demoCompanyId),
    supabase.from("inspections").select("id").eq("company_id", demoCompanyId).gte("follow_up_at", new Date().toISOString().slice(0, 10)),
    supabase.from("treatments").select("id, status").eq("company_id", demoCompanyId)
  ]);

  if (apiaryResult.error || inspectionResult.error || treatmentResult.error) return null;

  const apiaryRows = (apiaryResult.data ?? []) as Array<{ hives_count: number; health: HealthStatus }>;
  const totalHives = apiaryRows.reduce((sum, row) => sum + row.hives_count, 0);
  const healthBuckets = apiaryRows.reduce(
    (buckets, row) => {
      buckets[row.health] += row.hives_count;
      return buckets;
    },
    { ok: 0, watch: 0, risk: 0 } as DashboardStats["healthBuckets"]
  );
  const healthPercent = totalHives ? Math.round((healthBuckets.ok / totalHives) * 100) : 0;

  return {
    totalHives,
    healthPercent,
    upcomingInspections: inspectionResult.data?.length ?? 0,
    alertCount: (treatmentResult.data ?? []).filter((item) => item.status !== "ok").length,
    healthBuckets
  };
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

export async function getInspectionFormData() {
  const [apiaryResult, hiveResult] = await Promise.all([
    supabase.from("apiaries").select("id, name").eq("company_id", demoCompanyId).order("name"),
    supabase.from("hives").select("id, code, apiary_id").eq("company_id", demoCompanyId).order("code")
  ]);

  return {
    apiaries: (apiaryResult.data ?? []) as InspectionFormApiary[],
    hives: (hiveResult.data ?? []) as InspectionFormHive[]
  };
}

export async function saveInspection(input: SaveInspectionInput) {
  const { data, error } = await supabase
    .from("inspections")
    .insert({
      company_id: demoCompanyId,
      apiary_id: input.apiaryId,
      hive_id: input.hiveId,
      inspected_by: input.inspectedBy,
      inspected_at: new Date().toISOString().slice(0, 10),
      queen_status: input.queenSeen ? "Presente" : "No vista",
      brood_status: input.queenCells ? "Celdas reales" : "Normal",
      food_reserve: input.mediumReserves ? "Media" : "Baja",
      varroa_level: input.checkVarroa ? "Revisar" : "Sin alerta",
      sanitary_status: input.checkVarroa ? "watch" : "ok",
      priority: input.checkVarroa ? "high" : "medium",
      notes: input.notes,
      follow_up_at: input.checkVarroa ? addDays(7) : null
    })
    .select("id")
    .single();

  if (error) throw error;

  const checklist = [
    ["Reina vista", input.queenSeen, "medium"],
    ["Celdas reales", input.queenCells, input.queenCells ? "high" : "medium"],
    ["Reservas medias", input.mediumReserves, "medium"],
    ["Revisar varroa", input.checkVarroa, input.checkVarroa ? "high" : "medium"]
  ] as const;

  const { error: checklistError } = await supabase.from("inspection_checklist_items").insert(
    checklist.map(([label, checked, severity]) => ({
      inspection_id: data.id,
      label,
      checked,
      severity
    }))
  );

  if (checklistError) throw checklistError;
  return data.id as string;
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

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}
