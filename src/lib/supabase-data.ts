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
  rows: RecordViewRow[];
  source: "Supabase" | "Configuracion";
};

export type RecordViewRow = {
  id: string;
  cells: string[];
  values?: Record<string, string>;
  editable?: boolean;
  deletable?: boolean;
};

export type RecordFormField = {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "textarea";
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
  placeholder?: string;
};

export type RecordFormConfig = {
  title: string;
  submitLabel: string;
  fields: RecordFormField[];
  initialValues: Record<string, string>;
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
    .neq("status", "archived")
    .order("code");

  if (error || !data) return fallbackApiaries;

  return (data as ApiaryRow[]).map((item, index) => ({
    id: item.code,
    name: item.name,
    commune: item.commune,
    region: item.region,
    coordinates: `${item.latitude ?? ""}, ${item.longitude ?? ""}`,
    latitude: item.latitude,
    longitude: item.longitude,
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

export type SaveSaleInput = {
  customerName: string;
  customerChannel: string;
  product: string;
  quantity: string;
  unitPrice: string;
  totalAmount: string;
  status: string;
  notes: string;
};

export async function saveSalesOrder(input: SaveSaleInput) {
  const companyId = await getActiveCompanyId();
  const { data, error } = await supabase
    .from("sales_orders")
    .insert({
      company_id: companyId,
      customer_name: input.customerName,
      customer_channel: input.customerChannel || null,
      product: input.product,
      quantity: input.quantity,
      unit_price: optionalNumber(input.unitPrice),
      total_amount: optionalNumber(input.totalAmount),
      status: input.status,
      notes: input.notes || null
    })
    .select("id")
    .single();

  if (error) throw error;
  await logAudit("create_sales_order", "sales_orders", data.id as string);
  return data.id as string;
}

export async function getHarvestLots() {
  const companyId = await getActiveCompanyId();
  const { data } = await supabase
    .from("harvest_lots")
    .select("id, lot_code, harvest_date, product, kilos, container_count, sale_price_per_kg, estimated_cost, status, notes")
    .eq("company_id", companyId)
    .neq("status", "archived")
    .order("harvest_date", { ascending: false });

  return data ?? [];
}

export async function getInventoryItems() {
  const companyId = await getActiveCompanyId();
  const { data } = await supabase
    .from("inventory_items")
    .select("id, name, category, quantity, min_quantity, unit, batch, expires_at, location")
    .eq("company_id", companyId)
    .order("name");

  return data ?? [];
}

export async function createExportJob(module: string, exportType: "pdf" | "excel" | "zip" = "pdf") {
  const companyId = await getActiveCompanyId();
  const { data: sessionData } = await supabase.auth.getSession();
  const { data, error } = await supabase
    .from("export_jobs")
    .insert({
      company_id: companyId,
      requested_by: sessionData.session?.user.email ?? "Usuario demo",
      export_type: exportType,
      module,
      status: "queued"
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id as string;
}

export async function getRecordFormConfig(view: ViewId): Promise<RecordFormConfig | null> {
  const { apiaries, hives } = await getInspectionFormData();
  const apiaryOptions = apiaries.map((apiary) => ({ label: apiary.name, value: apiary.id }));
  const hiveOptions = [{ label: "Apiario completo", value: "" }, ...hives.map((hive) => ({ label: hive.code, value: hive.id }))];
  const today = new Date().toISOString().slice(0, 10);

  const baseSelects = {
    health: [
      { label: "Buena", value: "ok" },
      { label: "Revision", value: "watch" },
      { label: "Critica", value: "risk" }
    ],
    priority: [
      { label: "Baja", value: "low" },
      { label: "Media", value: "medium" },
      { label: "Alta", value: "high" },
      { label: "Urgente", value: "urgent" }
    ],
    recordStatus: [
      { label: "Borrador", value: "draft" },
      { label: "Activo", value: "active" },
      { label: "Cerrado", value: "closed" },
      { label: "Archivado", value: "archived" }
    ]
  };

  if (view === "apiaries") {
    return {
      title: "Nuevo apiario FRADA",
      submitLabel: "Guardar apiario",
      initialValues: { code: nextCode("API"), name: "", commune: "", region: "Nuble", latitude: "", longitude: "", activity: "Miel", hives_count: "0", health: "ok", notes: "" },
      fields: [
        { name: "code", label: "Codigo", type: "text", required: true },
        { name: "name", label: "Nombre apiario", type: "text", required: true },
        { name: "commune", label: "Comuna", type: "text", required: true },
        { name: "region", label: "Region", type: "text", required: true },
        { name: "latitude", label: "Latitud WGS-84", type: "number", placeholder: "-36.424200" },
        { name: "longitude", label: "Longitud WGS-84", type: "number", placeholder: "-71.958100" },
        { name: "activity", label: "Actividad apicola", type: "text", placeholder: "Miel, cera, polinizacion" },
        { name: "hives_count", label: "Colmenas declarables", type: "number", required: true },
        { name: "health", label: "Salud", type: "select", options: baseSelects.health },
        { name: "notes", label: "Notas", type: "textarea" }
      ]
    };
  }

  if (view === "hives") {
    return {
      title: "Nueva colmena",
      submitLabel: "Guardar colmena",
      initialValues: { apiary_id: apiaryOptions[0]?.value ?? "", code: nextCode("COL"), qr_code: "", queen_status: "Presente", brood_status: "Normal", food_reserve: "Media", frames_count: "10", status: "active" },
      fields: [
        { name: "apiary_id", label: "Apiario", type: "select", required: true, options: apiaryOptions },
        { name: "code", label: "Codigo colmena", type: "text", required: true },
        { name: "qr_code", label: "QR/NFC", type: "text", placeholder: "QR-COL-001" },
        { name: "queen_status", label: "Reina", type: "text" },
        { name: "brood_status", label: "Cria / postura", type: "text" },
        { name: "food_reserve", label: "Reserva alimento", type: "text" },
        { name: "frames_count", label: "Marcos", type: "number" },
        { name: "status", label: "Estado", type: "select", options: baseSelects.recordStatus }
      ]
    };
  }

  if (view === "treatments") {
    return {
      title: "Nuevo tratamiento",
      submitLabel: "Guardar tratamiento",
      initialValues: { apiary_id: apiaryOptions[0]?.value ?? "", hive_id: "", diagnosis: "Varroa destructor", medicine: "", active_ingredient: "", dose: "", batch: "", applied_at: today, withdrawal_until: "", responsible: "", status: "watch", notes: "" },
      fields: [
        { name: "apiary_id", label: "Apiario", type: "select", required: true, options: apiaryOptions },
        { name: "hive_id", label: "Colmena", type: "select", options: hiveOptions },
        { name: "diagnosis", label: "Diagnostico", type: "text", required: true },
        { name: "medicine", label: "Medicamento", type: "text", required: true },
        { name: "active_ingredient", label: "Principio activo", type: "text" },
        { name: "dose", label: "Dosis", type: "text", required: true },
        { name: "batch", label: "Lote medicamento", type: "text" },
        { name: "applied_at", label: "Fecha aplicacion", type: "date", required: true },
        { name: "withdrawal_until", label: "Retiro / carencia", type: "date" },
        { name: "responsible", label: "Responsable", type: "text" },
        { name: "status", label: "Estado sanitario", type: "select", options: baseSelects.health },
        { name: "notes", label: "Notas", type: "textarea" }
      ]
    };
  }

  if (view === "biosecurity") {
    return {
      title: "Nuevo evento de bioseguridad",
      submitLabel: "Guardar evento",
      initialValues: { apiary_id: apiaryOptions[0]?.value ?? "", event_type: "Limpieza", event_at: today, material: "", action_taken: "", mortality_count: "0", suspected_cause: "", priority: "medium", notes: "" },
      fields: [
        { name: "apiary_id", label: "Apiario", type: "select", options: [{ label: "General empresa", value: "" }, ...apiaryOptions] },
        { name: "event_type", label: "Tipo registro", type: "text", required: true },
        { name: "event_at", label: "Fecha", type: "date", required: true },
        { name: "material", label: "Material involucrado", type: "text" },
        { name: "action_taken", label: "Accion tomada", type: "text" },
        { name: "mortality_count", label: "Mortalidad observada", type: "number" },
        { name: "suspected_cause", label: "Causa sospechada", type: "text" },
        { name: "priority", label: "Prioridad", type: "select", options: baseSelects.priority },
        { name: "notes", label: "Observacion", type: "textarea" }
      ]
    };
  }

  if (view === "traceability") {
    return {
      title: "Nuevo lote trazable",
      submitLabel: "Crear lote",
      initialValues: { lot_code: `M${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`, harvest_date: today, product: "Miel multifloral", kilos: "0", container_count: "0", sale_price_per_kg: "4800", estimated_cost: "0", status: "active", notes: "" },
      fields: [
        { name: "lot_code", label: "Codigo lote", type: "text", required: true },
        { name: "harvest_date", label: "Fecha cosecha", type: "date", required: true },
        { name: "product", label: "Producto", type: "text", required: true },
        { name: "kilos", label: "Kilos", type: "number", required: true },
        { name: "container_count", label: "Envases", type: "number" },
        { name: "sale_price_per_kg", label: "Precio por kg", type: "number" },
        { name: "estimated_cost", label: "Costo estimado", type: "number" },
        { name: "status", label: "Estado", type: "select", options: baseSelects.recordStatus },
        { name: "notes", label: "Notas", type: "textarea" }
      ]
    };
  }

  if (view === "inventory") {
    return {
      title: "Nuevo item de inventario",
      submitLabel: "Guardar item",
      initialValues: { name: "", category: "Envases", unit: "un", quantity: "0", min_quantity: "0", batch: "", expires_at: "", location: "" },
      fields: [
        { name: "name", label: "Insumo", type: "text", required: true },
        { name: "category", label: "Categoria", type: "text", required: true },
        { name: "unit", label: "Unidad", type: "text", required: true },
        { name: "quantity", label: "Stock", type: "number", required: true },
        { name: "min_quantity", label: "Minimo", type: "number" },
        { name: "batch", label: "Lote", type: "text" },
        { name: "expires_at", label: "Vencimiento", type: "date" },
        { name: "location", label: "Ubicacion", type: "text" }
      ]
    };
  }

  if (view === "sipec") {
    return {
      title: "Nueva declaracion SIPEC",
      submitLabel: "Guardar declaracion",
      initialValues: { season: "2025/2026", declaration_month: "Octubre", declared_apiaries: String(apiaryOptions.length), declared_hives: "0", status: "draft", backup_url: "", notes: "" },
      fields: [
        { name: "season", label: "Temporada", type: "text", required: true },
        { name: "declaration_month", label: "Mes declaracion", type: "text", required: true },
        { name: "declared_apiaries", label: "Apiarios declarados", type: "number" },
        { name: "declared_hives", label: "Colmenas declaradas", type: "number" },
        { name: "status", label: "Estado", type: "select", options: ["draft", "ready", "submitted", "observed", "accepted"].map((status) => ({ label: status, value: status })) },
        { name: "backup_url", label: "URL respaldo", type: "text" },
        { name: "notes", label: "Notas", type: "textarea" }
      ]
    };
  }

  if (view === "reports") {
    return {
      title: "Nueva exportacion",
      submitLabel: "Solicitar respaldo",
      initialValues: { export_type: "pdf", module: "sag_sipec", requested_by: "" },
      fields: [
        { name: "export_type", label: "Formato", type: "select", required: true, options: [{ label: "PDF", value: "pdf" }, { label: "Excel", value: "excel" }, { label: "ZIP", value: "zip" }] },
        { name: "module", label: "Modulo", type: "text", required: true },
        { name: "requested_by", label: "Solicitado por", type: "text" }
      ]
    };
  }

  return null;
}

export async function saveRecordForView(view: ViewId, values: Record<string, string>, recordId?: string | null) {
  const companyId = await getActiveCompanyId();
  const { table, payload } = buildPayloadForView(view, values, companyId);

  if (recordId) {
    const { data, error } = await supabase.from(table).update(payload).eq("id", recordId).select("id").single();
    if (error) throw error;
    await logAudit(`update_${view}`, table, data.id as string);
    return data.id as string;
  }

  const { data, error } = await supabase.from(table).insert(payload).select("id").single();
  if (error) throw error;
  await logAudit(`create_${view}`, table, data.id as string);
  return data.id as string;
}

export async function deleteRecordForView(view: ViewId, recordId: string) {
  const { table, softDeleteStatus } = getMutableTableForView(view);

  if (softDeleteStatus) {
    const { error } = await supabase.from(table).update({ status: softDeleteStatus }).eq("id", recordId);
    if (error) throw error;
    await logAudit(`archive_${view}`, table, recordId);
    return;
  }

  const { error } = await supabase.from(table).delete().eq("id", recordId);
  if (error) throw error;
  await logAudit(`delete_${view}`, table, recordId);
}

function buildPayloadForView(view: ViewId, values: Record<string, string>, companyId: string): { table: string; payload: Record<string, unknown> } {
  const cleaned = cleanValues(values);
  const basePayload: Record<string, unknown> = { company_id: companyId };

  if (view === "apiaries") {
    return {
      table: "apiaries",
      payload: { ...basePayload, ...cleaned, activity: splitList(values.activity), hives_count: toNumber(values.hives_count), latitude: optionalNumber(values.latitude), longitude: optionalNumber(values.longitude) }
    };
  }

  if (view === "hives") {
    return {
      table: "hives",
      payload: { ...basePayload, ...cleaned, frames_count: optionalNumber(values.frames_count) }
    };
  }

  if (view === "treatments") {
    return {
      table: "treatments",
      payload: { ...basePayload, ...cleaned, hive_id: values.hive_id || null, withdrawal_until: values.withdrawal_until || null }
    };
  }

  if (view === "biosecurity") {
    return {
      table: "biosecurity_events",
      payload: { ...basePayload, ...cleaned, apiary_id: values.apiary_id || null, mortality_count: toNumber(values.mortality_count) }
    };
  }

  if (view === "traceability") {
    return {
      table: "harvest_lots",
      payload: {
        ...basePayload,
        ...cleaned,
        kilos: toNumber(values.kilos),
        container_count: toNumber(values.container_count),
        sale_price_per_kg: optionalNumber(values.sale_price_per_kg),
        estimated_cost: optionalNumber(values.estimated_cost),
        qr_code: values.lot_code ? `QR-${values.lot_code}` : null
      }
    };
  }

  if (view === "inventory") {
    return {
      table: "inventory_items",
      payload: { ...basePayload, ...cleaned, quantity: toNumber(values.quantity), min_quantity: toNumber(values.min_quantity), expires_at: values.expires_at || null }
    };
  }

  if (view === "sipec") {
    return {
      table: "sipec_declarations",
      payload: { ...basePayload, ...cleaned, declared_apiaries: toNumber(values.declared_apiaries), declared_hives: toNumber(values.declared_hives) }
    };
  }

  if (view === "reports") {
    return {
      table: "export_jobs",
      payload: { ...basePayload, ...cleaned, status: "queued" }
    };
  }

  throw new Error("Esta vista no tiene formulario de registro");
}

function getMutableTableForView(view: ViewId) {
  const mapping: Partial<Record<ViewId, { table: string; softDeleteStatus?: string }>> = {
    apiaries: { table: "apiaries", softDeleteStatus: "archived" },
    hives: { table: "hives", softDeleteStatus: "archived" },
    treatments: { table: "treatments" },
    biosecurity: { table: "biosecurity_events" },
    traceability: { table: "harvest_lots", softDeleteStatus: "archived" },
    inventory: { table: "inventory_items" },
    reports: { table: "export_jobs" },
    sipec: { table: "sipec_declarations" }
  };
  const config = mapping[view];
  if (!config) throw new Error("Esta vista no permite eliminar registros");
  return config;
}

export async function getRecordViewData(view: ViewId): Promise<RecordViewData> {
  const companyId = await getActiveCompanyId();

  if (view === "apiaries") {
    const { data } = await supabase
      .from("apiaries")
      .select("id, code, name, commune, region, latitude, longitude, activity, hives_count, health, notes, status")
      .eq("company_id", companyId)
      .neq("status", "archived")
      .order("code");
    const apiaryRows = (data ?? []) as Array<{ id: string; code: string; name: string; commune: string; region: string; latitude: number | null; longitude: number | null; activity: string[] | null; hives_count: number; health: HealthStatus; notes: string | null }>;
    const totalHives = apiaryRows.reduce((sum, item) => sum + item.hives_count, 0);
    return {
      title: "Apiarios FRADA",
      source: "Supabase",
      cards: [[String(apiaryRows.length), "Apiarios activos", "Desde tabla apiaries"], [String(totalHives), "Colmenas", "Declarables"], ["100%", "Actividad", "Clasificada por rubro"]],
      headers: ["N apiario", "Nombre", "Comuna / region", "Coordenadas", "Actividad", "Colmenas"],
      rows: apiaryRows.map((item) => ({
        id: item.id,
        cells: [item.code, item.name, `${item.commune} / ${item.region}`, `${item.latitude ?? ""}, ${item.longitude ?? ""}`, (item.activity ?? []).join(", "), String(item.hives_count)],
        values: {
          code: item.code,
          name: item.name,
          commune: item.commune,
          region: item.region,
          latitude: String(item.latitude ?? ""),
          longitude: String(item.longitude ?? ""),
          activity: (item.activity ?? []).join(", "),
          hives_count: String(item.hives_count),
          health: item.health,
          notes: item.notes ?? ""
        },
        editable: true,
        deletable: true
      }))
    };
  }

  if (view === "hives") {
    const { data } = await supabase
      .from("hives")
      .select("id, apiary_id, code, qr_code, queen_status, brood_status, food_reserve, frames_count, status, apiaries(name)")
      .eq("company_id", companyId)
      .neq("status", "archived")
      .order("code");
    const rows = (data ?? []) as unknown as Array<{ id: string; apiary_id: string; code: string; qr_code: string | null; queen_status: string | null; brood_status: string | null; food_reserve: string | null; frames_count: number | null; status: string; apiaries: { name: string } | null }>;
    return {
      title: "Colmenas",
      source: "Supabase",
      cards: [[String(rows.length), "Total", "Registros en hives"], [String(rows.filter((item) => item.queen_status !== "Presente").length), "Revisar reina", "Seguimiento"], [String(rows.filter((item) => item.food_reserve === "Baja").length), "Baja reserva", "Alimentacion"]],
      headers: ["Codigo", "Apiario", "Reina", "Postura", "Alimento", "Estado"],
      rows: rows.map((item) => ({
        id: item.id,
        cells: [item.code, item.apiaries?.name ?? "Sin apiario", item.queen_status ?? "Sin dato", item.brood_status ?? "Sin dato", item.food_reserve ?? "Sin dato", item.status],
        values: {
          apiary_id: item.apiary_id,
          code: item.code,
          qr_code: item.qr_code ?? "",
          queen_status: item.queen_status ?? "",
          brood_status: item.brood_status ?? "",
          food_reserve: item.food_reserve ?? "",
          frames_count: String(item.frames_count ?? ""),
          status: item.status
        },
        editable: true,
        deletable: true
      }))
    };
  }

  if (view === "treatments") {
    const { data } = await supabase
      .from("treatments")
      .select("id, apiary_id, hive_id, diagnosis, medicine, active_ingredient, dose, batch, applied_at, withdrawal_until, responsible, status, notes, hives(code)")
      .eq("company_id", companyId)
      .order("applied_at", { ascending: false });
    const treatmentRows = (data ?? []) as unknown as Array<{ id: string; apiary_id: string; hive_id: string | null; diagnosis: string; medicine: string; active_ingredient: string | null; dose: string; batch: string | null; applied_at: string; withdrawal_until: string | null; responsible: string | null; status: HealthStatus; notes: string | null; hives: { code: string } | null }>;
    return {
      title: "Tratamientos",
      source: "Supabase",
      cards: [[String(treatmentRows.filter((item) => item.status !== "ok").length), "Alertas", "Desde treatments"], [`${percentage(treatmentRows.filter((item) => item.batch).length, treatmentRows.length)}%`, "Con lote", "Trazabilidad"], [String(treatmentRows.filter((item) => item.withdrawal_until).length), "Con retiro", "Control sanitario"]],
      headers: ["Diagnostico", "Colmena", "Medicamento", "Dosis", "Lote", "Retiro"],
      rows: treatmentRows.map((item) => ({
        id: item.id,
        cells: [item.diagnosis, item.hives?.code ?? "Apiario completo", item.medicine, item.dose, item.batch ?? "", item.withdrawal_until ? formatDate(item.withdrawal_until) : "Sin retiro"],
        values: {
          apiary_id: item.apiary_id,
          hive_id: item.hive_id ?? "",
          diagnosis: item.diagnosis,
          medicine: item.medicine,
          active_ingredient: item.active_ingredient ?? "",
          dose: item.dose,
          batch: item.batch ?? "",
          applied_at: item.applied_at,
          withdrawal_until: item.withdrawal_until ?? "",
          responsible: item.responsible ?? "",
          status: item.status,
          notes: item.notes ?? ""
        },
        editable: true,
        deletable: true
      }))
    };
  }

  if (view === "biosecurity") {
    const { data } = await supabase
      .from("biosecurity_events")
      .select("id, apiary_id, event_type, event_at, material, action_taken, mortality_count, suspected_cause, priority, notes, apiaries(name)")
      .eq("company_id", companyId)
      .order("event_at", { ascending: false });
    const rows = (data ?? []) as unknown as Array<{ id: string; apiary_id: string | null; event_type: string; event_at: string; material: string | null; action_taken: string | null; mortality_count: number; suspected_cause: string | null; priority: string; notes: string | null; apiaries: { name: string } | null }>;
    return {
      title: "Bioseguridad y mortalidad",
      source: "Supabase",
      cards: [[String(rows.length), "Registros", "Desde biosecurity_events"], [String(rows.filter((item) => item.mortality_count > 0).length), "Mortalidad", "Seguimiento"], [String(rows.reduce((sum, item) => sum + item.mortality_count, 0)), "Bajas", "Reportadas"]],
      headers: ["Registro", "Apiario", "Fecha", "Estado", "Observacion"],
      rows: rows.map((item) => ({
        id: item.id,
        cells: [item.event_type, item.apiaries?.name ?? "General empresa", formatDate(item.event_at), item.priority, item.notes ?? item.action_taken ?? "Sin observacion"],
        values: {
          apiary_id: item.apiary_id ?? "",
          event_type: item.event_type,
          event_at: item.event_at,
          material: item.material ?? "",
          action_taken: item.action_taken ?? "",
          mortality_count: String(item.mortality_count),
          suspected_cause: item.suspected_cause ?? "",
          priority: item.priority,
          notes: item.notes ?? ""
        },
        editable: true,
        deletable: true
      }))
    };
  }

  if (view === "traceability") {
    const lots = await getHarvestLots() as Array<{ id: string; lot_code: string; harvest_date: string; product: string; kilos: number; container_count: number; sale_price_per_kg: number | null; estimated_cost: number | null; status: string; notes: string | null }>;
    const firstLot = lots[0];
    const projectedIncome = lots.reduce((sum, lot) => sum + Number(lot.kilos ?? 0) * Number(lot.sale_price_per_kg ?? 0), 0);
    return {
      title: "Trazabilidad",
      source: "Supabase",
      cards: [[firstLot?.lot_code ?? "Sin lote", "Lote", "Desde harvest_lots"], [`${sumNumber(lots, "kilos")} kg`, "Cosecha", "Total registrada"], [formatCurrency(projectedIncome), "Venta potencial", "Precio por kg"]],
      headers: ["Lote", "Producto", "Kilos", "Envases", "Estado"],
      rows: lots.map((item) => ({
        id: item.id,
        cells: [item.lot_code, item.product, `${item.kilos} kg`, String(item.container_count), item.status],
        values: {
          lot_code: item.lot_code,
          harvest_date: item.harvest_date,
          product: item.product,
          kilos: String(item.kilos),
          container_count: String(item.container_count),
          sale_price_per_kg: String(item.sale_price_per_kg ?? ""),
          estimated_cost: String(item.estimated_cost ?? ""),
          status: item.status,
          notes: item.notes ?? ""
        },
        editable: true,
        deletable: true
      }))
    };
  }

  if (view === "inventory") {
    const items = await getInventoryItems() as Array<{ id: string; name: string; category: string; quantity: number; min_quantity: number; unit: string; batch: string | null; expires_at: string | null; location: string | null }>;
    return {
      title: "Inventario",
      source: "Supabase",
      cards: [[String(items.length), "Insumos", "Desde inventory_items"], [String(items.filter((item) => Number(item.quantity) <= Number(item.min_quantity)).length), "Bajo minimo", "Alertas de stock"], [String(sumNumber(items, "quantity")), "Stock total", "Unidades mixtas"]],
      headers: ["Insumo", "Stock", "Minimo", "Ubicacion", "Estado"],
      rows: items.map((item) => ({
        id: item.id,
        cells: [item.name, `${item.quantity} ${item.unit}`, `${item.min_quantity} ${item.unit}`, item.location ?? "Sin ubicacion", Number(item.quantity) <= Number(item.min_quantity) ? "Bajo" : "OK"],
        values: {
          name: item.name,
          category: item.category,
          unit: item.unit,
          quantity: String(item.quantity),
          min_quantity: String(item.min_quantity),
          batch: item.batch ?? "",
          expires_at: item.expires_at ?? "",
          location: item.location ?? ""
        },
        editable: true,
        deletable: true
      }))
    };
  }

  if (view === "sipec") {
    const { data } = await supabase.from("sipec_declarations").select("*").eq("company_id", companyId).order("created_at", { ascending: false }).limit(1).maybeSingle();
    return {
      title: "Declaracion SIPEC / Octubre",
      source: "Supabase",
      cards: [[data?.declaration_month ?? "Octubre", "Ventana anual", "Declaracion"], [String(data?.declared_apiaries ?? 0), "Apiarios", "Declarados"], [String(data?.declared_hives ?? 0), "Colmenas", "Declaradas"]],
      headers: ["Campo", "Valor", "Campo", "Valor", "Notas"],
      rows: data ? [{
        id: data.id,
        cells: ["Temporada", data.season ?? "Sin declaracion", "Estado", data.status ?? "Borrador", data.notes ?? "Sin notas"],
        values: {
          season: data.season ?? "",
          declaration_month: data.declaration_month ?? "Octubre",
          declared_apiaries: String(data.declared_apiaries ?? 0),
          declared_hives: String(data.declared_hives ?? 0),
          status: data.status ?? "draft",
          backup_url: data.backup_url ?? "",
          notes: data.notes ?? ""
        },
        editable: true,
        deletable: true
      }] : []
    };
  }

  if (view === "reports") {
    const { data } = await supabase
      .from("export_jobs")
      .select("id, requested_by, export_type, module, created_at, status, file_url")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });
    const rows = (data ?? []) as Array<{ id: string; requested_by: string | null; export_type: string; module: string; created_at: string; status: string; file_url: string | null }>;
    return {
      title: "Reportes PDF/Excel",
      source: "Supabase",
      cards: [[String(rows.length), "Respaldos", "Desde export_jobs"], [String(rows.filter((item) => item.export_type.toLowerCase().includes("pdf")).length), "PDF", "Generados"], [String(rows.filter((item) => item.export_type.toLowerCase().includes("excel")).length), "Excel", "Generados"]],
      headers: ["Reporte", "Fecha", "Formato", "Archivo", "Estado"],
      rows: rows.map((item) => ({
        id: item.id,
        cells: [item.export_type, formatDate(item.created_at), item.export_type.toUpperCase().includes("PDF") ? "PDF" : "Excel", item.file_url ?? "Pendiente", item.status],
        values: { export_type: item.export_type, module: item.module, requested_by: item.requested_by ?? "" },
        editable: true,
        deletable: true
      }))
    };
  }

  if (view === "sagProfile") {
    const profile = await getCompanyProfile();
    return {
      title: "Perfil Apicultor SAG",
      source: "Supabase",
      cards: [[profile?.sagCode || "SAG", "Registro", "companies.sag_code"], [profile?.taxId || "Sin RUT", "RUT", "Empresa"], [profile?.region || "Sin region", "Region", "Principal"]],
      headers: ["Campo", "Valor"],
      rows: [["RUT", profile?.taxId ?? ""], ["Responsable", profile?.ownerName ?? ""], ["Razon social", profile?.companyName ?? ""], ["Region", profile?.region ?? ""], ["Giro", profile?.businessLine ?? ""]].map((cells, index) => ({ id: `profile-${index}`, cells }))
    };
  }

  return {
    title: "Prioridades",
    source: "Configuracion",
    cards: [["Alta", "Campo", "Inspeccion rapida"], ["Alta", "SAG/SIPEC", "Respaldo"], ["Media", "Ventas", "Pipeline"]],
    headers: ["Prioridad", "Modulo", "Estado", "Siguiente paso"],
    rows: [["Alta", "Apiarios FRADA", "Con BD", "Agregar formulario CRUD"], ["Alta", "Tratamientos", "Con BD", "Crear formulario sanitario"], ["Media", "Ventas", "Con BD", "Editar estados pipeline"]].map((cells, index) => ({ id: `priority-${index}`, cells }))
  };
}

async function logAudit(action: string, entityTable: string, entityId: string) {
  const companyId = await getActiveCompanyId();
  const { data: sessionData } = await supabase.auth.getSession();
  await supabase.from("audit_logs").insert({
    company_id: companyId,
    actor_user_id: sessionData.session?.user.id ?? null,
    action,
    entity_table: entityTable,
    entity_id: entityId,
    metadata: { source: "app" }
  });
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

function cleanValues(values: Record<string, string>) {
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value === "" ? null : value]));
}

function splitList(value = "") {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function toNumber(value = "0") {
  return Number(value || 0);
}

function optionalNumber(value = "") {
  return value === "" ? null : Number(value);
}

function nextCode(prefix: string) {
  return `${prefix}-${String(Date.now()).slice(-4)}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CL", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value.includes("T") ? value : `${value}T00:00:00`));
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
