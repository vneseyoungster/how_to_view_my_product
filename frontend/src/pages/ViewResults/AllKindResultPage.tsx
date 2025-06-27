import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  CircularProgress, 
  Paper,
  Alert,
  Divider
} from '@mui/material';
import { useBaseResultsPage } from './BaseResultsPage';
import { DocumentSpecificCharts } from './DocumentSpecificCharts';
import { FinancialData } from '../../components/Visualization/types';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// Component for displaying "no data available" message
const NoDataAvailable: React.FC<{ message?: string; section?: string }> = ({ 
  message = "Data is not available to display", 
  section = "this section" 
}) => (
  <Box 
    sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      p: 3,
      border: '1px dashed #ccc',
      borderRadius: 1,
      backgroundColor: '#f9f9f9',
      minHeight: '200px'
    }}
  >
    <InfoOutlinedIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
    <Typography variant="body1" color="text.secondary" align="center">
      {message}
    </Typography>
    <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
      Please upload documents containing {section} information for comprehensive analysis.
    </Typography>
  </Box>
);

const AllKindResultPage: React.FC = () => {
  const {
    isLoading,
    error,
    getFilteredFinancialData,
    theme,
    ProcessingSummary
  } = useBaseResultsPage('multiple-type');

  const [financialData, setFinancialData] = useState<{
    balanceSheet: FinancialData | null;
    cashFlow: FinancialData | null;
    incomeStatement: FinancialData | null;
  }>({
    balanceSheet: null,
    cashFlow: null,
    incomeStatement: null
  });

  const [dataLoading, setDataLoading] = useState({
    balanceSheet: true,
    cashFlow: true,
    incomeStatement: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data for all document types
        const balanceSheetData = getFilteredFinancialData('balance-sheet');
        const cashFlowData = getFilteredFinancialData('cash-flow');
        const incomeStatementData = getFilteredFinancialData('income-statement');
        
        setFinancialData({
          balanceSheet: balanceSheetData,
          cashFlow: cashFlowData,
          incomeStatement: incomeStatementData
        });
        
        setDataLoading({
          balanceSheet: false,
          cashFlow: false,
          incomeStatement: false
        });
      } catch (err) {
        console.error('Error fetching financial data:', err);
        setDataLoading({
          balanceSheet: false,
          cashFlow: false,
          incomeStatement: false
        });
      }
    };

    if (!isLoading) {
      fetchData();
    }
  }, [isLoading, getFilteredFinancialData]);

  // Helper function to check if data is available for a section
  const hasDataForSection = (data: FinancialData | null): boolean => {
    if (!data) return false;
    return Boolean(data.financialMetrics && Object.keys(data.financialMetrics).length > 0);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box 
        sx={{ 
          p: { xs: 2, md: 4 },
          background: `linear-gradient(135deg, ${theme.palette.primary.main}10 0%, ${theme.palette.secondary.main}10 100%)`
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontWeight: 600,
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center'
          }}
        >
          Comprehensive Financial Analysis
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" align="center">
          Complete overview of all financial document types in one unified view
        </Typography>
      </Box>

      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {/* Processing Summary */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ProcessingSummary />
          </Grid>
        </Grid>

        {/* Balance Sheet Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            Balance Sheet Analysis
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          {dataLoading.balanceSheet ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={40} />
            </Box>
          ) : hasDataForSection(financialData.balanceSheet) ? (
            <DocumentSpecificCharts 
              documentType="balance-sheet"
              data={financialData.balanceSheet!}
              loading={false}
            />
          ) : (
            <NoDataAvailable 
              message="Balance sheet data is not available to display"
              section="balance sheet"
            />
          )}
        </Box>
        
        {/* Cash Flow Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            Cash Flow Analysis
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          {dataLoading.cashFlow ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={40} />
            </Box>
          ) : hasDataForSection(financialData.cashFlow) ? (
            <DocumentSpecificCharts 
              documentType="cash-flow"
              data={financialData.cashFlow!}
              loading={false}
            />
          ) : (
            <NoDataAvailable 
              message="Cash flow data is not available to display"
              section="cash flow"
            />
          )}
        </Box>
        
        {/* Income Statement Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            Income Statement Analysis
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          {dataLoading.incomeStatement ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={40} />
            </Box>
          ) : hasDataForSection(financialData.incomeStatement) ? (
            <DocumentSpecificCharts 
              documentType="income-statement"
              data={financialData.incomeStatement!}
              loading={false}
            />
          ) : (
            <NoDataAvailable 
              message="Income statement data is not available to display"
              section="income statement"
            />
          )}
        </Box>

        {/* Summary Information */}
        {!hasDataForSection(financialData.balanceSheet) && 
         !hasDataForSection(financialData.cashFlow) && 
         !hasDataForSection(financialData.incomeStatement) && (
          <Paper elevation={2} sx={{ p: 3, mt: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              No Financial Data Available
            </Typography>
            <Typography variant="body1" color="text.secondary">
              No financial data is currently available for analysis. 
              Please upload documents containing financial information to view comprehensive analysis.
            </Typography>
          </Paper>
        )}
      </Box>
      
      <Box sx={{ textAlign: 'center', p: 2, color: 'text.secondary' }}>
        <Typography variant="body2">
          AI Financial Report Analyzer &copy; {new Date().getFullYear()}
        </Typography>
      </Box>
    </Box>
  );
};

export default AllKindResultPage; 