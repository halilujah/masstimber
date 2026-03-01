export type UIMode = 'feasibility' | 'engineer';

export type ModuleId =
  | 'dashboard'
  | 'geometry'
  | 'loads'
  | 'structural'
  | 'optimization'
  | 'library'
  | 'connections'
  | 'cost'
  | 'reporting';

export interface ProjectSettings {
  name: string;
  description: string;
  location: string;
  createdAt: string;
  modifiedAt: string;
  uiMode: UIMode;
  selectedManufacturer: string;
}
