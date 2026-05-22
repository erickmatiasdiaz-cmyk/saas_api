export type ViewId =
  | "dashboard"
  | "field"
  | "production"
  | "sales"
  | "compliance"
  | "settings"
  | "inspections"
  | "apiaries"
  | "hives"
  | "treatments"
  | "biosecurity"
  | "traceability"
  | "inventory"
  | "reports"
  | "sipec"
  | "sagProfile"
  | "priorities";

export type HealthStatus = "ok" | "watch" | "risk";

export interface Apiary {
  id: string;
  name: string;
  commune: string;
  region: string;
  coordinates: string;
  activity: string;
  hives: number;
  health: HealthStatus;
  lastInspection: string;
  harvestKg: number;
  mapX: number;
  mapY: number;
}

export interface Inspection {
  hive: string;
  apiary: string;
  date: string;
  owner: string;
  status: HealthStatus;
}

export interface Treatment {
  diagnosis: string;
  hive: string;
  apiary: string;
  medicine: string;
  activeIngredient: string;
  dose: string;
  batch: string;
  appliedAt: string;
  withdrawal: string;
  status: HealthStatus;
}

export interface NavItem {
  id: ViewId;
  label: string;
  icon: string;
}

export type BrandIcon = "comb" | "hive" | "queen" | "leaf";

export interface CompanyProfile {
  productName: string;
  companyName: string;
  shortName: string;
  brandIcon: BrandIcon;
  accentColor: string;
  ownerName: string;
  ownerInitials: string;
  businessLine: string;
  taxId: string;
  sagCode: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  commune: string;
  region: string;
  billingEmail: string;
  plan: string;
}
