import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Paper, Typography, Box, Alert } from '@mui/material';
import ChartContainer from './ChartContainer';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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

interface BalanceSheetOverviewChartProps {
  data: OverviewChartData;
  loading?: boolean;
  error?: string;
}

export const BalanceSheetOverviewChart: React.FC<BalanceSheetOverviewChartProps> = ({
  data,
  loading = false,
  error
}) => {
  const formatCurrency = (value: number): string => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      title: {
        display: true,
        text: 'Balance Sheet Overview: Assets vs Liabilities & Equity Across All Periods',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          bottom: 30
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          title: (context) => {
            const period = context[0]?.label || '';
            const qualityInfo = data.dataQuality[period];
            let title = `Balance Sheet - ${period}`;
            if (qualityInfo?.hasEstimated) {
              title += ' *';
            }
            return title;
          },
          label: (context) => {
            const value = context.parsed.y;
            const label = context.dataset.label;
            return `${label}: ${formatCurrency(value)}`;
          },
          footer: (context) => {
            const period = context[0]?.label || '';
            const qualityInfo = data.dataQuality[period];
            if (qualityInfo?.hasEstimated && qualityInfo.missingFields.length > 0) {
              return `* Contains estimated values for: ${qualityInfo.missingFields.join(', ')}`;
            }
            return '';
          }
        },
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        footerFont: {
          size: 10,
          style: 'italic'
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Reporting Period',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11,
            weight: 'bold'
          }
        }
      },
      y: {
        title: {
          display: true,
          text: 'Amount (USD)',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        ticks: {
          callback: function(value) {
            return formatCurrency(Number(value));
          },
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    }
  };

  const chartData: ChartData<'bar'> = {
    labels: data.labels,
    datasets: data.datasets.map(dataset => ({
      ...dataset,
      // Assets get their own stack, L&E share a stack
      stack: dataset.label === 'Total Assets' ? 'Assets' : 'Liabilities & Equity'
    }))
  };

  if (error) {
    return (
      <ChartContainer>
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      </ChartContainer>
    );
  }

  if (loading) {
    return (
      <ChartContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <Typography>Loading balance sheet overview...</Typography>
        </Box>
      </ChartContainer>
    );
  }

  if (!data.labels || data.labels.length === 0) {
    return (
      <ChartContainer>
        <Alert severity="info" sx={{ m: 2 }}>
          No balance sheet data available to display. Please upload balance sheet documents to see your financial overview.
        </Alert>
      </ChartContainer>
    );
  }

  // Check if any periods have estimated data
  const hasEstimatedData = Object.values(data.dataQuality).some(quality => quality.hasEstimated);

  return (
    <ChartContainer>
      <Paper elevation={2} sx={{ p: 3, height: '500px', display: 'flex', flexDirection: 'column' }}>
        {hasEstimatedData && (
          <Alert severity="info" sx={{ mb: 2, fontSize: '0.875rem' }}>
            * Some periods contain estimated values due to incomplete data. See individual tooltips for details.
          </Alert>
        )}
        
        <Box sx={{ flexGrow: 1, minHeight: 0 }}>
          <Bar data={chartData} options={chartOptions} />
        </Box>
        
        <Box sx={{ mt: 2, fontSize: '0.75rem', color: 'text.secondary', textAlign: 'center' }}>

        </Box>
      </Paper>
    </ChartContainer>
  );
};

export default BalanceSheetOverviewChart; 