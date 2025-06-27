// Income Statement Types
// TODO: Define income statement specific types

export interface IncomeStatementQuarterData {
  Total_Income: number | null;
  Total_Expenses: number | null;
  Gross_Profit: number | null;
  Profit_Before_Tax: number | null;
  Profit_After_Tax: number | null;
}

export interface IncomeStatementData {
  [year: string]: {
    [quarter: string]: IncomeStatementQuarterData;
  };
}

export interface IncomeStatementMetrics {
  // Income statement specific financial metrics
  totalRevenue?: number;
  totalExpenses?: number;
  netProfit?: number;
  profitMargin?: number;
  operatingMargin?: number;
  interestIncomeGrowth?: number;
  yearOverYearGrowth?: {
    netInterestIncome: number;
    totalOperatingIncome: number;
    ownersNetProfit: number;
  };
} 