export type ConnectionLocation = 'wall-floor' | 'wall-wall' | 'slab-beam' | 'beam-column' | 'base';

export interface ConnectionEstimate {
  location: ConnectionLocation;
  elementId: string;
  angleBrackets: number;
  holdDowns: number;
  screwCount: number;
  shearDemand: number;
  upliftDemand: number;
  estimatedCost: number;
}

export interface ConnectionSummary {
  totalAngleBrackets: number;
  totalHoldDowns: number;
  totalScrews: number;
  totalCost: number;
  details: ConnectionEstimate[];
}
