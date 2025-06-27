import React, { useMemo } from 'react';
import { Box, Alert } from '@mui/material';
import Grid from '@mui/material/Grid';
import { BaseResultsPage, useBaseResultsPage } from './BaseResultsPage';
import { BalanceSheetOverviewChart } from '../../components/Visualization/charts';
import { 
  processQuarterlyBalanceSheetData, 
  getOverviewChartData
} from './balanceSheetUtils';
import { BalanceSheetRawData } from '../../types/balanceSheet';

const BalanceSheetResultsPage: React.FC = () => {
  const {
    isLoading,
    error,
    useMockData,
    summaryResult,
    ProcessingSummary,
    PromptInfoDisplay,
    SummaryTypeSelector
  } = useBaseResultsPage('balance-sheet');

  // Process quarterly balance sheet data
  const { processedData, rawData, error: dataError } = useMemo(() => {
    console.log('Processing balance sheet data...');
    console.log('summaryResult:', summaryResult);
    console.log('useMockData:', useMockData);
    
    let rawData: BalanceSheetRawData | null = null;
    let errorMessage = '';

    // Try to get data from summary_content first
    if (summaryResult?.summary_content) {
      try {
        const parsedContent = JSON.parse(summaryResult.summary_content);
        console.log('Parsed balance sheet content:', parsedContent);
        
        // Check if this matches the new quarterly structure
        const isQuarterlyData = parsedContent && 
          typeof parsedContent === 'object' &&
          Object.keys(parsedContent).some(key => 
            /^\d{4}$/.test(key) && // Year format (e.g., "2023")
            parsedContent[key] && 
            typeof parsedContent[key] === 'object' &&
            Object.keys(parsedContent[key]).some(quarter => 
              quarter.startsWith('Q') && // Quarter format (e.g., "Q1")
              parsedContent[key][quarter] &&
              'Total_Assets' in parsedContent[key][quarter]
            )
          );
        
        if (isQuarterlyData) {
          rawData = parsedContent as BalanceSheetRawData;
        } else {
          errorMessage = 'Data format does not match expected quarterly structure';
        }
      } catch (error) {
        console.error('Error parsing balance sheet data:', error);
        errorMessage = 'Failed to parse balance sheet data';
      }
    }
    
    // Fallback to mock data for development/testing
    if (!rawData && useMockData) {
      const mockQuarterlyData: BalanceSheetRawData = {
        "2023": {
          "Q4": {
            "Total_Assets": 849482012,
            "Total_Liabilities": 717853947,
            "Total_Equity": 131628065
          },
          "Q3": {
            "Total_Assets": null,
            "Total_Liabilities": null,
            "Total_Equity": null
          },
          "Q2": {
            "Total_Assets": null,
            "Total_Liabilities": null,
            "Total_Equity": null
          },
          "Q1": {
            "Total_Assets": null,
            "Total_Liabilities": null,
            "Total_Equity": null
          }
        },
        "2022": {
          "Q4": {
            "Total_Assets": 699032544,
            "Total_Liabilities": 585607578,
            "Total_Equity": 113424966
          },
          "Q3": {
            "Total_Assets": null,
            "Total_Liabilities": null,
            "Total_Equity": null
          },
          "Q2": {
            "Total_Assets": 528957901,
            "Total_Liabilities": 396914172,
            "Total_Equity": 132043729
          },
          "Q1": {
            "Total_Assets": null,
            "Total_Liabilities": null,
            "Total_Equity": null
          }
        },
        "2021": {
          "Q4": {
            "Total_Assets": 428384465,
            "Total_Liabilities": 268812599,
            "Total_Equity": 159571866
          },
          "Q3": {
            "Total_Assets": null,
            "Total_Liabilities": null,
            "Total_Equity": null
          },
          "Q2": {
            "Total_Assets": null,
            "Total_Liabilities": null,
            "Total_Equity": null
          },
          "Q1": {
            "Total_Assets": null,
            "Total_Liabilities": null,
            "Total_Equity": null
          }
        },
        "2020": {
          "Q4": {
            "Total_Assets": 439602933,
            "Total_Liabilities": null,
            "Total_Equity": null
          },
          "Q3": {
            "Total_Assets": null,
            "Total_Liabilities": null,
            "Total_Equity": null
          },
          "Q2": {
            "Total_Assets": null,
            "Total_Liabilities": null,
            "Total_Equity": null
          },
          "Q1": {
            "Total_Assets": null,
            "Total_Liabilities": null,
            "Total_Equity": null
          }
        }
      };
      
      rawData = mockQuarterlyData;
      console.log('Using mock quarterly data');
    }

    if (!rawData) {
      return {
        processedData: [],
        rawData: null,
        error: errorMessage || 'No balance sheet data available'
      };
    }

    try {
      const processed = processQuarterlyBalanceSheetData(rawData);
      
      console.log('Processed data:', processed);
      
      return {
        processedData: processed,
        rawData: rawData,
        error: ''
      };
    } catch (error) {
      console.error('Error processing quarterly data:', error);
      return {
        processedData: [],
        rawData: null,
        error: 'Failed to process balance sheet data'
      };
    }
  }, [summaryResult, useMockData]);

  // Generate overview chart data
  const overviewChartData = useMemo(() => {
    if (processedData.length === 0) {
      return {
        labels: [],
        datasets: [],
        dataQuality: {}
      };
    }
    
    return getOverviewChartData(processedData, rawData || undefined);
  }, [processedData, rawData]);

  return (
    <BaseResultsPage documentType="balance-sheet">
      <Box sx={{ width: '100%', flexGrow: 1 }}>
        <Grid container spacing={3}>
          {/* Error Alert */}
          {error || dataError ? (
            <Grid item xs={12}>
              <Alert severity="error" sx={{ mb: 3 }}>
                {error || dataError}
              </Alert>
            </Grid>
          ) : useMockData ? (
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Viewing mock balance sheet data. Upload balance sheet documents to see your real data.
              </Alert>
            </Grid>
          ) : summaryResult && summaryResult.success ? (
            <Grid item xs={12}>
              <Alert severity="success" sx={{ mb: 3 }}>
                Balance sheet analysis complete! Generated comprehensive summary from {summaryResult.total_files_processed} files.
              </Alert>
            </Grid>
          ) : (
            <Grid item xs={12}>
              <Alert severity="success" sx={{ mb: 3 }}>
                Balance sheet analysis complete! Review your financial insights below.
              </Alert>
            </Grid>
          )}
          
          {/* Processing Summary */}
          <Grid item xs={12}>
            <ProcessingSummary />
          </Grid>

          {/* Show error if summary failed */}
          {!useMockData && summaryResult && !summaryResult.success && (
            <Grid item xs={12}>
              <Alert severity="error">
                Failed to generate balance sheet summary: {summaryResult.error || 'Unknown error'}
              </Alert>
            </Grid>
          )}
          
          {/* Balance Sheet Overview Chart */}
          <Grid item xs={12} sx={{ mb: 25 }}>
            <BalanceSheetOverviewChart 
              data={overviewChartData}
              loading={isLoading}
              error={dataError}
            />
          </Grid>
          
          {/* AI Summarization Section */}
          <Grid item xs={12} sx={{ mt: -10 }}>
            <PromptInfoDisplay />
          </Grid>
          
          <Grid item xs={12}>
            <SummaryTypeSelector />
          </Grid>
        </Grid>
      </Box>
    </BaseResultsPage>
  );
};

export default BalanceSheetResultsPage; 