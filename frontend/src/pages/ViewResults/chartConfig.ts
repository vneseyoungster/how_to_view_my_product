import React from 'react';

// Define chart types available for each document type
export type ChartType = 
  | 'financial-metrics'
  | 'cash-flow-trend'
  | 'cash-flow-components'
  | 'income-breakdown'
  | 'asset-allocation'
  | 'liability-breakdown'
  | 'balance-sheet-comparison'
  | 'profit-margins'
  | 'expense-analysis';

// Chart configuration interface
export interface ChartConfig {
  id: ChartType;
  label: string;
  description: string;
  requiredDataFields: string[];
  component?: React.ComponentType<any>;
}

// Document type to chart mapping
export const DOCUMENT_CHART_MAPPING: Record<string, ChartType[]> = {
  'balance-sheet': [
    'financial-metrics',
    'asset-allocation',
    'liability-breakdown',
    'balance-sheet-comparison'
  ],
  'cash-flow': [
    'cash-flow-trend'
  ],
  'income-statement': [
    'income-breakdown',
    'profit-margins',
    'expense-analysis',
    'financial-metrics'
  ]
};

// Chart configurations
export const CHART_CONFIGS: Record<ChartType, ChartConfig> = {
  'financial-metrics': {
    id: 'financial-metrics',
    label: 'Financial Metrics',
    description: 'Key financial metrics and ratios',
    requiredDataFields: ['financialMetrics']
  },
  'cash-flow-trend': {
    id: 'cash-flow-trend',
    label: 'Cash Flow Trend',
    description: 'Cash flow trends over time',
    requiredDataFields: ['periods', 'cashFlowOperating']
  },
  'cash-flow-components': {
    id: 'cash-flow-components',
    label: 'Cash Flow Components',
    description: 'Breakdown of cash flow by activities',
    requiredDataFields: ['cashInflows', 'cashOutflows']
  },
  'income-breakdown': {
    id: 'income-breakdown',
    label: 'Income Breakdown',
    description: 'Income statement component analysis',
    requiredDataFields: ['incomeStatementData']
  },
  'asset-allocation': {
    id: 'asset-allocation',
    label: 'Asset Allocation',
    description: 'Distribution of assets by category',
    requiredDataFields: ['financialMetrics']
  },
  'liability-breakdown': {
    id: 'liability-breakdown',
    label: 'Liability Breakdown',
    description: 'Analysis of liabilities by type',
    requiredDataFields: ['financialMetrics']
  },
  'balance-sheet-comparison': {
    id: 'balance-sheet-comparison',
    label: 'Balance Sheet Comparison',
    description: 'Period-over-period balance sheet comparison',
    requiredDataFields: ['financialMetrics', 'periods']
  },
  'profit-margins': {
    id: 'profit-margins',
    label: 'Profit Margins',
    description: 'Profit margin analysis and trends',
    requiredDataFields: ['incomeStatementData', 'financialMetrics']
  },
  'expense-analysis': {
    id: 'expense-analysis',
    label: 'Expense Analysis',
    description: 'Operating expense breakdown and trends',
    requiredDataFields: ['incomeStatementData']
  }
};

// Get available charts for a document type
export const getChartsForDocumentType = (documentType: string): ChartConfig[] => {
  const chartTypes = DOCUMENT_CHART_MAPPING[documentType] || [];
  return chartTypes.map(type => CHART_CONFIGS[type]);
};

// Check if required data is available for a chart
export const isChartDataAvailable = (
  chartConfig: ChartConfig, 
  data: any
): boolean => {
  // Special handling for cash flow charts
  if (chartConfig.id === 'cash-flow-trend') {
    // Check if we have periods and any cash flow data
    const hasPeriods = data.periods && Array.isArray(data.periods) && data.periods.length > 0;
    const hasCashFlowData = (
      (data.cashFlowOperating && Array.isArray(data.cashFlowOperating) && data.cashFlowOperating.length > 0) ||
      (data.cashInflows && data.cashInflows.operatingActivities && Array.isArray(data.cashInflows.operatingActivities) && data.cashInflows.operatingActivities.length > 0)
    );
    

    
    return hasPeriods && hasCashFlowData;
  }
  
  // Special handling for cash flow components chart
  if (chartConfig.id === 'cash-flow-components') {
    const hasInflows = data.cashInflows && 
      typeof data.cashInflows === 'object' &&
      (Array.isArray(data.cashInflows.operatingActivities) || 
       Array.isArray(data.cashInflows.investingActivities) || 
       Array.isArray(data.cashInflows.financingActivities));
    

    
    return hasInflows;
  }
  
  // Default checking logic for other charts
  return chartConfig.requiredDataFields.every(field => {
    const value = data[field];
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    if (typeof value === 'object' && value !== null) {
      return Object.keys(value).length > 0;
    }
    return value !== undefined && value !== null;
  });
};

// Get enabled charts based on available data
export const getEnabledCharts = (
  documentType: string,
  data: any
): ChartConfig[] => {
  const availableCharts = getChartsForDocumentType(documentType);
  return availableCharts.filter(chart => isChartDataAvailable(chart, data));
};

// Tab configuration for charts
export interface ChartTab {
  id: number;
  chartType: ChartType;
  label: string;
  disabled: boolean;
}

// Convert chart configs to tabs
export const getChartTabs = (
  documentType: string,
  data: any
): ChartTab[] => {
  const charts = getChartsForDocumentType(documentType);
  return charts.map((chart, index) => ({
    id: index,
    chartType: chart.id,
    label: chart.label,
    disabled: !isChartDataAvailable(chart, data)
  }));
}; 