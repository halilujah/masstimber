export type StrengthClass = 'C14' | 'C16' | 'C18' | 'C22' | 'C24' | 'C27' | 'C30' | 'C35' | 'C40';
export type GlulamGrade = 'GL20h' | 'GL22h' | 'GL24h' | 'GL26h' | 'GL28h' | 'GL30h' | 'GL32h';
export type LoadDurationClass = 'permanent' | 'long-term' | 'medium-term' | 'short-term' | 'instantaneous';
export type ServiceClass = 1 | 2 | 3;

export interface TimberProperties {
  grade: string;
  fm_k: number;
  ft_0_k: number;
  ft_90_k: number;
  fc_0_k: number;
  fc_90_k: number;
  fv_k: number;
  E_0_mean: number;
  E_0_05: number;
  E_90_mean: number;
  G_mean: number;
  rho_k: number;
  rho_mean: number;
}

export interface CLTLayup {
  layers: number;
  thicknesses: number[];
  totalThickness: number;
  longitudinalLayers: number;
}

export interface CLTPanel {
  id: string;
  name: string;
  manufacturer: string;
  layup: CLTLayup;
  widthMax: number;
  lengthMax: number;
  timberGrade: StrengthClass;
  EI_eff: number;
  moment_capacity: number;
  weight: number;
  costPerM2: number;
  costPerM3: number;
}

export interface GlulamSection {
  id: string;
  name: string;
  manufacturer: string;
  grade: GlulamGrade;
  width: number;
  depth: number;
  properties: TimberProperties;
  momentCapacity: number;
  shearCapacity: number;
  weight: number;
  costPerM: number;
}

export interface Manufacturer {
  id: string;
  name: string;
  country: string;
  cltPanels: CLTPanel[];
  glulamSections: GlulamSection[];
}
