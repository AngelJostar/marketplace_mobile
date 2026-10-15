export const shipmentStatuses = [
  { key: 'pending', label: 'Pendiente' },
  { key: 'preparing', label: 'Preparando' },
  { key: 'shipped', label: 'Enviado' },
  { key: 'in_transit', label: 'En tránsito' },
  { key: 'delivered', label: 'Entregado' },
  { key: 'cancelled', label: 'Cancelado' },
] as const;

export type ShipmentStatus = (typeof shipmentStatuses)[number]['key'];

export function shipmentStatusLabel(status: string) {
  return shipmentStatuses.find((item) => item.key === status)?.label ?? status;
}
