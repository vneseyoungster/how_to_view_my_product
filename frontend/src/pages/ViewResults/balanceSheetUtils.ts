// Balance Sheet Data Processing Utilities

import { 
  BalanceSheetRawData, 
  ProcessedBalanceSheetData as NewProcessedBalanceSheetData
} from '../../types/balanceSheet';

// Chart data structure for react-chartjs-2
export interface ChartDataset {
  label: string;
  data: number[];
  stack: string;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
}

export interface ComparisonChartData {
  labels: string[];
  datasets: ChartDataset[];
  dataQuality?: {
    [period: string]: {
      hasCompleteData: boolean;
      missingFields: string[];
      calculatedFields: string[];
    };
  };
}

// Process the new quarterly balance sheet data structure
export const processQuarterlyBalanceSheetData = (rawData: BalanceSheetRawData): NewProcessedBalanceSheetData[] => {
  const processedData: NewProcessedBalanceSheetData[] = [];

  // Iterate through years and quarters
  Object.entries(rawData).forEach(([year, yearData]) => {
    Object.entries(yearData).forEach(([quarter, quarterMetrics]) => {
      // Include periods with at least Total_Assets or significant data
      if (quarterMetrics.Total_Assets !== null && 
          quarterMetrics.Total_Assets > 0) {
        
        // Handle null values gracefully
        const totalAssets = quarterMetrics.Total_Assets;
        const totalLiabilities = quarterMetrics.Total_Liabilities || 0;
        
        // Calculate equity if missing but we have assets and liabilities
        let totalEquity = quarterMetrics.Total_Equity;
        if (totalEquity === null && quarterMetrics.Total_Liabilities !== null) {
          totalEquity = totalAssets - quarterMetrics.Total_Liabilities;
        } else if (totalEquity === null) {
          totalEquity = 0;
        }

        processedData.push({
          period: `${quarter} ${year}`,
          totalAssets: totalAssets,
          totalLiabilities: totalLiabilities,
          totalEquity: totalEquity
        });
      }
    });
  });

  // Sort chronologically (earliest first)
  processedData.sort((a, b) => {
    const [quarterA, yearA] = a.period.split(' ');
    const [quarterB, yearB] = b.period.split(' ');
    
    const yearDiff = parseInt(yearA) - parseInt(yearB);
    if (yearDiff !== 0) return yearDiff;
    
    const quarterOrder: { [key: string]: number } = { Q1: 1, Q2: 2, Q3: 3, Q4: 4 };
    return quarterOrder[quarterA] - quarterOrder[quarterB];
  });

  return processedData;
};

// Get available periods for dropdown selection
export const getAvailablePeriods = (processedData: NewProcessedBalanceSheetData[]): string[] => {
  return processedData.map(data => data.period);
};

// Get the most recent periods for default selection
export const getDefaultPeriods = (processedData: NewProcessedBalanceSheetData[]): [string?, string?] => {
  if (processedData.length === 0) return [undefined, undefined];
  if (processedData.length === 1) return [processedData[0].period, undefined];
  
  // Return the two most recent periods
  const sortedDesc = [...processedData].reverse();
  return [sortedDesc[0].period, sortedDesc[1].period];
};

// Generate comparison chart data for two selected periods with data quality information
export const getComparisonChartData = (
  processedData: NewProcessedBalanceSheetData[], 
  period1: string, 
  period2: string,
  rawData?: BalanceSheetRawData
): ComparisonChartData => {
  const data1 = processedData.find(d => d.period === period1);
  const data2 = processedData.find(d => d.period === period2);

  if (!data1 || !data2) {
    return {
      labels: [],
      datasets: []
    };
  }

  // Calculate data quality if raw data is provided
  let dataQuality: ComparisonChartData['dataQuality'] = undefined;
  if (rawData) {
    dataQuality = {};
    
    [period1, period2].forEach(period => {
      const [quarter, year] = period.split(' ');
      const quarterData = rawData[year]?.[quarter];
      
      if (quarterData) {
        const missingFields: string[] = [];
        const calculatedFields: string[] = [];
        
        if (quarterData.Total_Liabilities === null) {
          missingFields.push('Total Liabilities');
        }
        if (quarterData.Total_Equity === null) {
          if (quarterData.Total_Liabilities !== null) {
            calculatedFields.push('Total Equity');
          } else {
            missingFields.push('Total Equity');
          }
        }
        
        if (dataQuality) {
          dataQuality[period] = {
            hasCompleteData: missingFields.length === 0 && calculatedFields.length === 0,
            missingFields,
            calculatedFields
          };
        }
      }
    });
  }

  return {
    labels: [period1, period2],
    datasets: [
      // Total Assets (separate stack)
      {
        label: 'Total Assets',
        data: [data1.totalAssets, data2.totalAssets],
        stack: 'Assets',
        backgroundColor: '#4caf50',
        borderColor: '#4caf50',
        borderWidth: 1
      },
      // Total Liabilities (stacked with Equity)
      {
        label: 'Total Liabilities',
        data: [data1.totalLiabilities, data2.totalLiabilities],
        stack: 'Liabilities & Equity',
        backgroundColor: '#f44336',
        borderColor: '#f44336',
        borderWidth: 1
      },
      // Total Equity (stacked with Liabilities)
      {
        label: 'Total Equity',
        data: [data1.totalEquity, data2.totalEquity],
        stack: 'Liabilities & Equity',
        backgroundColor: '#2196f3',
        borderColor: '#2196f3',
        borderWidth: 1
      }
    ],
    dataQuality
  };
};

// Overview chart data structure for displaying all quarters
export interface OverviewChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    dataQuality?: string[];
  }[];
  dataQuality: { [period: string]: { hasEstimated: boolean; missingFields: string[] } };
}

// Generate overview chart data showing all quarters in stacked format
export const getOverviewChartData = (
  processedData: NewProcessedBalanceSheetData[],
  rawData?: BalanceSheetRawData
): OverviewChartData => {
  if (processedData.length === 0) {
    return {
      labels: [],
      datasets: [],
      dataQuality: {}
    };
  }

  // Extract periods and data for chart
  const labels = processedData.map(data => data.period);
  const assetsData = processedData.map(data => data.totalAssets);
  const liabilitiesData = processedData.map(data => data.totalLiabilities);
  const equityData = processedData.map(data => data.totalEquity);

  // Calculate data quality information
  const dataQuality: { [period: string]: { hasEstimated: boolean; missingFields: string[] } } = {};
  
  if (rawData) {
    processedData.forEach(data => {
      const [quarter, year] = data.period.split(' ');
      const quarterData = rawData[year]?.[quarter];
      
      if (quarterData) {
        const missingFields: string[] = [];
        
        if (quarterData.Total_Assets === null) {
          missingFields.push('Total Assets');
        }
        if (quarterData.Total_Liabilities === null) {
          missingFields.push('Total Liabilities');
        }
        if (quarterData.Total_Equity === null) {
          missingFields.push('Total Equity');
        }
        
        dataQuality[data.period] = {
          hasEstimated: missingFields.length > 0,
          missingFields
        };
      } else {
        dataQuality[data.period] = {
          hasEstimated: false,
          missingFields: []
        };
      }
    });
  }

  return {
    labels,
    datasets: [
      // Total Assets (separate stack in green)
      {
        label: 'Total Assets',
        data: assetsData,
        backgroundColor: '#4caf50',
        borderColor: '#4caf50',
        borderWidth: 1
      },
      // Total Liabilities (bottom of L&E stack)
      {
        label: 'Total Liabilities',
        data: liabilitiesData,
        backgroundColor: '#f44336',
        borderColor: '#f44336',
        borderWidth: 1
      },
      // Total Equity (top of L&E stack)
      {
        label: 'Total Equity',
        data: equityData,
        backgroundColor: '#2196f3',
        borderColor: '#2196f3',
        borderWidth: 1
      }
    ],
    dataQuality
  };
};

// Currency formatting utility
export const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toLocaleString()}`;
};

// Legacy data processing (kept for backward compatibility)
interface QuarterData {
  Total_Current_Assets: number | null;
  Total_Non_Current_Assets: number | null;
  Total_Current_Liabilities: number | null;
  Total_Non_Current_Liabilities: number | null;
}

interface YearData {
  Q1: QuarterData;
  Q2: QuarterData;
  Q3: QuarterData;
  Q4: QuarterData;
}

export interface BalanceSheetData {
  [year: string]: YearData;
}

interface CalculatedMetrics {
  totalAssets: number;
  totalLiabilities: number;
  shareholdersEquity: number;
}

interface ProcessedQuarter {
  period: string;
  year: string;
  quarter: string;
  currentAssets: number;
  nonCurrentAssets: number;
  currentLiabilities: number;
  nonCurrentLiabilities: number;
  metrics: CalculatedMetrics;
}

export interface ProcessedBalanceSheetData {
  comparisonData: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      stack: string;
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
    }>;
  };
  trendData: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      tension: number;
      pointRadius: number;
      pointHoverRadius: number;
    }>;
  };
  availableQuarters: ProcessedQuarter[];
}

// Calculate metrics for a single quarter (legacy)
export const calculateMetrics = (quarterData: QuarterData): CalculatedMetrics | null => {
  if (
    quarterData.Total_Current_Assets === null ||
    quarterData.Total_Non_Current_Assets === null ||
    quarterData.Total_Current_Liabilities === null ||
    quarterData.Total_Non_Current_Liabilities === null
  ) {
    return null;
  }

  const totalAssets = quarterData.Total_Current_Assets + quarterData.Total_Non_Current_Assets;
  const totalLiabilities = quarterData.Total_Current_Liabilities + quarterData.Total_Non_Current_Liabilities;
  const shareholdersEquity = totalAssets - totalLiabilities;

  return {
    totalAssets,
    totalLiabilities,
    shareholdersEquity
  };
};

// Process balance sheet data for both charts (legacy)
export const processBalanceSheetData = (data: BalanceSheetData): ProcessedBalanceSheetData => {
  const availableQuarters: ProcessedQuarter[] = [];

  // Extract all quarters with valid data
  Object.entries(data).forEach(([year, yearData]) => {
    Object.entries(yearData).forEach(([quarter, quarterData]) => {
      const metrics = calculateMetrics(quarterData);
      if (metrics && quarterData.Total_Current_Assets !== null && quarterData.Total_Non_Current_Assets !== null) {
        availableQuarters.push({
          period: `${quarter} ${year}`,
          year,
          quarter,
          currentAssets: quarterData.Total_Current_Assets,
          nonCurrentAssets: quarterData.Total_Non_Current_Assets,
          currentLiabilities: quarterData.Total_Current_Liabilities!,
          nonCurrentLiabilities: quarterData.Total_Non_Current_Liabilities!,
          metrics
        });
      }
    });
  });

  // Sort quarters chronologically
  availableQuarters.sort((a, b) => {
    const yearDiff = parseInt(a.year) - parseInt(b.year);
    if (yearDiff !== 0) return yearDiff;
    
    const quarterOrder = { Q1: 1, Q2: 2, Q3: 3, Q4: 4 };
    return quarterOrder[a.quarter as keyof typeof quarterOrder] - quarterOrder[b.quarter as keyof typeof quarterOrder];
  });

  // Prepare comparison data for Q4 2021 and Q2 2022
  const q4_2021 = availableQuarters.find(q => q.year === '2021' && q.quarter === 'Q4');
  const q2_2022 = availableQuarters.find(q => q.year === '2022' && q.quarter === 'Q2');

  const comparisonData = {
    labels: ['Q2 2022', 'Q4 2021'],
    datasets: [
      // Assets group
      {
        label: 'Current Assets',
        data: [q2_2022?.currentAssets || 0, q4_2021?.currentAssets || 0],
        stack: 'Assets',
        backgroundColor: '#4caf50',
        borderColor: '#4caf50',
        borderWidth: 1
      },
      {
        label: 'Non-Current Assets',
        data: [q2_2022?.nonCurrentAssets || 0, q4_2021?.nonCurrentAssets || 0],
        stack: 'Assets',
        backgroundColor: '#81c784',
        borderColor: '#81c784',
        borderWidth: 1
      },
      // Liabilities group
      {
        label: 'Current Liabilities',
        data: [q2_2022?.currentLiabilities || 0, q4_2021?.currentLiabilities || 0],
        stack: 'Liabilities',
        backgroundColor: '#f44336',
        borderColor: '#f44336',
        borderWidth: 1
      },
      {
        label: 'Non-Current Liabilities',
        data: [q2_2022?.nonCurrentLiabilities || 0, q4_2021?.nonCurrentLiabilities || 0],
        stack: 'Liabilities',
        backgroundColor: '#e57373',
        borderColor: '#e57373',
        borderWidth: 1
      }
    ]
  };

  // Prepare trend data
  const trendLabels = availableQuarters.map(q => q.period);
  const totalAssetsData = availableQuarters.map(q => q.metrics.totalAssets);
  const totalLiabilitiesData = availableQuarters.map(q => q.metrics.totalLiabilities);
  const shareholdersEquityData = availableQuarters.map(q => q.metrics.shareholdersEquity);

  const trendData = {
    labels: trendLabels,
    datasets: [
      {
        label: 'Total Assets',
        data: totalAssetsData,
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        tension: 0.1,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'Total Liabilities',
        data: totalLiabilitiesData,
        borderColor: '#f44336',
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        tension: 0.1,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: "Shareholder's Equity",
        data: shareholdersEquityData,
        borderColor: '#2196f3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        tension: 0.1,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  return {
    comparisonData,
    trendData,
    availableQuarters
  };
}; 