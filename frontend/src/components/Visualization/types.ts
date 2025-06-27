// Backend cash flow data structure - Updated for nested quarters
export interface CashFlowQuarterData {
  Net_Operation: number | null;
  Net_Investing: number | null;
  Net_Financing: number | null;
  Profit_Before_Tax: number | null;
}

// Backend cash flow data structure - Year with quarters
export interface CashFlowYearData {
  [quarter: string]: CashFlowQuarterData; // e.g., "Q4_YTD", "Q3_YTD"
}

// Backend cash flow data format (year-keyed object with nested quarters)
export interface BackendCashFlowData {
  [year: string]: CashFlowYearData;
}

// Import income statement types
import { IncomeStatementData } from '../../types/incomeStatement';

export interface FinancialData {
  // This would be replaced with actual data structure from your backend
  periods: string[];
  cashFlowOperating: number[];
  cashInflows: {
    operatingActivities: number[];
    investingActivities: number[];
    financingActivities: number[];
  };
  cashOutflows: {
    operatingActivities: number[];
    investingActivities: number[];
    financingActivities: number[];
  };
  netIncomeComponents: {
    labels: string[];
    values: number[];
  };
  // Profit before tax data for additional chart line
  profitBeforeTax?: number[];
  // New financial metrics that match the provided JSON structure
  financialMetrics?: Record<string, {
    value: number | string;
    from?: string;
    to?: string;
  }>;
  // Raw backend cash flow data (optional, for transformation)
  backendCashFlowData?: BackendCashFlowData;
  // Income statement data for period comparisons
  incomeStatementData?: IncomeStatementData;
}

export interface FinancialChartsProps {
  data?: FinancialData;
  loading: boolean;
  documentTypes?: string[];
}

export interface ChartContainerProps {
  loading?: boolean;
  emptyMessage?: string;
  height?: number;
  children: React.ReactNode;
}

// Utility function to transform backend cash flow data to chart format
export const transformBackendCashFlowData = (backendData: BackendCashFlowData): Partial<FinancialData> => {
  
  const periods: string[] = [];
  const netOperationData: number[] = [];
  const netInvestingData: number[] = [];
  const netFinancingData: number[] = [];
  const profitBeforeTaxData: number[] = [];

  // Sort years in ascending order to show chronological timeline
  const years = Object.keys(backendData).sort((a, b) => parseInt(a) - parseInt(b));
  
  // Flatten the nested structure: year -> quarter -> data
  years.forEach(year => {
    const yearData = backendData[year];
    
    // Sort quarters logically: Q1, Q2, Q3, Q4, Q1_YTD, Q2_YTD, Q3_YTD, Q4_YTD
    const quarters = Object.keys(yearData).sort((a, b) => {
      // Extract quarter number and YTD status
      const getQuarterInfo = (quarter: string) => {
        const match = quarter.match(/Q(\d+)(_YTD)?/);
        if (!match) return { num: 0, isYTD: false };
        return {
          num: parseInt(match[1]),
          isYTD: match[2] === '_YTD'
        };
      };
      
      const aInfo = getQuarterInfo(a);
      const bInfo = getQuarterInfo(b);
      
      // First sort by quarter number
      if (aInfo.num !== bInfo.num) {
        return aInfo.num - bInfo.num;
      }
      
      // If same quarter number, non-YTD comes before YTD
      if (aInfo.isYTD !== bInfo.isYTD) {
        return aInfo.isYTD ? 1 : -1;
      }
      
      return 0;
    });
    
    quarters.forEach(quarter => {
      const quarterData = yearData[quarter];
      
      // Only include data points that have at least one non-null value
      const hasData = quarterData.Net_Operation !== null || 
                     quarterData.Net_Investing !== null || 
                     quarterData.Net_Financing !== null || 
                     quarterData.Profit_Before_Tax !== null;
      
      if (hasData) {
        // Create period label: "2024 Q4" for regular quarters, "2024 Q4 YTD" for YTD quarters
        const isYTD = quarter.includes('_YTD');
        const quarterNum = quarter.replace('_YTD', '');
        const periodLabel = `${year} ${quarterNum}${isYTD ? ' YTD' : ''}`;
        periods.push(periodLabel);
        
        // Use 0 for null values to maintain chart continuity
        netOperationData.push(quarterData.Net_Operation || 0);
        netInvestingData.push(quarterData.Net_Investing || 0);
        netFinancingData.push(quarterData.Net_Financing || 0);
        profitBeforeTaxData.push(quarterData.Profit_Before_Tax || 0);
      }
    });
  });

  // Data is already in chronological order (oldest to newest), no need to reverse
  
  const transformedData = {
    periods,
    cashFlowOperating: netOperationData, // Use Net_Operation for operating cash flow
    cashInflows: {
      operatingActivities: netOperationData, // Use actual Net_Operation values
      investingActivities: netInvestingData, // Use actual Net_Investing values  
      financingActivities: netFinancingData // Use actual Net_Financing values
    },
    // Store profit before tax data for additional chart line
    profitBeforeTax: profitBeforeTaxData,
    cashOutflows: {
      operatingActivities: [], // Not needed for multiple line chart
      investingActivities: [],
      financingActivities: []
    },
    netIncomeComponents: {
      labels: ['Net Operation', 'Net Investing', 'Net Financing', 'Profit Before Tax'],
      values: [
        netOperationData[netOperationData.length - 1] || 0,
        netInvestingData[netInvestingData.length - 1] || 0,
        netFinancingData[netFinancingData.length - 1] || 0,
        profitBeforeTaxData[profitBeforeTaxData.length - 1] || 0
      ]
    },
    backendCashFlowData: backendData
  };
  
  return transformedData;
}; 