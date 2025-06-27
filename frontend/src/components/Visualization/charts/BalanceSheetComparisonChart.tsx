import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

import { Box, FormControl, InputLabel, Select, MenuItem, Typography, Grid, Alert } from '@mui/material';
import ChartContainer from './ChartContainer';
import { formatCurrency, ComparisonChartData } from '../../../pages/ViewResults/balanceSheetUtils';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BalanceSheetComparisonChartProps {
  data: ComparisonChartData;
  availablePeriods: string[];
  selectedPeriod1: string;
  selectedPeriod2: string;
  onPeriod1Change: (period: string) => void;
  onPeriod2Change: (period: string) => void;
  loading?: boolean;
  error?: string;
}

const BalanceSheetComparisonChart: React.FC<BalanceSheetComparisonChartProps> = ({
  data,
  availablePeriods,
  selectedPeriod1,
  selectedPeriod2,
  onPeriod1Change,
  onPeriod2Change,
  loading = false,
  error
}) => {
  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: `Balance Sheet Comparison: ${selectedPeriod1} vs ${selectedPeriod2}`,
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: 20
      },
      legend: {
        position: 'top' as const,
        labels: {
          padding: 15,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = formatCurrency(context.parsed.y);
            const periodIndex = context.dataIndex;
            const periodName = data.labels[periodIndex];
            return `${label} (${periodName}): ${value}`;
          },
          afterLabel: (context) => {
            const datasetIndex = context.datasetIndex;
            const dataIndex = context.dataIndex;
            const value = context.dataset.data[dataIndex];
            const periodName = data.labels[dataIndex];
            const dataQuality = data.dataQuality?.[periodName];
            
            let additionalInfo = '';
            
            // Add data quality indicators based on actual data quality information
            if (dataQuality) {
              if (!dataQuality.hasCompleteData) {
                const missingInfo = dataQuality.missingFields.length > 0 ? 
                  ` (Missing: ${dataQuality.missingFields.join(', ')})` : '';
                const calculatedInfo = dataQuality.calculatedFields.length > 0 ? 
                  ` (Calculated: ${dataQuality.calculatedFields.join(', ')})` : '';
                additionalInfo = missingInfo + calculatedInfo;
              }
            } else if (typeof value === 'number' && value === 0) {
              additionalInfo = ' (Data not available)';
            }
            
            // Show the total for the stack
            if (datasetIndex === 0) { // Total Assets (standalone)
              return `Total Assets: ${formatCurrency(context.parsed.y)}${additionalInfo}`;
            } else if (datasetIndex === 2) { // Total Equity (last in Liabilities & Equity stack)
              const liabilitiesValue = data.datasets[1].data[dataIndex];
              const equityValue = data.datasets[2].data[dataIndex];
              const total = liabilitiesValue + equityValue;
              
              return `Total L&E: ${formatCurrency(total)}${additionalInfo}`;
            }
            return additionalInfo;
          }
        }
      }
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12
          }
        }
      },
      y: {
        stacked: true,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Value (USD)',
          font: {
            size: 12
          }
        },
        ticks: {
          callback: function(value) {
            // Format y-axis values in millions
            if (typeof value === 'number' && value >= 1000000) {
              return `$${(value / 1000000).toFixed(0)}M`;
            }
            return typeof value === 'number' ? formatCurrency(value) : value;
          },
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false
    }
  };

  // Check if we have valid data
  const hasData = data && data.datasets && data.datasets.length > 0 && 
                  data.datasets.some(dataset => dataset.data.some((value: number) => value > 0));

  const hasValidPeriods = selectedPeriod1 && selectedPeriod2;

  if (!hasData && !loading) {
    return (
      <ChartContainer loading={false}>
        <Box sx={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <Typography variant="body1" gutterBottom>
            Balance sheet comparison data is not available.
          </Typography>
          <Typography variant="body2">
            Please ensure you have uploaded balance sheet documents with quarterly data.
          </Typography>
        </Box>
      </ChartContainer>
    );
  }

  if (error) {
    return (
      <ChartContainer loading={false}>
        <Box sx={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <Typography variant="body1" color="error">
            {error}
          </Typography>
        </Box>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer loading={loading}>
      <Box sx={{ mb: 3 }}>
        {/* Period Selection Controls */}
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Balance Sheet Comparison
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="period1-select-label">First Period</InputLabel>
              <Select
                labelId="period1-select-label"
                value={selectedPeriod1}
                label="First Period"
                onChange={(e) => onPeriod1Change(e.target.value)}
                disabled={loading}
              >
                {availablePeriods.map((period) => (
                  <MenuItem 
                    key={period} 
                    value={period}
                    disabled={period === selectedPeriod2}
                  >
                    {period}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="period2-select-label">Second Period</InputLabel>
              <Select
                labelId="period2-select-label"
                value={selectedPeriod2}
                label="Second Period"
                onChange={(e) => onPeriod2Change(e.target.value)}
                disabled={loading}
              >
                {availablePeriods.map((period) => (
                  <MenuItem 
                    key={period} 
                    value={period}
                    disabled={period === selectedPeriod1}
                  >
                    {period}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Period Selection Validation */}
        {!hasValidPeriods && !loading && (
          <Typography variant="body2" color="warning.main" sx={{ mb: 2 }}>
            Please select two different periods to compare.
          </Typography>
        )}

        {/* Data Quality Warning */}
        {hasValidPeriods && data.dataQuality && (
          <Box sx={{ mb: 2 }}>
            {Object.entries(data.dataQuality).map(([period, quality]) => {
              const qualityInfo = quality as {
                hasCompleteData: boolean;
                missingFields: string[];
                calculatedFields: string[];
              };
              
              return (
                !qualityInfo.hasCompleteData && (
                  <Alert severity="warning" key={period} sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      <strong>{period}:</strong> {qualityInfo.missingFields.length > 0 && 
                        `Missing data for ${qualityInfo.missingFields.join(', ')}.`} {qualityInfo.calculatedFields.length > 0 && 
                        `${qualityInfo.calculatedFields.join(', ')} calculated from available data.`}
                    </Typography>
                  </Alert>
                )
              );
            })}
          </Box>
        )}
      </Box>

      {/* Chart */}
      {hasValidPeriods && hasData && (
        <Box sx={{ height: '500px', width: '100%' }}>
          <Bar data={data} options={options} />
        </Box>
      )}
    </ChartContainer>
  );
};

export default BalanceSheetComparisonChart; 