export type AdminModuleKey = 'suppliers' | 'properties' | 'banners' | 'offers' | 'marketing' | 'users' | 'reports' | 'shipping' | 'inventory' | 'branding' | 'preview';

export type AdminModule = {
  key: AdminModuleKey;
  title: string;
  description: string;
  icon: string;
  group: 'Operación' | 'Contenido' | 'Control';
  native: boolean;
};

export const adminModules: AdminModule[] = [
  { key: 'suppliers', title: 'Vendedores', description: 'Proveedores, contacto y estado comercial.', icon: '♟', group: 'Operación', native: true },
  { key: 'properties', title: 'Propiedades', description: 'Locales, ocupación y responsables.', icon: '▥', group: 'Operación', native: true },
  { key: 'shipping', title: 'Envíos', description: 'Seguimiento y estados de entrega.', icon: '▰', group: 'Operación', native: true },
  { key: 'inventory', title: 'Inventarios', description: 'Existencias, alertas y movimientos.', icon: '▦', group: 'Operación', native: true },
  { key: 'banners', title: 'Banners', description: 'Material visual de la portada.', icon: '▣', group: 'Contenido', native: true },
  { key: 'offers', title: 'Ofertas', description: 'Promociones y vigencias comerciales.', icon: '⚡', group: 'Contenido', native: true },
  { key: 'marketing', title: 'Marketing', description: 'Campañas y apoyos promocionales.', icon: '◎', group: 'Contenido', native: true },
  { key: 'branding', title: 'Branding', description: 'Solicitudes de personalización.', icon: '✦', group: 'Contenido', native: true },
  { key: 'users', title: 'Usuarios', description: 'Accesos, roles y estado de cuenta.', icon: '♙', group: 'Control', native: true },
  { key: 'reports', title: 'Reportes', description: 'Indicadores operativos del marketplace.', icon: '▤', group: 'Control', native: true },
  { key: 'preview', title: 'Vista previa', description: 'Revisa la experiencia pública publicada.', icon: '◉', group: 'Control', native: true },
];

export function findAdminModule(key?: string) { return adminModules.find((module) => module.key === key); }
