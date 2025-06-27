import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  Alert,
  Chip,
  CircularProgress,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Switch,
  FormControlLabel,
  SelectChangeEvent
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { FinancialData, BackendCashFlowData, transformBackendCashFlowData } from '../../components/Visualization/types';
import { UploadedFile, DOCUMENT_TYPES } from '../../components/FileUpload/CategoryFileUpload';
import { mockFinancialData } from '../../mock/financial-data';
import { 
  FinancialMetric, 
  ProcessingResult,
  BalanceSheetData,
  CashFlowData,
  IncomeStatementData,
  FinancialPositionData
} from '../../types';
import { IncomeStatementData as IncomeStatementDataType } from '../../types/incomeStatement';
import DocumentTypeNavigation from './DocumentTypeNavigation';

// Interface for summary result
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

// Props interface for BaseResultsPage
export interface BaseResultsPageProps {
  documentType: 'balance-sheet' | 'cash-flow' | 'income-statement';
  children?: React.ReactNode;
}

// Return interface for useBaseResultsPage hook
export interface BaseResultsPageReturn {
  // Data
  uploadedFiles: UploadedFile[];
  processingResults: ProcessingResult[];
  summaryResult: SummaryResult | null;
  
  // State
  isLoading: boolean;
  error: string | null;
  useMockData: boolean;
  selectedMockCompany: 'techCompany' | 'manufacturingCompany' | 'retailCompany';
  availableSummaryTypes: string[];
  selectedSummaryType: string;
  promptInfo: any;
  processingComplete: boolean;
  
  // Handlers
  handleStartOver: () => void;
  handleToggleMockData: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleMockCompanyChange: (event: SelectChangeEvent) => void;
  
  // Data getters
  getFinancialData: () => Record<string, FinancialMetric>;
  getFilteredFinancialData: (docType: string) => FinancialData;
  getUploadedFilesStats: () => {
    count: number;
    categories: string[];
    successCount: number;
    errorCount: number;
  };
  
  // UI Components
  PromptInfoDisplay: React.FC;
  SummaryTypeSelector: React.FC;
  ProcessingSummary: React.FC;
  
  // Utilities
  formatCurrency: (value: number | string) => string;
  theme: any;
}

// Custom hook for base results page functionality
export const useBaseResultsPage = (documentType: string): BaseResultsPageReturn => {
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
  const [promptInfo, setPromptInfo] = useState<any>(null);

  // Load results from session storage
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

        // Get processing results
        const resultsJson = sessionStorage.getItem('processingResults');
        if (resultsJson) {
          const results = JSON.parse(resultsJson) as ProcessingResult[];
          setProcessingResults(results);
        }

        // Get summary result
        const summaryJson = sessionStorage.getItem('summaryResult');
        if (summaryJson) {
          const summary = JSON.parse(summaryJson) as SummaryResult;
          setSummaryResult(summary);
          
          // Extract metadata information
          if (summary.metadata) {
            setAvailableSummaryTypes(summary.metadata.available_summary_types || []);
            setSelectedSummaryType(summary.metadata.default_summary_type || '');
            setPromptInfo(summary.metadata.prompt_info || null);
          }
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

  // Transform cash flow data
  const transformCashFlowData = useCallback((summaryContent: string): Partial<FinancialData> => {
    try {
      // Handle markdown-wrapped JSON (```json ... ```)
      let jsonString = summaryContent;
      if (summaryContent.includes('```json')) {
        const match = summaryContent.match(/```json\n([\s\S]*?)\n```/);
        if (match && match[1]) {
          jsonString = match[1];
        }
      }
      
      const backendData = JSON.parse(jsonString);
      
      // Check if this is cash flow data or income statement data
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
        result = transformBackendCashFlowData(backendData as BackendCashFlowData);
      }
      
      if (isIncomeStatementData) {
        result.incomeStatementData = backendData as IncomeStatementDataType;
      }
      
      return result;
    } catch (error) {
      console.error('Error parsing backend data:', error);
      return {};
    }
  }, []);

  // Get financial data
  const getFinancialData = useCallback(() => {
    // If using mock data, return the selected mock company's financial metrics
    if (useMockData || dataSource === 'mock') {
      return mockFinancialData[selectedMockCompany].financialMetrics || {};
    }
    
    // Use summary result data as primary source
    if (summaryResult && summaryResult.success && summaryResult.financial_data) {
      return summaryResult.financial_data;
    }
    
    // Fallback to individual processing results
    const combinedData: Record<string, FinancialMetric> = {};
    
    processingResults.forEach(result => {
      if (result.success && result.financial_data) {
        Object.entries(result.financial_data).forEach(([key, value]) => {
          if (!combinedData[key] || 
              (combinedData[key].value === undefined && value.value !== undefined)) {
            combinedData[key] = value;
          }
        });
      }
    });
    
    return combinedData;
  }, [processingResults, summaryResult, useMockData, dataSource, selectedMockCompany]);

  // Get complete financial data for charts
  const getCompleteFinancialData = useCallback((): FinancialData => {
    // If using mock data, return the complete mock data structure
    if (useMockData || dataSource === 'mock') {
      return mockFinancialData[selectedMockCompany];
    }
    
    // Transform cash flow data from summary_content if available
    let transformedData: Partial<FinancialData> = {};
    if (summaryResult && summaryResult.summary_content) {
      transformedData = transformCashFlowData(summaryResult.summary_content);
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

  // Filter financial data by document type
  const getFilteredFinancialData = useCallback((docType: string): FinancialData => {
    const completeData = getCompleteFinancialData();
    
    // Document-specific filtering logic
    const documentFilters: Record<string, string[]> = {
      'balance-sheet': ['totalAssets', 'totalLiabilities', 'equity', 'currentAssets', 'currentLiabilities'],
      'cash-flow': ['netOperating', 'netInvesting', 'netFinancing', 'cashFlowOperating'],
      'income-statement': ['totalRevenue', 'totalExpenses', 'netIncome', 'grossProfit', 'operatingIncome']
    };

    const relevantMetrics = documentFilters[docType] || [];
    
    // Filter financial metrics
    const filteredMetrics: Record<string, FinancialMetric> = {};
    Object.entries(completeData.financialMetrics || {}).forEach(([key, value]) => {
      if (relevantMetrics.some(metric => key.toLowerCase().includes(metric.toLowerCase()))) {
        filteredMetrics[key] = value;
      }
    });

    // Return filtered data based on document type
    return {
      ...completeData,
      financialMetrics: filteredMetrics
    };
  }, [getCompleteFinancialData]);

  // Get uploaded files stats
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

  // Handlers
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
  
  const handleMockCompanyChange = (event: SelectChangeEvent) => {
    setSelectedMockCompany(event.target.value as 'techCompany' | 'manufacturingCompany' | 'retailCompany');
  };

  // UI Components
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

  const SummaryTypeSelector: React.FC = () => {
    if (!availableSummaryTypes.length || useMockData) return null;

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

  const ProcessingSummary: React.FC = () => {
    const stats = getUploadedFilesStats();
    
    return (
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
    );
  };

  return {
    // Data
    uploadedFiles,
    processingResults,
    summaryResult,
    
    // State
    isLoading,
    error,
    useMockData,
    selectedMockCompany,
    availableSummaryTypes,
    selectedSummaryType,
    promptInfo,
    processingComplete,
    
    // Handlers
    handleStartOver,
    handleToggleMockData,
    handleMockCompanyChange,
    
    // Data getters
    getFinancialData,
    getFilteredFinancialData,
    getUploadedFilesStats,
    
    // UI Components
    PromptInfoDisplay,
    SummaryTypeSelector,
    ProcessingSummary,
    
    // Utilities
    formatCurrency,
    theme
  };
};

// Base component for document-specific results pages
export const BaseResultsPage: React.FC<BaseResultsPageProps> = ({ documentType, children }) => {
  const {
    isLoading,
    error,
    theme
  } = useBaseResultsPage(documentType);

  const location = useLocation();
  const path = location.pathname;
  
  // Define individual document routes that should not show tabs
  const individualDocumentRoutes = [
    '/view-results/balance-sheet',
    '/view-results/cash-flow', 
    '/view-results/income-statement'
  ];
  
  // Check if current route is an individual document page
  const isIndividualDocumentPage = individualDocumentRoutes.includes(path);

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
        flexGrow: 1
      }}
    >
      {!isIndividualDocumentPage && <DocumentTypeNavigation />}
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, md: 4 },
          borderRadius: 0,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1
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
            {getDocumentTitle(documentType)} Analysis Results
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Review insights from your {getDocumentTitle(documentType).toLowerCase()} documents
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, width: '100%' }}>
            {error}
          </Alert>
        )}

        {children}
      </Paper>
      
      <Box sx={{ textAlign: 'center', p: 2, color: 'text.secondary' }}>
        <Typography variant="body2">
          AI Financial Report Analyzer &copy; {new Date().getFullYear()}
        </Typography>
      </Box>
    </Box>
  );
};

// Helper function to get document title
const getDocumentTitle = (documentType: string): string => {
  const titles: Record<string, string> = {
    'balance-sheet': 'Balance Sheet',
    'cash-flow': 'Cash Flow',
    'income-statement': 'Income Statement'
  };
  return titles[documentType] || 'Financial';
};

export default BaseResultsPage; 