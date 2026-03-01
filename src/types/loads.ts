export type LoadCaseType = 'dead' | 'live' | 'wind' | 'seismic';
export type LiveLoadCategory = 'A' | 'B' | 'C1' | 'C2' | 'C3' | 'D' | 'E';
export type TerrainCategory = '0' | 'I' | 'II' | 'III' | 'IV';
export type SoilType = 'A' | 'B' | 'C' | 'D' | 'E';

export interface DeadLoadInput {
  additionalPermanent: number;
}

export interface LiveLoadInput {
  category: LiveLoadCategory;
  customValue?: number;
}

export interface WindLoadInput {
  basicWindSpeed: number;
  terrainCategory: TerrainCategory;
  orography: number;
}

export interface SeismicLoadInput {
  enabled: boolean;
  agR: number;
  soilType: SoilType;
  importanceClass: 1 | 2 | 3 | 4;
  qFactor: number;
}

export interface LoadDefinition {
  dead: DeadLoadInput;
  live: LiveLoadInput;
  wind: WindLoadInput;
  seismic: SeismicLoadInput;
}

export interface LoadCombination {
  id: string;
  name: string;
  type: 'ULS' | 'SLS';
  factors: {
    dead: number;
    live: number;
    wind: number;
    seismic: number;
  };
  resultant: {
    verticalLoad: number;
    lateralForce: number;
  };
}
