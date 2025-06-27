// Cash Flow Types
// TODO: Define cash flow specific types

export interface CashFlowYearData {
  Net_Operation: number;
  Net_Investing: number;
  Net_Financing: number;
  Profit_Before_Tax: number;
  Time_Duration: string;
}

export interface CashFlowData {
  [year: string]: CashFlowYearData;
}

export interface CashFlowMetrics {
  totalYears: number;
  years: string[];
  netOperationTrend: number[];
  netInvestingTrend: number[];
  netFinancingTrend: number[];
  profitBeforeTaxTrend: number[];
  averageNetOperation: number;
  averageNetInvesting: number;
  averageNetFinancing: number;
  averageProfitBeforeTax: number;
}

export interface CashFlowChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
  }[];
}

export interface CashFlowSummary {
  strongestCashFlowYear: string;
  weakestCashFlowYear: string;
  totalNetCashFlow: number;
  operatingCashFlowTrend: 'increasing' | 'decreasing' | 'stable';
  investingCashFlowTrend: 'increasing' | 'decreasing' | 'stable';
  financingCashFlowTrend: 'increasing' | 'decreasing' | 'stable';
} 