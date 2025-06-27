import React from 'react';
import { Line } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';
import ChartContainer from './ChartContainer';
import { FinancialData } from '../types';

interface CashFlowComponentsChartProps {
  data: FinancialData;
}

const CashFlowComponentsChart: React.FC<CashFlowComponentsChartProps> = ({ data }) => {
  // Check if we have periods and cash flow data
  if (!data.periods || data.periods.length === 0) {
    return (
      <ChartContainer>
        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          No cash flow data available
        </div>
      </ChartContainer>
    );
  }

  // Use net cash flows since we have Net_Operation, Net_Investing, Net_Financing
  const stackedAreaData = {
    labels: data.periods,
    datasets: [
      {
        label: 'Net Operating Activities',
        data: data.cashInflows.operatingActivities,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgb(75, 192, 192)',
        fill: false,
        tension: 0.3,
      },
      {
        label: 'Net Investing Activities',
        data: data.cashInflows.investingActivities,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgb(54, 162, 235)',
        fill: false,
        tension: 0.3,
      },
      {
        label: 'Net Financing Activities',
        data: data.cashInflows.financingActivities,
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgb(153, 102, 255)',
        fill: false,
        tension: 0.3,
      },
    ],
  };

  const stackedAreaOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Net Cash Flow by Activity',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(context.parsed.y);
            }
            return label;
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
          text: 'Period'
        }
      }
    },
    maintainAspectRatio: false
  };

  return (
    <ChartContainer>
      <Line data={stackedAreaData} options={stackedAreaOptions} />
    </ChartContainer>
  );
};

export default CashFlowComponentsChart; 