
export interface ApplianceAnalysis {
  appliance: string;
  estimatedConsumption: number;
  recommendation: string;
  potentialSavings: {
    kWh: number;
    cost: number;
  };
}

export interface ForecastDataPoint {
  hour: number;
  outputPercentage: number;
}

export interface RenewableAnalysis {
  bestOption: 'solar' | 'wind';
  forecast: ForecastDataPoint[];
  recommendations: string[];
}

export interface FullAnalysisResponse {
  applianceAnalysis: ApplianceAnalysis[];
  renewableAnalysis: RenewableAnalysis;
  actionPlan: string[];
}
