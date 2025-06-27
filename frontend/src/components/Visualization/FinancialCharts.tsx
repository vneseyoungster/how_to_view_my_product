import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Tabs, 
  Tab, 
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { FinancialData, FinancialChartsProps } from './types';
import { CashFlowTrendChart } from './charts';
import IncomeBreakdownChart from './charts/IncomeBreakdownChart';
import { IncomeStatementData } from '../../types/incomeStatement';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Sample income statement data for testing
const sampleIncomeData: IncomeStatementData = {
  "2024": {
    "Q4": {
      "Net_Interest_Income": 15638753,
      "Net_Gains_from_Services": 1966665,
      "Total_Operating_Income": 33049950,
      "Total_Operating_Expenses": 9382068,
      "Provision_for_Credit_Losses": 7686946,
      "Profit_Before_Tax": 9336316,
      "Owners_Net_Profit": 7328333
    },
    "Q4_YTD": {
      "Net_Interest_Income": 58007600,
      "Net_Gains_from_Services": 7073571,
      "Total_Operating_Income": 134297047,
      "Total_Operating_Expenses": 27790446,
      "Provision_for_Credit_Losses": 21886528,
      "Profit_Before_Tax": 31383041,
      "Owners_Net_Profit": 24658253
    }
  },
  "2023": {
    "Q4": {
      "Net_Interest_Income": 14869089,
      "Net_Gains_from_Services": 1614305,
      "Total_Operating_Income": 20438612,
      "Total_Operating_Expenses": 7830729,
      "Provision_for_Credit_Losses": -4933966,
      "Profit_Before_Tax": 7825904,
      "Owners_Net_Profit": 6027424
    },
    "Q4_YTD": {
      "Net_Interest_Income": 56135566,
      "Net_Gains_from_Services": 6569870,
      "Total_Operating_Income": 123979377,
      "Total_Operating_Expenses": 25080598,
      "Provision_for_Credit_Losses": 20343515,
      "Profit_Before_Tax": 27588904,
      "Owners_Net_Profit": 21504918
    }
  }
};

// Sample data for demonstration - simplified for cash flow only
const sampleData: FinancialData = {
  periods: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'Q1 2025'],
  cashFlowOperating: [120000, 135000, 150000, 142000, 160000],
  cashInflows: {
    operatingActivities: [200000, 220000, 240000, 230000, 250000],
    investingActivities: [50000, 30000, 40000, 60000, 45000],
    financingActivities: [80000, 90000, 70000, 85000, 95000]
  },
  cashOutflows: {
    operatingActivities: [80000, 85000, 90000, 88000, 90000],
    investingActivities: [70000, 65000, 75000, 80000, 85000],
    financingActivities: [60000, 70000, 65000, 75000, 80000]
  },
  netIncomeComponents: {
    labels: [],
    values: []
  },
  profitBeforeTax: [180000, 195000, 210000, 205000, 225000],
  financialMetrics: {},
  incomeStatementData: sampleIncomeData
};

const FinancialCharts: React.FC<FinancialChartsProps> = ({ data = sampleData, loading }) => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Define tabs - Income Breakdown is now available
  const tabs = [
    { id: 0, label: "Financial Metrics", disabled: true },
    { id: 1, label: "Cash Flow Trend", disabled: false },
    { id: 2, label: "Cash Flow Components", disabled: true },
    { id: 3, label: "Income Breakdown", disabled: false }
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="financial chart tabs">
          {tabs.map((tab) => (
            <Tab key={tab.id} label={tab.label} disabled={tab.disabled} />
          ))}
        </Tabs>
      </Box>

      {/* Cash Flow Trend Chart */}
      {tabValue === 1 && (
        <CashFlowTrendChart data={data} />
      )}

      {/* Income Breakdown Chart */}
      {tabValue === 3 && (
        <Box>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Income Statement Analysis
            </Typography>
          </Box>
          <IncomeBreakdownChart 
            data={data.incomeStatementData || sampleIncomeData} 
          />
        </Box>
      )}
      
      {/* Show message for disabled tabs */}
      {(tabValue === 0 || tabValue === 2) && (
        <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
          This chart is currently unavailable. Cash Flow Trend and Income Breakdown are available.
        </Box>
      )}
    </Paper>
  );
};

export default FinancialCharts; 