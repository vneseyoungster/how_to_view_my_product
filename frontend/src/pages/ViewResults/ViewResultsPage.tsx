import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Switch,
  FormControlLabel,
  SelectChangeEvent,
  Divider
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FinancialCharts from '../../components/Visualization/FinancialCharts';
import { FinancialData, BackendCashFlowData, transformBackendCashFlowData } from '../../components/Visualization/types';
import { UploadedFile, DOCUMENT_TYPES } from '../../components/FileUpload/CategoryFileUpload';
import { mockFinancialData } from '../../mock/financial-data';
import { 
  FinancialMetric, 
  ProcessingResult, 
  ProcessingResultFile,
  BalanceSheetData,
  CashFlowData,
  IncomeStatementData,
  FinancialPositionData
} from '../../types';
import { IncomeStatementData as IncomeStatementDataType } from '../../types/incomeStatement';

// Add new interface for summary result
interface SummaryResult {
  success: boolean;
  summary: string;
  summary_content?: string;
  files_processed?: number;
  processed_files?: string[];
  summary_file_path?: string;
  message?: string;
  total_files_processed: number;
  analysis_files_used: string[];
  financial_data?: Record<string, FinancialMetric>;
  metadata?: {
    available_summary_types: string[];
    default_summary_type: string;
    prompt_info: {
      available_summary_types: string[];
      default_summary_type: string;
      cache_info: {
        cache_size: number;
        cached_prompts: string[];
      };
    };
  };
  error?: string;
}

const ViewResultsPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [processingResults, setProcessingResults] = useState<ProcessingResult[]>([]);
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Mock data state
  const [dataSource, setDataSource] = useState<'document' | 'mock'>('document');
  const [selectedMockCompany, setSelectedMockCompany] = useState<'techCompany' | 'manufacturingCompany' | 'retailCompany'>('techCompany');
  const [useMockData, setUseMockData] = useState(false);
  
  // Metadata state
  const [availableSummaryTypes, setAvailableSummaryTypes] = useState<string[]>([]);
  const [selectedSummaryType, setSelectedSummaryType] = useState<string>('');
  const [promptInfo, setPromptInfo] = useState<{
    available_summary_types: string[];
    default_summary_type: string;
    cache_info: {
      cache_size: number;
      cached_prompts: string[];
    };
  } | null>(null);

  useEffect(() => {
    const loadResults = () => {
      setIsLoading(true);

      // Check if processing is complete
      const isComplete = sessionStorage.getItem('processingComplete');
      
      // If no processing is complete, check if we should use mock data
      if (!isComplete) {
        // Check if we should use mock data instead of redirecting
        const mockDataEnabled = sessionStorage.getItem('useMockData');
        if (mockDataEnabled === 'true') {
          setUseMockData(true);
          setDataSource('mock');
          setIsLoading(false);
          return;
        }
        
        // If not using mock data, redirect to upload page
        navigate('/upload-documents');
        return;
      }
      
      setProcessingComplete(true);

      try {
        // Get uploaded files
        const filesJson = sessionStorage.getItem('uploadedFiles');
        if (filesJson) {
          const files = JSON.parse(filesJson) as UploadedFile[];
          setUploadedFiles(files);
        }

        // Get processing results (individual document processing) - for details section only
        const resultsJson = sessionStorage.getItem('processingResults');
        if (resultsJson) {
          const results = JSON.parse(resultsJson) as ProcessingResult[];
          setProcessingResults(results);
        }

        // Get summary result (comprehensive analysis) - primary data source for visualization
        const summaryJson = sessionStorage.getItem('summaryResult');
        if (summaryJson) {
          const summary = JSON.parse(summaryJson) as SummaryResult;
          setSummaryResult(summary);
          console.log('Loaded summary result:', summary);
          
          // Extract metadata information
          if (summary.metadata) {
            setAvailableSummaryTypes(summary.metadata.available_summary_types || []);
            setSelectedSummaryType(summary.metadata.default_summary_type || '');
            setPromptInfo(summary.metadata.prompt_info || null);
          }
        } else {
          console.warn('No summary result found in session storage');
        }

        // Check if we have either processing results or summary
        if (!resultsJson && !summaryJson) {
          setError('No processing results found. Please try again.');
        }
      } catch (error) {
        console.error('Error loading results:', error);
        setError('Failed to load results. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadResults();
  }, [navigate]);

  const handleStartOver = useCallback(() => {
    // Clear session storage
    sessionStorage.removeItem('uploadedFilesMetadata');
    sessionStorage.removeItem('processingComplete');
    sessionStorage.removeItem('processingResults');
    sessionStorage.removeItem('summaryResult');
    sessionStorage.removeItem('useMockData');
    
    // Clear window object storage
    if (window.uploadedFiles) {
      window.uploadedFiles = [];
    }
    
    // Navigate back to upload page
    navigate('/upload-documents');
  }, [navigate]);

  // Extract and combine all financial data from summary result or use mock data
  // Transform backend data from summary_content to FinancialCharts format
  const transformCashFlowData = useCallback((summaryContent: string): Partial<FinancialData> => {
    try {
      const backendData = JSON.parse(summaryContent);
      console.log('Parsed backend data:', backendData);
      
      // Check if this is cash flow data (has Net_Operation, etc.) or income statement data
      const isCashFlowData = backendData && 
        Object.values(backendData).some((yearData: any) => 
          yearData && typeof yearData === 'object' &&
          Object.values(yearData).some((quarterData: any) => 
            quarterData && typeof quarterData === 'object' &&
            ('Net_Operation' in quarterData || 'Net_Investing' in quarterData || 'Net_Financing' in quarterData)
          )
        );
      
      const isIncomeStatementData = backendData && 
        Object.values(backendData).some((yearData: any) => 
          yearData && typeof yearData === 'object' &&
          Object.values(yearData).some((quarterData: any) => 
            quarterData && typeof quarterData === 'object' &&
            ('Net_Interest_Income' in quarterData || 'Total_Operating_Income' in quarterData || 'Profit_Before_Tax' in quarterData)
          )
        );
      
      let result: Partial<FinancialData> = {};
      
      if (isCashFlowData) {
        console.log('Detected cash flow data, transforming...');
        result = transformBackendCashFlowData(backendData as BackendCashFlowData);
      }
      
      if (isIncomeStatementData) {
        console.log('Detected income statement data, adding to result...');
        result.incomeStatementData = backendData as IncomeStatementDataType;
      }
      
      return result;
    } catch (error) {
      console.error('Error parsing backend data:', error);
      return {};
    }
  }, []);

  const getFinancialData = useCallback(() => {
    // If using mock data, return the selected mock company's financial metrics
    if (useMockData || dataSource === 'mock') {
      return mockFinancialData[selectedMockCompany].financialMetrics || {};
    }
    
    // Use summary result data as primary source (new workflow)
    if (summaryResult && summaryResult.success && summaryResult.financial_data) {
      console.log('Using financial data from summary result:', summaryResult.financial_data);
      return summaryResult.financial_data;
    }
    
    // Fallback to individual processing results (old workflow)
    const combinedData: Record<string, FinancialMetric> = {};
    
    processingResults.forEach(result => {
      if (result.success && result.financial_data) {
        Object.entries(result.financial_data).forEach(([key, value]) => {
          // If metric already exists, prefer the one with a value
          if (!combinedData[key] || 
              (combinedData[key].value === undefined && value.value !== undefined)) {
            combinedData[key] = value;
          }
        });
      }
    });
    
    console.log('Using financial data from individual processing results:', combinedData);
    return combinedData;
  }, [processingResults, summaryResult, useMockData, dataSource, selectedMockCompany]);

  // Get complete financial data for charts including cash flow transformation
  const getCompleteFinancialData = useCallback((): FinancialData => {
    // If using mock data, return the complete mock data structure
    if (useMockData || dataSource === 'mock') {
      return mockFinancialData[selectedMockCompany];
    }
    
    // Transform cash flow data from summary_content if available
    let transformedData: Partial<FinancialData> = {};
    if (summaryResult && summaryResult.summary_content) {
      transformedData = transformCashFlowData(summaryResult.summary_content);
      console.log('Transformed cash flow data:', transformedData);
    }
    
    // Get financial metrics
    const financialMetrics = getFinancialData();
    
    // Return combined data structure
    return {
      periods: transformedData.periods || [],
      cashFlowOperating: transformedData.cashFlowOperating || [],
      cashInflows: transformedData.cashInflows || {
        operatingActivities: [],
        investingActivities: [],
        financingActivities: []
      },
      cashOutflows: transformedData.cashOutflows || {
        operatingActivities: [],
        investingActivities: [],
        financingActivities: []
      },
      netIncomeComponents: transformedData.netIncomeComponents || {
        labels: [],
        values: []
      },
      profitBeforeTax: transformedData.profitBeforeTax || [],
      financialMetrics,
      incomeStatementData: transformedData.incomeStatementData
    };
  }, [useMockData, dataSource, selectedMockCompany, summaryResult, transformCashFlowData, getFinancialData]);

  // Get count of uploaded files by category
  const getUploadedFilesStats = useCallback(() => {
    if (uploadedFiles.length === 0) return { 
      count: 0, 
      categories: [],
      successCount: 0,
      errorCount: 0
    };
    
    const categories = uploadedFiles.map(file => {
      const category = DOCUMENT_TYPES.find(cat => cat.id === file.category);
      return category ? category.name : file.category;
    });
    
    return {
      count: uploadedFiles.length,
      categories,
      successCount: processingResults.filter(r => r.success).length,
      errorCount: processingResults.filter(r => !r.success).length
    };
  }, [uploadedFiles, processingResults]);

  // Format currency values
  const formatCurrency = (value: number | string): string => {
    if (typeof value === 'string') {
      // Try to convert string to number, removing any formatting
      const numericValue = parseFloat(value.replace(/[^0-9.-]+/g, ''));
      if (isNaN(numericValue)) return value;
      value = numericValue;
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const stats = getUploadedFilesStats();
  const completeFinancialData = getCompleteFinancialData();

  // Toggle between real and mock data
  const handleToggleMockData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const useMock = event.target.checked;
    setUseMockData(useMock);
    setDataSource(useMock ? 'mock' : 'document');
    
    // Save preference to session storage
    sessionStorage.setItem('useMockData', useMock.toString());
    
    // If switching to document mode but no documents, redirect to upload
    if (!useMock && !processingComplete) {
      navigate('/upload-documents');
    }
  };
  
  // Handle mock company selection change
  const handleMockCompanyChange = (event: SelectChangeEvent) => {
    setSelectedMockCompany(event.target.value as 'techCompany' | 'manufacturingCompany' | 'retailCompany');
  };

  // Component to display prompt information
  const PromptInfoDisplay: React.FC = () => {
    if (!promptInfo || useMockData) return null;

    return (
      <Grid item xs={12}>
        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            AI Summarization Information
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Summary Type Used:
            </Typography>
            <Chip 
              label={selectedSummaryType || 'comprehensive_summary'} 
              color="primary" 
              variant="outlined"
              sx={{ mb: 1 }}
            />
          </Box>

          {availableSummaryTypes.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Available Summary Types:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {availableSummaryTypes.map((type, index) => (
                  <Chip 
                    key={index}
                    label={type}
                    variant={type === selectedSummaryType ? "filled" : "outlined"}
                    color={type === selectedSummaryType ? "primary" : "default"}
                    size="small"
                  />
                ))}
              </Box>
            </Box>
          )}

          {promptInfo.cache_info && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Prompt Cache Status:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cache Size: {promptInfo.cache_info.cache_size}
              </Typography>
              {promptInfo.cache_info.cached_prompts.length > 0 && (
                <Typography variant="body2" color="text.secondary">
                  Cached Prompts: {promptInfo.cache_info.cached_prompts.join(', ')}
                </Typography>
              )}
            </Box>
          )}
        </Paper>
      </Grid>
    );
  };

  // Component for future summary type selection (placeholder for future enhancement)
  const SummaryTypeSelector: React.FC = () => {
    if (!availableSummaryTypes.length || useMockData) return null;

    // This is a placeholder for future implementation
    // Currently shows available types but doesn't allow selection
    return (
      <Grid item xs={12}>
        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Summary Type Selection
            </Typography>
            <Chip 
              label="Future Enhancement" 
              color="info" 
              variant="outlined"
              size="small"
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Future versions will allow you to regenerate summaries with different analysis strategies.
          </Typography>
          
          <FormControl disabled fullWidth size="small">
            <InputLabel>Summary Type</InputLabel>
            <Select
              value={selectedSummaryType}
              label="Summary Type"
            >
              {availableSummaryTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              This feature will be available in future updates
            </FormHelperText>
          </FormControl>
        </Paper>
      </Grid>
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        position: 'relative',
        zIndex: 1
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, md: 4 },
          borderRadius: 0,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          position: 'relative',
          zIndex: 2
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 600,
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Financial Analysis Results
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Review insights from your financial documents
          </Typography>
        </Box>
        <React.Fragment>
          {error ? (
            <Alert severity="error" sx={{ mb: 3, width: '100%' }}>
              {error}
            </Alert>
          ) : useMockData ? (
            <Alert severity="info" sx={{ mb: 3, width: '100%' }}>
              Viewing mock financial data. Select a company type below to see different data patterns.
            </Alert>
          ) : summaryResult ? (
            <Alert severity="success" sx={{ mb: 3, width: '100%' }}>
              Analysis complete! Generated comprehensive summary from {summaryResult.total_files_processed} files.
            </Alert>
          ) : (
            <Alert severity="success" sx={{ mb: 3, width: '100%' }}>
              Analysis complete! Review your financial insights below.
            </Alert>
          )}
          
          <Box sx={{ width: '100%', flexGrow: 1 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    {useMockData ? 'Data Source Selection' : 'Processing Summary'}
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={useMockData}
                        onChange={handleToggleMockData}
                        color="primary"
                      />
                    }
                    label="Use Mock Data"
                  />
                </Box>
                
                {useMockData ? (
                  <Box>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel id="mock-company-select-label">Sample Company Data</InputLabel>
                      <Select
                        labelId="mock-company-select-label"
                        value={selectedMockCompany}
                        onChange={handleMockCompanyChange}
                        label="Sample Company Data"
                      >
                        <MenuItem value="techCompany">Technology Company</MenuItem>
                        <MenuItem value="manufacturingCompany">Manufacturing Company</MenuItem>
                        <MenuItem value="retailCompany">Retail Company</MenuItem>
                      </Select>
                      <FormHelperText>Select sample financial data to visualize</FormHelperText>
                    </FormControl>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Viewing mock data for demonstration purposes. This data represents typical financial patterns for a {selectedMockCompany.replace('Company', '')} company.
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <Typography variant="body1">
                      Successfully processed {stats.count} {stats.count === 1 ? 'document' : 'documents'}
                      {summaryResult && ` and generated comprehensive analysis`}
                    </Typography>
                    {stats.errorCount > 0 && (
                      <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                        {stats.errorCount} {stats.errorCount === 1 ? 'document' : 'documents'} had errors during processing
                      </Typography>
                    )}
                    {summaryResult && summaryResult.analysis_files_used && summaryResult.analysis_files_used.length > 0 && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Analysis files used: {summaryResult.analysis_files_used.join(', ')}
                      </Typography>
                    )}
                    {summaryResult && summaryResult.files_processed && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Files processed: {summaryResult.files_processed}
                      </Typography>
                    )}
                    {summaryResult && summaryResult.processed_files && summaryResult.processed_files.length > 0 && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Processed files: {summaryResult.processed_files.join(', ')}
                      </Typography>
                    )}
                    {summaryResult && summaryResult.summary_file_path && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Summary saved to: {summaryResult.summary_file_path}
                      </Typography>
                    )}
                    {summaryResult && summaryResult.message && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {summaryResult.message}
                      </Typography>
                    )}
                  </>
                )}
                
                <Button 
                  variant="outlined" 
                  color="primary" 
                  onClick={handleStartOver}
                  sx={{ mt: 2 }}
                >
                  {useMockData ? 'Upload Real Documents' : 'Upload New Documents'}
                </Button>
              </Paper>
            </Grid>

            {/* Show error if summary failed */}
            {!useMockData && summaryResult && !summaryResult.success && (
              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                  <Alert severity="error">
                    Failed to generate comprehensive summary: {summaryResult.error || 'Unknown error'}
                    {summaryResult.error && summaryResult.error.includes('prompt') && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2">
                          This may be related to prompt configuration. Check if fallback prompts were used.
                        </Typography>
                      </Box>
                    )}
                  </Alert>
                </Paper>
              </Grid>
            )}

            {/* Show warning for fallback prompt usage */}
            {!useMockData && summaryResult && summaryResult.success && promptInfo && 
             promptInfo.cache_info.cached_prompts.length > 0 && 
             !promptInfo.cache_info.cached_prompts.includes(selectedSummaryType) && (
              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                  <Alert severity="warning">
                    <Typography variant="body2">
                      Fallback prompt may have been used for this analysis. 
                      The requested summary type "{selectedSummaryType}" was not found in cached prompts.
                    </Typography>
                  </Alert>
                </Paper>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <FinancialCharts 
                loading={isLoading} 
                data={completeFinancialData}
              />
            </Grid>
            
            <PromptInfoDisplay />
            <SummaryTypeSelector />
          </Grid>
          </Box>
        </React.Fragment>
      </Paper>
      
      <Box sx={{ textAlign: 'center', p: 2, color: 'text.secondary' }}>
        <Typography variant="body2">
          AI Financial Report Analyzer &copy; {new Date().getFullYear()}
        </Typography>
      </Box>
    </Box>
  );
};

export default ViewResultsPage; 