import React from 'react';
import { Line } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';
import ChartContainer, { EmptyChartMessage } from './ChartContainer';
import { FinancialData } from '../types';

interface CashFlowTrendChartProps {
  data: FinancialData;
}

const CashFlowTrendChart: React.FC<CashFlowTrendChartProps> = ({ data }) => {
  // Multiple line chart for Cash Flow Analysis
  const createCashFlowMultiLineChart = () => {
    if (!data.periods || data.periods.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    // Create datasets for each cash flow component
    const datasets = [
      {
        label: 'Net Operating Activities',
        data: data.cashInflows.operatingActivities, // Use the actual Net_Operation values
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 3,
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 7,
        spanGaps: true, // Connect points even when there are null values
      },
      {
        label: 'Net Investing Activities',
        data: data.cashInflows.investingActivities, // Use the actual Net_Investing values
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderWidth: 3,
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 7,
        spanGaps: true, // Connect points even when there are null values
      },
      {
        label: 'Net Financing Activities',
        data: data.cashInflows.financingActivities, // Use the actual Net_Financing values
        borderColor: 'rgb(153, 102, 255)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderWidth: 3,
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 7,
        spanGaps: true, // Connect points even when there are null values
      }
    ];

    // Add Profit Before Tax line if data is available
    if (data.profitBeforeTax && data.profitBeforeTax.length > 0) {
      // Check if there's any non-zero profit before tax data
      const hasNonZeroProfitData = data.profitBeforeTax.some(value => value !== 0);
      
      if (hasNonZeroProfitData) {
        datasets.push({
          label: 'Profit Before Tax',
          data: data.profitBeforeTax,
          borderColor: 'rgb(255, 159, 64)',
          backgroundColor: 'rgba(255, 159, 64, 0.2)',
          borderWidth: 3,
          tension: 0.3,
          pointRadius: 5,
          pointHoverRadius: 7,
          spanGaps: true, // Connect points even when there are null values
        });
      }
    }

    return {
      labels: data.periods,
      datasets
    };
  };

  const cashFlowMultiLineOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Cash Flow Analysis - Quarterly Trends',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              // Show if value was originally null (converted to 0)
              const originalValue = context.parsed.y;
              if (originalValue === 0) {
                label += 'No data available';
              } else {
                label += new Intl.NumberFormat('en-US', { 
                  style: 'currency', 
                  currency: 'USD',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(originalValue);
              }
            }
            return label;
          },
          title: function(context) {
            // Enhanced title showing the period
            return `Period: ${context[0].label}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Amount ($)'
        },
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('en-US', { 
              style: 'currency', 
              currency: 'USD',
              notation: 'compact',
              maximumFractionDigits: 1
            }).format(value as number);
          }
        }
      },
      x: {
        title: {
          display: true,
          text: 'Quarter'
        }
      }
    },
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  const chartData = createCashFlowMultiLineChart();

  return (
    <ChartContainer>
      {data.periods && data.periods.length > 0 ? (
        <Line data={chartData} options={cashFlowMultiLineOptions} />
      ) : (
        <EmptyChartMessage message="No cash flow data available" />
      )}
    </ChartContainer>
  );
};

export default CashFlowTrendChart; 