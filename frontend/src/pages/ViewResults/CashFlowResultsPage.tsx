import React from 'react';
import { Box, Alert } from '@mui/material';
import Grid from '@mui/material/Grid';
import { BaseResultsPage, useBaseResultsPage } from './BaseResultsPage';
import DocumentSpecificCharts from './DocumentSpecificCharts';

const CashFlowResultsPage: React.FC = () => {
  const {
    isLoading,
    error,
    useMockData,
    summaryResult,
    getFilteredFinancialData,
    ProcessingSummary,
    PromptInfoDisplay,
    SummaryTypeSelector
  } = useBaseResultsPage('cash-flow');

  // Get cash flow specific financial data
  const financialData = getFilteredFinancialData('cash-flow');

  return (
    <BaseResultsPage documentType="cash-flow">
      <Box sx={{ width: '100%', flexGrow: 1 }}>
        <Grid container spacing={3}>
          {/* Error Alert */}
          {error ? (
            <Grid item xs={12}>
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            </Grid>
          ) : useMockData ? (
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Viewing mock cash flow data. Select a company type below to see different data patterns.
              </Alert>
            </Grid>
          ) : summaryResult && summaryResult.success ? (
            <Grid item xs={12}>
              <Alert severity="success" sx={{ mb: 3 }}>
                Cash flow analysis complete! Generated comprehensive summary from {summaryResult.total_files_processed} files.
              </Alert>
            </Grid>
          ) : (
            <Grid item xs={12}>
              <Alert severity="success" sx={{ mb: 3 }}>
                Cash flow analysis complete! Review your financial insights below.
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
                Failed to generate cash flow summary: {summaryResult.error || 'Unknown error'}
              </Alert>
            </Grid>
          )}
          
          {/* Cash Flow Specific Charts */}
          <Grid item xs={12}>
            <DocumentSpecificCharts 
              documentType="cash-flow"
              data={financialData}
              loading={isLoading}
            />
          </Grid>
          
          {/* Prompt Info Display */}
          <PromptInfoDisplay />
          
          {/* Summary Type Selector */}
          <SummaryTypeSelector />
        </Grid>
      </Box>
    </BaseResultsPage>
  );
};

export default CashFlowResultsPage; 