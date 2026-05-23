import { supabase } from "./supabase-client";
import { apiaries as fallbackApiaries, inspections as fallbackInspections, treatments as fallbackTreatments } from "./mock-data";
import type { Apiary, BrandIcon, CompanyProfile, HealthStatus, Inspection, Treatment, ViewId } from "./types";

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

export type RecordViewData = {
  title: string;
  cards: Array<[string, string, string]>;
  headers: string[];
  rows: string[][];
  source: "Supabase" | "Configuracion";
};

export async function getCompanyProfile(): Promise<CompanyProfile | null> {
  const companyId = await getActiveCompanyId();
  const { data, error } = await supabase.from("companies").select("*").eq("id", companyId).single();
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
  const companyId = await getActiveCompanyId();
  const { data, error } = await supabase.from("companies").select("ui_settings").eq("id", companyId).single();
  if (error || !data) return null;
  const uiSettings = (data.ui_settings ?? {}) as { moduleIcons?: Record<string, string> };
  return uiSettings.moduleIcons ?? null;
}

export async function saveCompanyProfile(profile: CompanyProfile, moduleIcons: Record<string, string>) {
  const companyId = await getActiveCompanyId();
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
    .eq("id", companyId);

  if (error) throw error;
}

export async function getApiaries(): Promise<Apiary[]> {
  const companyId = await getActiveCompanyId();
  const { data, error } = await supabase
    .from("apiaries")
    .select("id, code, name, commune, region, latitude, longitude, activity, hives_count, health, notes")
    .eq("company_id", companyId)
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
  const companyId = await getActiveCompanyId();
  const [apiaryResult, inspectionResult, treatmentResult] = await Promise.all([
    supabase.from("apiaries").select("hives_count, health").eq("company_id", companyId),
    supabase.from("inspections").select("id").eq("company_id", companyId).gte("follow_up_at", new Date().toISOString().slice(0, 10)),
    supabase.from("treatments").select("id, status").eq("company_id", companyId)
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
  const companyId = await getActiveCompanyId();
  const { data, error } = await supabase
    .from("inspections")
    .select("id, inspected_at, inspected_by, sanitary_status, hives(code), apiaries(name)")
    .eq("company_id", companyId)
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
  const companyId = await getActiveCompanyId();
  const { data, error } = await supabase
    .from("treatments")
    .select("diagnosis, medicine, active_ingredient, dose, batch, applied_at, withdrawal_until, status, hives(code), apiaries(name)")
    .eq("company_id", companyId)
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
  const companyId = await getActiveCompanyId();
  const [apiaryResult, hiveResult] = await Promise.all([
    supabase.from("apiaries").select("id, name").eq("company_id", companyId).order("name"),
    supabase.from("hives").select("id, code, apiary_id").eq("company_id", companyId).order("code")
  ]);

  return {
    apiaries: (apiaryResult.data ?? []) as InspectionFormApiary[],
    hives: (hiveResult.data ?? []) as InspectionFormHive[]
  };
}

export async function saveInspection(input: SaveInspectionInput) {
  const companyId = await getActiveCompanyId();
  const { data, error } = await supabase
    .from("inspections")
    .insert({
      company_id: companyId,
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
  const companyId = await getActiveCompanyId();
  const { data } = await supabase
    .from("sales_orders")
    .select("customer_name, product, quantity, total_amount, status")
    .eq("company_id", companyId)
    .order("ordered_at", { ascending: false });

  return data ?? [];
}

export async function getHarvestLots() {
  const companyId = await getActiveCompanyId();
  const { data } = await supabase
    .from("harvest_lots")
    .select("lot_code, product, kilos, container_count, sale_price_per_kg, estimated_cost, status")
    .eq("company_id", companyId)
    .order("harvest_date", { ascending: false });

  return data ?? [];
}

export async function getInventoryItems() {
  const companyId = await getActiveCompanyId();
  const { data } = await supabase
    .from("inventory_items")
    .select("name, quantity, min_quantity, unit, location")
    .eq("company_id", companyId)
    .order("name");

  return data ?? [];
}

export async function getRecordViewData(view: ViewId): Promise<RecordViewData> {
  const companyId = await getActiveCompanyId();

  if (view === "apiaries") {
    const apiaryRows = await getApiaries();
    const totalHives = apiaryRows.reduce((sum, item) => sum + item.hives, 0);
    return {
      title: "Apiarios FRADA",
      source: "Supabase",
      cards: [[String(apiaryRows.length), "Apiarios activos", "Desde tabla apiaries"], [String(totalHives), "Colmenas", "Declarables"], ["100%", "Actividad", "Clasificada por rubro"]],
      headers: ["N apiario", "Nombre", "Comuna / region", "Coordenadas", "Actividad", "Colmenas"],
      rows: apiaryRows.map((item) => [item.id, item.name, `${item.commune} / ${item.region}`, item.coordinates, item.activity, String(item.hives)])
    };
  }

  if (view === "hives") {
    const { data } = await supabase
      .from("hives")
      .select("code, queen_status, brood_status, food_reserve, status, apiaries(name)")
      .eq("company_id", companyId)
      .order("code");
    const rows = (data ?? []) as unknown as Array<{ code: string; queen_status: string | null; brood_status: string | null; food_reserve: string | null; status: string; apiaries: { name: string } | null }>;
    return {
      title: "Colmenas",
      source: "Supabase",
      cards: [[String(rows.length), "Total", "Registros en hives"], [String(rows.filter((item) => item.queen_status !== "Presente").length), "Revisar reina", "Seguimiento"], [String(rows.filter((item) => item.food_reserve === "Baja").length), "Baja reserva", "Alimentacion"]],
      headers: ["Codigo", "Apiario", "Reina", "Postura", "Alimento", "Estado"],
      rows: rows.map((item) => [item.code, item.apiaries?.name ?? "Sin apiario", item.queen_status ?? "Sin dato", item.brood_status ?? "Sin dato", item.food_reserve ?? "Sin dato", item.status])
    };
  }

  if (view === "treatments") {
    const treatmentRows = await getTreatments();
    return {
      title: "Tratamientos",
      source: "Supabase",
      cards: [[String(treatmentRows.filter((item) => item.status !== "ok").length), "Alertas", "Desde treatments"], [`${percentage(treatmentRows.filter((item) => item.batch).length, treatmentRows.length)}%`, "Con lote", "Trazabilidad"], [String(treatmentRows.filter((item) => item.withdrawal !== "Sin retiro").length), "Con retiro", "Control sanitario"]],
      headers: ["Diagnostico", "Colmena", "Medicamento", "Dosis", "Lote", "Retiro"],
      rows: treatmentRows.map((item) => [item.diagnosis, item.hive, item.medicine, item.dose, item.batch, item.withdrawal])
    };
  }

  if (view === "biosecurity") {
    const { data } = await supabase
      .from("biosecurity_events")
      .select("event_type, event_at, action_taken, mortality_count, priority, notes, apiaries(name)")
      .eq("company_id", companyId)
      .order("event_at", { ascending: false });
    const rows = (data ?? []) as unknown as Array<{ event_type: string; event_at: string; action_taken: string | null; mortality_count: number; priority: string; notes: string | null; apiaries: { name: string } | null }>;
    return {
      title: "Bioseguridad y mortalidad",
      source: "Supabase",
      cards: [[String(rows.length), "Registros", "Desde biosecurity_events"], [String(rows.filter((item) => item.mortality_count > 0).length), "Mortalidad", "Seguimiento"], [String(rows.reduce((sum, item) => sum + item.mortality_count, 0)), "Bajas", "Reportadas"]],
      headers: ["Registro", "Apiario", "Fecha", "Estado", "Observacion"],
      rows: rows.map((item) => [item.event_type, item.apiaries?.name ?? "Sin apiario", formatDate(item.event_at), item.priority, item.notes ?? item.action_taken ?? "Sin observacion"])
    };
  }

  if (view === "traceability") {
    const lots = await getHarvestLots() as Array<{ lot_code: string; product: string; kilos: number; container_count: number; sale_price_per_kg: number | null; estimated_cost: number | null; status: string }>;
    const firstLot = lots[0];
    const projectedIncome = lots.reduce((sum, lot) => sum + Number(lot.kilos ?? 0) * Number(lot.sale_price_per_kg ?? 0), 0);
    return {
      title: "Trazabilidad",
      source: "Supabase",
      cards: [[firstLot?.lot_code ?? "Sin lote", "Lote", "Desde harvest_lots"], [`${sumNumber(lots, "kilos")} kg`, "Cosecha", "Total registrada"], [formatCurrency(projectedIncome), "Venta potencial", "Precio por kg"]],
      headers: ["Lote", "Producto", "Kilos", "Envases", "Estado"],
      rows: lots.map((item) => [item.lot_code, item.product, `${item.kilos} kg`, String(item.container_count), item.status])
    };
  }

  if (view === "inventory") {
    const items = await getInventoryItems() as Array<{ name: string; quantity: number; min_quantity: number; unit: string; location: string | null }>;
    return {
      title: "Inventario",
      source: "Supabase",
      cards: [[String(items.length), "Insumos", "Desde inventory_items"], [String(items.filter((item) => Number(item.quantity) <= Number(item.min_quantity)).length), "Bajo minimo", "Alertas de stock"], [String(sumNumber(items, "quantity")), "Stock total", "Unidades mixtas"]],
      headers: ["Insumo", "Stock", "Minimo", "Ubicacion", "Estado"],
      rows: items.map((item) => [item.name, `${item.quantity} ${item.unit}`, `${item.min_quantity} ${item.unit}`, item.location ?? "Sin ubicacion", Number(item.quantity) <= Number(item.min_quantity) ? "Bajo" : "OK"])
    };
  }

  if (view === "sipec") {
    const { data } = await supabase.from("sipec_declarations").select("*").eq("company_id", companyId).order("created_at", { ascending: false }).limit(1).maybeSingle();
    return {
      title: "Declaracion SIPEC / Octubre",
      source: "Supabase",
      cards: [[data?.declaration_month ?? "Octubre", "Ventana anual", "Declaracion"], [String(data?.declared_apiaries ?? 0), "Apiarios", "Declarados"], [String(data?.declared_hives ?? 0), "Colmenas", "Declaradas"]],
      headers: ["Campo", "Valor"],
      rows: [["Temporada", data?.season ?? "Sin declaracion"], ["Estado", data?.status ?? "Borrador"], ["Notas", data?.notes ?? "Sin notas"], ["Respaldo", data?.backup_url ?? "Pendiente"]]
    };
  }

  if (view === "reports") {
    const { data } = await supabase
      .from("export_jobs")
      .select("export_type, requested_at, status, file_url")
      .eq("company_id", companyId)
      .order("requested_at", { ascending: false });
    const rows = (data ?? []) as Array<{ export_type: string; requested_at: string; status: string; file_url: string | null }>;
    return {
      title: "Reportes PDF/Excel",
      source: "Supabase",
      cards: [[String(rows.length), "Respaldos", "Desde export_jobs"], [String(rows.filter((item) => item.export_type.toLowerCase().includes("pdf")).length), "PDF", "Generados"], [String(rows.filter((item) => item.export_type.toLowerCase().includes("excel")).length), "Excel", "Generados"]],
      headers: ["Reporte", "Fecha", "Formato", "Archivo", "Estado"],
      rows: rows.map((item) => [item.export_type, formatDate(item.requested_at), item.export_type.toUpperCase().includes("PDF") ? "PDF" : "Excel", item.file_url ?? "Pendiente", item.status])
    };
  }

  if (view === "sagProfile") {
    const profile = await getCompanyProfile();
    return {
      title: "Perfil Apicultor SAG",
      source: "Supabase",
      cards: [[profile?.sagCode || "SAG", "Registro", "companies.sag_code"], [profile?.taxId || "Sin RUT", "RUT", "Empresa"], [profile?.region || "Sin region", "Region", "Principal"]],
      headers: ["Campo", "Valor"],
      rows: [["RUT", profile?.taxId ?? ""], ["Responsable", profile?.ownerName ?? ""], ["Razon social", profile?.companyName ?? ""], ["Region", profile?.region ?? ""], ["Giro", profile?.businessLine ?? ""]]
    };
  }

  return {
    title: "Prioridades",
    source: "Configuracion",
    cards: [["Alta", "Campo", "Inspeccion rapida"], ["Alta", "SAG/SIPEC", "Respaldo"], ["Media", "Ventas", "Pipeline"]],
    headers: ["Prioridad", "Modulo", "Estado", "Siguiente paso"],
    rows: [["Alta", "Apiarios FRADA", "Con BD", "Agregar formulario CRUD"], ["Alta", "Tratamientos", "Con BD", "Crear formulario sanitario"], ["Media", "Ventas", "Con BD", "Editar estados pipeline"]]
  };
}

function percentage(value: number, total: number) {
  return total ? Math.round((value / total) * 100) : 0;
}

function sumNumber<T extends Record<string, unknown>>(items: T[], key: keyof T) {
  return items.reduce((sum, item) => sum + Number(item[key] ?? 0), 0);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CL", { currency: "CLP", maximumFractionDigits: 0, style: "currency" }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CL", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

async function getActiveCompanyId() {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) return demoCompanyId;

  const { data } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", sessionData.session.user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  return data?.company_id ?? demoCompanyId;
}

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}
