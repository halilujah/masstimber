import type { CostParameters } from '@/types/cost';

export const DEFAULT_COST_PARAMETERS: CostParameters = {
  cltCostPerM3: 700,
  glulamCostPerM3: 900,
  installationFactor: 1.35,
  wasteFactor: 1.08,
  angleBracketCost: 12,
  holdDownCost: 45,
  screwCostPer100: 18,
  designFee: 5000,
  transportCostPerM3: 60,
  craneCostPerDay: 800,
  estimatedInstallDays: 10,
};
