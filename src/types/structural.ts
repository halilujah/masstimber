export type CheckStatus = 'pass' | 'warning' | 'fail';

export interface UtilizationResult {
  ratio: number;
  status: CheckStatus;
  demand: number;
  capacity: number;
  unit: string;
  formula: string;
}

export interface SlabCheckResult {
  elementId: string;
  storyIndex: number;
  span: number;
  selectedPanel: string;
  bending: UtilizationResult;
  deflection: UtilizationResult;
  vibration: UtilizationResult;
  governing: 'bending' | 'deflection' | 'vibration';
}

export interface BeamCheckResult {
  elementId: string;
  storyIndex: number;
  span: number;
  selectedSection: string;
  bending: UtilizationResult;
  shear: UtilizationResult;
  deflection: UtilizationResult;
  governing: 'bending' | 'shear' | 'deflection';
}

export interface ColumnCheckResult {
  elementId: string;
  storyIndex: number;
  height: number;
  selectedSection: string;
  compression: UtilizationResult;
  buckling: UtilizationResult;
  governing: 'compression' | 'buckling';
}

export interface WallCheckResult {
  wallId: string;
  storyIndex: number;
  inPlaneShear: UtilizationResult;
  compression: UtilizationResult;
  governing: 'shear' | 'compression';
}

export interface LateralCheckResult {
  baseShear: number;
  storyForces: number[];
  storyDrifts: number[];
  driftRatios: number[];
  maxDriftRatio: number;
  driftLimit: number;
  status: CheckStatus;
}

export interface StructuralResults {
  slabs: SlabCheckResult[];
  beams: BeamCheckResult[];
  columns: ColumnCheckResult[];
  walls: WallCheckResult[];
  lateral: LateralCheckResult | null;
  timestamp: number;
}
