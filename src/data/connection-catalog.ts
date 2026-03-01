export interface ConnectorSpec {
  type: string;
  name: string;
  shearCapacity: number;
  tensionCapacity: number;
  screwsRequired: number;
  unitCost: number;
}

export const ANGLE_BRACKETS: ConnectorSpec[] = [
  { type: 'angle-bracket', name: 'ABR 90', shearCapacity: 15, tensionCapacity: 8, screwsRequired: 10, unitCost: 8 },
  { type: 'angle-bracket', name: 'ABR 105', shearCapacity: 20, tensionCapacity: 12, screwsRequired: 14, unitCost: 12 },
  { type: 'angle-bracket', name: 'ABR 155', shearCapacity: 30, tensionCapacity: 18, screwsRequired: 18, unitCost: 18 },
];

export const HOLD_DOWNS: ConnectorSpec[] = [
  { type: 'hold-down', name: 'HTT 22', shearCapacity: 10, tensionCapacity: 40, screwsRequired: 12, unitCost: 35 },
  { type: 'hold-down', name: 'HTT 40', shearCapacity: 15, tensionCapacity: 70, screwsRequired: 16, unitCost: 55 },
  { type: 'hold-down', name: 'HTT 80', shearCapacity: 20, tensionCapacity: 100, screwsRequired: 20, unitCost: 75 },
];
