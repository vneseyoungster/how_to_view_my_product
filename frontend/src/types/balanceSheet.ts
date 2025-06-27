// Balance Sheet Types
// TODO: Define balance sheet specific types

export interface FinancialAssetValue {
  value: number;
  currency: string;
  unit: string;
}

export interface YearlyBalanceSheetData {
  TotalCompanyFinancialAssets: FinancialAssetValue;
  BadDebtsWrittenOff: FinancialAssetValue;
  TotalInvestorFinancialAssets: FinancialAssetValue;
  InvestorListedAssets: FinancialAssetValue;
  InvestorListedAssets_Unrestricted: FinancialAssetValue;
  InvestorListedAssets_Restricted: FinancialAssetValue;
  InvestorListedAssets_Mortgaged: FinancialAssetValue;
  InvestorNonTradedAssets: FinancialAssetValue;
}

export interface OffBalanceSheetAnalysis {
  [year: string]: YearlyBalanceSheetData;
}

export interface BalanceSheetData {
  OffBalanceSheetAnalysis: OffBalanceSheetAnalysis;
}

export interface BalanceSheetMetrics {
  totalCompanyAssets?: number;
  totalInvestorAssets?: number;
  badDebtsWrittenOff?: number;
  listedAssetsBreakdown?: {
    unrestricted: number;
    restricted: number;
    mortgaged: number;
  };
  nonTradedAssets?: number;
  yearOverYearGrowth?: {
    companyAssets: number;
    investorAssets: number;
  };
}

// New quarterly balance sheet data structure interfaces
export interface BalanceSheetQuarterlyMetrics {
  Total_Assets: number | null;
  Total_Liabilities: number | null;
  Total_Equity: number | null;
}

export interface BalanceSheetYearlyData {
  [quarter: string]: BalanceSheetQuarterlyMetrics; // e.g., "Q1", "Q2"
}

export interface BalanceSheetRawData {
  [year: string]: BalanceSheetYearlyData; // e.g., "2023", "2022"
}

export interface ProcessedBalanceSheetData {
  period: string; // "Q4 2023"
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
} 