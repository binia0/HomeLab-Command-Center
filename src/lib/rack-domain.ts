export type RackStandard = 10 | 19;
export type Face = 'front' | 'rear';
export type Point3 = { x: number; y: number; z: number };
export type ConnectorType = 'RJ45' | 'USB-A' | 'USB-B' | 'USB-C' | 'HDMI' | 'DisplayPort' | 'POWER' | 'SFP' | 'CUSTOM';

export interface RackRecord {
  id: string;
  name: string;
  standard: RackStandard;
  units: number;
  depthMm: number;
}
export interface SlotRecord {
  id: string;
  name: string;
  localPositionMm: Point3;
  rotationDeg: Point3;
  widthMm: number;
  heightMm: number;
  depthMm: number;
  occupantId: string | null;
}
export interface PanelRecord {
  id: string;
  rackId: string;
  name: string;
  unit: number;
  units: number;
  face: Face;
  depthMm: number;
  slots: SlotRecord[];
}
export interface DeviceRecord {
  id: string;
  name: string;
  manufacturer?: string;
  model?: string;
  ip?: string;
  panelId?: string;
  slotId?: string;
  ports: PortRecord[];
}
export interface PortRecord {
  id: string;
  deviceId: string;
  label: string;
  type: ConnectorType;
  face: Face;
  localPositionMm: Point3;
  normal: Point3;
}
export interface CableRecord {
  id: string;
  fromPortId: string;
  toPortId: string;
  type: ConnectorType;
}

export const U_MM = 44.45;
export function standardWidthMm(standard: RackStandard) {
  return standard === 10 ? 254 : 482.6;
}
export function createEmptyRack(name: string, standard: RackStandard, units: number, depthMm: number): RackRecord {
  if (!name.trim()) throw new Error('Rack name required');
  if (!Number.isInteger(units) || units < 1 || units > 60) throw new Error('Invalid rack height');
  if (!Number.isFinite(depthMm) || depthMm < 100 || depthMm > 2000) throw new Error('Invalid rack depth');
  return { id: crypto.randomUUID(), name: name.trim(), standard, units, depthMm };
}
export function gridSlots(columns: number, rows: number, usableWidthMm: number, usableHeightMm: number, depthMm = 50): SlotRecord[] {
  if (![columns, rows].every(n => Number.isInteger(n) && n > 0) || columns * rows > 256)
    throw new Error('Panel grid must contain 1–256 slots');
  if (![usableWidthMm, usableHeightMm, depthMm].every(v => Number.isFinite(v) && v > 0))
    throw new Error('Invalid panel geometry');
  const cellW = usableWidthMm / columns;
  const cellH = usableHeightMm / rows;
  return Array.from({ length: columns * rows }, (_, i) => {
    const col = i % columns, row = Math.floor(i / columns);
    return {
      id: crypto.randomUUID(),
      name: 'Slot ' + (i + 1),
      localPositionMm: { x: (col + .5) * cellW - usableWidthMm / 2, y: usableHeightMm / 2 - (row + .5) * cellH, z: 0 },
      rotationDeg: { x: 0, y: 0, z: 0 },
      widthMm: cellW,
      heightMm: cellH,
      depthMm,
      occupantId: null
    };
  });
}
export function overlapsInRack(a: PanelRecord, b: PanelRecord, rack: RackRecord) {
  if (a.rackId !== b.rackId || a.rackId !== rack.id) return false;
  const verticalOverlap = a.unit <= b.unit + b.units - 1 && b.unit <= a.unit + a.units - 1;
  if (!verticalOverlap) return false;
  if (a.face === b.face) return true;
  return a.depthMm + b.depthMm > rack.depthMm;
}
export function validatePlacement(rack: RackRecord, panel: PanelRecord, others: PanelRecord[]): string[] {
  const errors: string[] = [];
  if (panel.unit < 1 || panel.units < 1 || panel.unit + panel.units - 1 > rack.units) errors.push('Panel outside rack units');
  if (panel.depthMm <= 0 || panel.depthMm > rack.depthMm) errors.push('Panel depth exceeds rack');
  if (others.some(other => other.id !== panel.id && overlapsInRack(panel, other, rack))) errors.push('Panel intersects another mount');
  return errors;
}
export function validateCable(from: PortRecord, to: PortRecord, existing: CableRecord[]) {
  if (from.id === to.id) return 'Choose two different ports';
  if (from.deviceId === to.deviceId) return 'Choose another device';
  if (from.type !== to.type) return 'Connector types do not match';
  if (existing.some(c => [c.fromPortId, c.toPortId].includes(from.id) || [c.fromPortId, c.toPortId].includes(to.id)))
    return 'One or both ports are already occupied';
  return null;
}
export function removeDevice(deviceId: string, devices: DeviceRecord[], panels: PanelRecord[], cables: CableRecord[]) {
  const target = devices.find(d => d.id === deviceId);
  if (!target) return { error: 'Device not found' } as const;
  if (cables.some(c => target.ports.some(p => p.id === c.fromPortId || p.id === c.toPortId)))
    return { error: 'Disconnect attached cables first' } as const;
  return {
    devices: devices.filter(d => d.id !== deviceId),
    panels: panels.map(p => ({ ...p, slots: p.slots.map(s => s.occupantId === deviceId ? { ...s, occupantId: null } : s) })),
    cables
  };
}
