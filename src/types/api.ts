export type Category = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  image_path?: string | null;
};

export type SupplierSummary = { id: number; company_name: string };

export type PropertySupplier = SupplierSummary & {
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  status: string;
};

export type Locale = {
  id: number;
  property_id: number | null;
  name: string;
  number: string;
  property_name: string;
  zone?: string | null;
  status: string;
  is_occupied: boolean;
  manager?: string | null;
  contract_start?: string | null;
  contract_end?: string | null;
  supplier?: PropertySupplier | null;
};

export type Property = {
  id: number;
  legacy_id: string;
  name: string;
  slug: string;
  type: string;
  units: number;
  occupied: number;
  available_units: number;
  occupancy_percentage: number;
  receivable: string | number;
  property_manager?: string | null;
  accounting_manager?: string | null;
  status: string;
  locales_count?: number;
  occupied_locales_count?: number;
  locales?: Locale[];
};

export type ShipmentEvent = {
  status: string;
  note?: string | null;
  at: string;
};

export type ShipmentOrder = {
  id: number;
  number: string;
  status: string;
  total: string | number;
  currency: string;
  shipments_count: number;
  customer?: { id: number; name: string; email: string } | null;
  created_at?: string | null;
};

export type Shipment = {
  id: number;
  order_id: number;
  supplier_id?: number | null;
  carrier?: string | null;
  tracking_number?: string | null;
  status: string;
  events: ShipmentEvent[];
  order?: ShipmentOrder | null;
  supplier?: SupplierSummary | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ShipmentCollectionResponse = CollectionResponse<Shipment> & { orders: ShipmentOrder[] };

export type VisualProduct = { id: number; name: string; slug: string; image_path?: string | null; image_url?: string | null; main_image_path?: string | null };

export type BannerContent = {
  id: number;
  legacy_id?: string | null;
  title: string;
  subtitle?: string | null;
  offer_label?: string | null;
  placement: string;
  image_path?: string | null;
  image_url?: string | null;
  linked_url?: string | null;
  status: string;
};

export type CarouselContent = {
  id: number;
  legacy_id?: string | null;
  slot: string;
  title: string;
  subtitle?: string | null;
  label?: string | null;
  status: string;
  product_ids: number[];
  products: VisualProduct[];
};

export type VisualMaterialContent = {
  id: number;
  legacy_id?: string | null;
  type: string;
  tone?: string | null;
  kicker?: string | null;
  title?: string | null;
  amount?: string | null;
  text?: string | null;
  cta?: string | null;
  href?: string | null;
  image_path?: string | null;
  image_url?: string | null;
  status: string;
};

export type VisualContentPayload = {
  banners: BannerContent[];
  carousels: CarouselContent[];
  visual_materials: VisualMaterialContent[];
  products: VisualProduct[];
  options: {
    banner_statuses: string[];
    visual_statuses: string[];
    carousel_slots: string[];
    material_types: string[];
  };
};

export type PromotionContent = {
  id: number;
  legacy_id?: string | null;
  name: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: string | number;
  minimum_value: number;
  identifier_image_path?: string | null;
  identifier_image_url?: string | null;
  status: string;
  starts_at: string;
  ends_at?: string | null;
  product_ids: number[];
  products: VisualProduct[];
};

export type PromotionPayload = {
  promotions: PromotionContent[];
  products: VisualProduct[];
  options: { types: string[]; statuses: string[] };
};

export type MarketingChannel = {
  channel: string;
  allocated_budget: string | number;
  status?: string | null;
};

export type MarketingLogEvent = {
  action: string;
  actor_id?: number | null;
  created_at?: string | null;
};

export type MarketingCampaign = {
  id: number;
  legacy_id?: string | null;
  folio: string;
  name: string;
  objective?: string | null;
  description?: string | null;
  target_audience?: string | null;
  target_location?: string | null;
  minimum_age?: number | null;
  maximum_age?: number | null;
  starts_on?: string | null;
  ends_on?: string | null;
  duration_days?: number | null;
  status: string;
  status_label: string;
  total_payment: string | number;
  currency: string;
  payment_fee_total: string | number;
  marketplace_fee_total: string | number;
  marketing_service_total: string | number;
  advertising_budget_total: string | number;
  investment_percent: string | number;
  tax_rate: string | number;
  payment_fee_rate: string | number;
  marketplace_fee_rate: string | number;
  distribution_mode?: string | null;
  channels: MarketingChannel[];
  assets: unknown[];
  payment?: Record<string, unknown> | null;
  metrics: Record<string, string | number>;
  change_log: MarketingLogEvent[];
  presentation_support_path?: string | null;
  presentation_support_url?: string | null;
  presentation_support_name?: string | null;
  terms_accepted_at?: string | null;
  paid_at?: string | null;
  submitted_at?: string | null;
  supplier?: SupplierSummary | null;
  product?: VisualProduct | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  role_label: string;
  status: string;
  status_label: string;
  company?: string | null;
  supplier?: {
    id: number;
    company_name: string;
    status: string;
    locale?: { id: number; name: string; property_name: string } | null;
  } | null;
  customer_profile?: { company_name?: string | null; phone?: string | null } | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type SupplierWithoutUser = {
  id: number;
  company_name: string;
  status: string;
  status_label: string;
  access_user: null;
  locale?: { id: number; name: string; property_name: string } | null;
};

export type AdminUsersPayload = {
  users: AdminUser[];
  suppliers_without_user: SupplierWithoutUser[];
  options: {
    roles: { value: string; label: string }[];
    statuses: { value: string; label: string }[];
  };
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  short_description?: string | null;
  long_description?: string | null;
  price: string | number;
  stock: number;
  minimum_order_quantity: number;
  status: string;
  accepts_branding: boolean;
  branding_options?: string[] | null;
  production_time_days?: number | null;
  shipping_time_days?: number | null;
  fast_shipping: boolean;
  featured: boolean;
  main_image_path?: string | null;
  colors?: string[] | null;
  materials?: string[] | null;
  dimensions?: string | null;
  supplier?: SupplierSummary | null;
  category?: Pick<Category, 'id' | 'name'> | null;
};

export type User = { id: number; name: string; email: string; role: string };
export type PaginationMeta = { current_page: number; last_page: number; per_page: number; total: number };
export type CollectionResponse<T> = { data: T[]; meta?: PaginationMeta };
export type ItemResponse<T> = { data: T };
