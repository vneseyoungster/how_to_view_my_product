import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Tabs, 
  Tab, 
  CircularProgress,
  Typography,
  Alert
} from '@mui/material';
import { FinancialData } from '../../components/Visualization/types';
import { CashFlowTrendChart } from '../../components/Visualization/charts';
import IncomeBreakdownChart from '../../components/Visualization/charts/IncomeBreakdownChart';
import { getChartTabs, ChartType } from './chartConfig';

interface DocumentSpecificChartsProps {
  documentType: string;
  data: FinancialData;
  loading?: boolean;
}

// Map chart types to their components
const CHART_COMPONENTS: Partial<Record<ChartType, React.ComponentType<any>>> = {
  'cash-flow-trend': CashFlowTrendChart,
  'income-breakdown': IncomeBreakdownChart,
  // Add more chart components as they become available
};

export const DocumentSpecificCharts: React.FC<DocumentSpecificChartsProps> = ({
  documentType,
  data,
  loading = false
}) => {
  const [selectedTab, setSelectedTab] = useState(0);
  
  // Get chart tabs for this document type
  const chartTabs = getChartTabs(documentType, data);
  
  // Find the first enabled tab
  const firstEnabledTab = chartTabs.findIndex(tab => !tab.disabled);
  const [activeTab, setActiveTab] = useState(firstEnabledTab >= 0 ? firstEnabledTab : 0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Check if we have any charts available
  const hasEnabledCharts = chartTabs.some(tab => !tab.disabled);

  if (chartTabs.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No charts are configured for {documentType} documents.
      </Alert>
    );
  }

  if (!hasEnabledCharts) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        No data available to display charts for {documentType} documents.
      </Alert>
    );
  }

  const activeChart = chartTabs[activeTab];
  const ChartComponent = activeChart ? CHART_COMPONENTS[activeChart.chartType] : null;

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mt: 3 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          aria-label={`${documentType} financial charts`}
          variant="scrollable"
          scrollButtons="auto"
        >
          {chartTabs.map((tab) => (
            <Tab 
              key={tab.id} 
              label={tab.label} 
              disabled={tab.disabled}
            />
          ))}
        </Tabs>
      </Box>

      <Box sx={{ minHeight: 400 }}>
        {activeChart && ChartComponent ? (
          <Box>
            {/* Render the appropriate chart component */}
            {activeChart.chartType === 'cash-flow-trend' && (
              <CashFlowTrendChart data={data} />
            )}
            {activeChart.chartType === 'income-breakdown' && (
              <Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6">
                    Income Statement Analysis
                  </Typography>
                </Box>
                <IncomeBreakdownChart 
                  data={data.incomeStatementData || {}} 
                />
              </Box>
            )}
            {/* Placeholder for charts that don't have components yet */}
            {!ChartComponent && (
              <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                <Typography variant="body1" gutterBottom>
                  {activeChart.label} Chart
                </Typography>
                <Typography variant="body2">
                  This chart visualization is coming soon.
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
            <Typography>
              No chart selected or chart component not available.
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default DocumentSpecificCharts; 