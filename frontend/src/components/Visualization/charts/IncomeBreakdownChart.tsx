import React from 'react';
import { Bar } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';
import ChartContainer from './ChartContainer';
import { IncomeStatementData } from '../../../types/incomeStatement';

interface IncomeBreakdownChartProps {
  data: IncomeStatementData;
}

const IncomeBreakdownChart: React.FC<IncomeBreakdownChartProps> = ({ data }) => {
  // Available metrics for the chart - updated for new structure
  const availableMetrics = [
    { key: 'Total_Income', label: 'Total Income', color: 'rgba(54, 162, 235, 0.8)' },
    { key: 'Total_Expenses', label: 'Total Expenses', color: 'rgba(255, 99, 132, 0.8)' },
    { key: 'Gross_Profit', label: 'Gross Profit', color: 'rgba(75, 192, 192, 0.8)' },
    { key: 'Profit_Before_Tax', label: 'Profit Before Tax', color: 'rgba(255, 206, 86, 0.8)' },
    { key: 'Profit_After_Tax', label: 'Profit After Tax', color: 'rgba(153, 102, 255, 0.8)' }
  ];

  // Create comprehensive grouped bar chart data showing all metrics
  const createComprehensiveBarData = () => {
    if (!data || Object.keys(data).length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    // Extract years and quarters
    const years = Object.keys(data).sort();
    const allQuarters = new Set<string>();
    
    // Collect all unique quarters across all years
    years.forEach(year => {
      Object.keys(data[year]).forEach(quarter => {
        allQuarters.add(quarter);
      });
    });

    // Sort quarters logically: Q1, Q2, Q3, Q4, Q1_YTD, Q2_YTD, Q3_YTD, Q4_YTD
    const quarters = Array.from(allQuarters).sort((a, b) => {
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

    // Create labels for x-axis (year-quarter combinations)
    const labels: string[] = [];
    years.forEach(year => {
      quarters.forEach(quarter => {
        if (data[year]?.[quarter]) {
          // Only include periods that have actual data (not all null values)
          const quarterData = data[year][quarter];
          const hasData = Object.values(quarterData).some(value => value !== null);
          if (hasData) {
            labels.push(`${quarter.replace('_', ' ')} ${year}`);
          }
        }
      });
    });

    // Calculate average values for each metric to determine sorting order
    const metricsWithAverages = availableMetrics.map((metric) => {
      let total = 0;
      let count = 0;
      
      years.forEach(year => {
        quarters.forEach(quarter => {
          const quarterData = data[year]?.[quarter];
          if (quarterData && quarterData[metric.key as keyof typeof quarterData] !== null) {
            total += Math.abs(quarterData[metric.key as keyof typeof quarterData] || 0);
            count++;
          }
        });
      });
      
      return {
        ...metric,
        averageValue: count > 0 ? total / count : 0
      };
    });

    // Sort metrics by average value (highest to lowest)
    const sortedMetrics = metricsWithAverages.sort((a, b) => b.averageValue - a.averageValue);

    // Create datasets for each metric across all years and quarters using sorted order
    const datasets = sortedMetrics.map((metric) => {
      const metricData: number[] = [];
      
      // Create data for each year-quarter combination
      years.forEach(year => {
        quarters.forEach(quarter => {
          const quarterData = data[year]?.[quarter];
          if (quarterData) {
            // Only include periods that have actual data (not all null values)
            const hasData = Object.values(quarterData).some(value => value !== null);
            if (hasData) {
              const value = quarterData[metric.key as keyof typeof quarterData];
              metricData.push(value !== null ? value : 0);
            }
          }
        });
      });

      return {
        label: metric.label,
        data: metricData,
        backgroundColor: metric.color,
        borderColor: metric.color.replace('0.8', '1'),
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      };
    });

    return {
      labels,
      datasets
    };
  };

  // Chart options for comprehensive grouped bar chart
  const comprehensiveBarOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 11
          }
        }
      },
      title: {
        display: true,
        text: 'Income Statement Analysis - Financial Performance',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 30
        }
      },
      tooltip: {
        callbacks: {
          title: function() {
            return ''; // Remove the title completely
          },
          label: function(context) {
            const value = context.parsed.y;
            return `${context.dataset.label}: ${new Intl.NumberFormat('en-US', { 
              style: 'currency', 
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(value)}`;
          },
          afterLabel: function(context) {
            // Calculate percentage change between periods if applicable
            const currentDatasetIndex = context.datasetIndex;
            const currentValueIndex = context.dataIndex;
            
            // Check if there's a previous period (assuming consecutive periods)
            if (currentValueIndex > 0) {
              const currentValue = context.parsed.y;
              const previousValue = context.chart.data.datasets[currentDatasetIndex].data[currentValueIndex - 1] as number;
              
              if (previousValue && previousValue !== 0) {
                const percentChange = ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
                const changeText = percentChange >= 0 ? 'increase' : 'decrease';
                return `${Math.abs(percentChange).toFixed(1)}% ${changeText} from previous period`;
              }
            }
            return '';
          }
        },
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: 'white',
        bodyColor: 'white',
        footerColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        padding: {
          top: 8,
          bottom: 8,
          left: 12,
          right: 12
        },
        bodyFont: {
          size: 13
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Period',
          font: {
            size: 20,
            weight: 'bold'
          }
        },
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 0,
          font: {
            size: 15
          }
        }
      },
      y: {
        beginAtZero: true,
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
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              notation: 'compact',
              maximumFractionDigits: 1
            }).format(value as number);
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
      intersect: true,
      mode: 'nearest'
    },
    onHover: (event, activeElements, chart) => {
      if (chart.canvas) {
        chart.canvas.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
      }
    },
    elements: {
      bar: {
        borderRadius: 4,
        hoverBorderWidth: 2,
        hoverBorderColor: 'rgba(255, 255, 255, 0.8)'
      }
    }
  };

  const chartData = createComprehensiveBarData();

  if (chartData.labels.length === 0) {
    return (
      <ChartContainer>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px',
          color: '#666',
          fontSize: '16px'
        }}>
          No income statement data available
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer>
      <div style={{ height: '500px' }}>
        <Bar data={chartData} options={comprehensiveBarOptions} />
      </div>
    </ChartContainer>
  );
};

export default IncomeBreakdownChart; 