export interface CostParameters {
  cltCostPerM3: number;
  glulamCostPerM3: number;
  installationFactor: number;
  wasteFactor: number;
  angleBracketCost: number;
  holdDownCost: number;
  screwCostPer100: number;
  designFee: number;
  transportCostPerM3: number;
  craneCostPerDay: number;
  estimatedInstallDays: number;
}

export interface CostLineItem {
  category: string;
  description: string;
  quantity: number;
  unit: string;
  unitCost: number;
  subtotal: number;
}

export interface CostBreakdown {
  lineItems: CostLineItem[];
  materialCost: number;
  connectionCost: number;
  installationCost: number;
  wasteCost: number;
  transportCost: number;
  totalStructuralCost: number;
  costPerM2: number;
  costPerM3: number;
}
