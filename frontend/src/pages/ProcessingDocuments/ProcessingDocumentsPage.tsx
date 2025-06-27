import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  Alert,
  CircularProgress,
  useTheme 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { UploadedFile, DOCUMENT_TYPES } from '../../components/FileUpload/CategoryFileUpload';
import axios from 'axios';

// Constants
const API_BASE_URL = 'http://127.0.0.1:5001';

// Types
interface ProcessingResult {
  success: boolean;
  ocr_text: string;
  parsing_results: string;
  financial_analysis: string;
  financial_data?: Record<string, unknown>;
  files: {
    ocr: string;
    parsing: string;
    analysis: string;
    json?: string;
  };
  error?: string;
}

interface AnalysisStatus {
  total_files: number;
  analysis_files: string[];
  ready_for_summary: boolean;
  message: string;
}

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

interface SummarizationStatus {
  success: boolean;
  summarization_completed: boolean;
  output_directory: string;
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
  message: string;
}

interface ProcessingError {
  fileName: string;
  message: string;
}

// Processing phases
enum ProcessingPhase {
  PROCESSING_DOCUMENTS = 'processing_documents',
  CHECKING_STATUS = 'checking_status',
  CHECKING_SUMMARIZATION_STATUS = 'checking_summarization_status',
  GENERATING_SUMMARY = 'generating_summary',
  COMPLETE = 'complete'
}

const ProcessingDocumentsPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const processedRef = useRef(false);
  
  // State management
  const [currentPhase, setCurrentPhase] = useState<ProcessingPhase>(ProcessingPhase.PROCESSING_DOCUMENTS);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [processingResults, setProcessingResults] = useState<ProcessingResult[]>([]);
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);
  const [errors, setErrors] = useState<ProcessingError[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Process a single file
  const processFile = useCallback(async (file: UploadedFile): Promise<ProcessingResult> => {
    const fileIdentifier = `${file.category}-${file.file.name || 'unknown'}`;
    
    if (file.processed) {
      console.log(`Skipping already processed file: ${fileIdentifier}`);
      return {
        success: true,
        ocr_text: 'Already processed', 
        parsing_results: '',
        financial_analysis: '',
        files: { ocr: '', parsing: '', analysis: '' },
        error: ''
      };
    }
    
    file.processed = true;
    
    const formData = new FormData();
    
    if (file.file instanceof File) {
      console.log(`Appending file to form data: ${file.file.name} (${file.file.type}), size: ${file.file.size} bytes`);
      formData.append('document', file.file);
    } else {
      throw new Error('No valid file available for processing');
    }
    
    if (file.category) {
      formData.append('category', file.category);
    }
    
    try {
      console.log(`Sending file ${file.file.name} to ${API_BASE_URL}/api/process-document`);
      
      const response = await axios.post<ProcessingResult>(
        `${API_BASE_URL}/api/process-document`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 300000, // 5 minute timeout
        }
      );
      
      console.log('Processing response received:', response.status);
      console.log('Response data:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error details:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
          config: error.config
        });
        
        const errorMessage = error.response?.data?.error || 
                            `Network error processing ${file.file.name}`;
        throw new Error(errorMessage);
      }
      throw error;
    }
  }, []);

  // Check analysis status
  const checkAnalysisStatus = useCallback(async (): Promise<AnalysisStatus> => {
    try {
      console.log('Checking analysis status...');
      const response = await axios.get<AnalysisStatus>(`${API_BASE_URL}/api/analysis-status`);
      console.log('Analysis status:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error checking analysis status:', error);
      throw new Error('Failed to check analysis status');
    }
  }, []);

  // Check summarization status
  const checkSummarizationStatus = useCallback(async (): Promise<SummarizationStatus> => {
    try {
      console.log('Checking summarization status...');
      const response = await axios.get<SummarizationStatus>(`${API_BASE_URL}/api/summarization-status`);
      console.log('Summarization status:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error checking summarization status:', error);
      throw new Error('Failed to check summarization status');
    }
  }, []);

  // Utility function to determine primary category based on uploaded documents
  const determinePrimaryCategory = useCallback((files: UploadedFile[]): string | null => {
    if (!files || files.length === 0) {
      return null; // No category to send
    }

    // Get the most common document type (in case of mixed uploads)
    const categoryCounts: Record<string, number> = {};
    files.forEach(file => {
      categoryCounts[file.category] = (categoryCounts[file.category] || 0) + 1;
    });

    // Find the category with the highest count
    const primaryCategory = Object.keys(categoryCounts).reduce((a, b) => 
      categoryCounts[a] > categoryCounts[b] ? a : b
    );

    // Map frontend categories to backend expected categories
    const frontendToBackendMapping: Record<string, string> = {
      'balance-sheet': 'balance-sheet',
      'cash-flow': 'cash-flow', 
      'income-statement': 'operating-cost', // Map income-statement to operating-cost for backend
      'assets': 'profit' // Map assets to profit for backend (or keep as assets if backend supports it)
    };

    const backendCategory = frontendToBackendMapping[primaryCategory] || primaryCategory;
    console.log(`Determined primary category: ${primaryCategory} from uploaded files, mapped to backend category: ${backendCategory}`);
    
    return backendCategory;
  }, []);

  // Utility function to determine the correct route based on uploaded document categories
  const determineTargetRoute = useCallback((files: UploadedFile[], sumStatus?: SummarizationStatus): string => {
    // Priority 1: Use backend's default_summary_type if available
    if (sumStatus && sumStatus.default_summary_type) {
      const backendToRouteMapping: Record<string, string> = {
        'cashflow': 'cash-flow',
        'cash-flow': 'cash-flow',
        'income_statement': 'income-statement',
        'income-statement': 'income-statement',
        'balance_sheet': 'balance-sheet',
        'balance-sheet': 'balance-sheet',
        'comprehensive_summary': 'all-kind',
        'comprehensive-summary': 'all-kind'
      };
      
      const backendRoute = backendToRouteMapping[sumStatus.default_summary_type];
      if (backendRoute) {
        console.log(`Using backend default_summary_type: ${sumStatus.default_summary_type} -> route: ${backendRoute}`);
        return backendRoute;
      }
    }

    // Priority 2: Fall back to uploaded file categories if no backend route determined
    if (!files || files.length === 0) {
      console.log('No files provided, using default fallback route: balance-sheet');
      return 'balance-sheet'; // Default fallback
    }

    // Check if any file is of multiple-type category
    const hasMultipleType = files.some(file => file.category === 'multiple-type');
    if (hasMultipleType) {
      console.log('Found multiple-type category, routing to all-kind');
      return 'all-kind';
    }

    // Get the most common document type for navigation
    const categoryCounts: Record<string, number> = {};
    files.forEach(file => {
      categoryCounts[file.category] = (categoryCounts[file.category] || 0) + 1;
    });

    // Find the category with the highest count
    const primaryCategory = Object.keys(categoryCounts).reduce((a, b) => 
      categoryCounts[a] > categoryCounts[b] ? a : b
    );

    // Map frontend categories to result page routes
    const categoryToRouteMapping: Record<string, string> = {
      'balance-sheet': 'balance-sheet',
      'cash-flow': 'cash-flow',
      'income-statement': 'income-statement',
      'assets': 'balance-sheet', // Assets documents go to balance sheet view
      'multiple-type': 'all-kind'
    };

    const targetRoute = categoryToRouteMapping[primaryCategory] || 'balance-sheet';
    
    // Log summarization status information if available
    if (sumStatus) {
      console.log(`Summarization completed: ${sumStatus.summarization_completed}`);
      console.log(`Available summary types: ${sumStatus.available_summary_types.join(', ')}`);
      console.log(`Default summary type: ${sumStatus.default_summary_type}`);
    }
    
    console.log(`Determined navigation route: ${targetRoute} for primary category: ${primaryCategory}`);
    
    return targetRoute;
  }, []);

  // Generate comprehensive summary
  const generateSummary = useCallback(async (files: UploadedFile[]): Promise<SummaryResult> => {
    try {
      console.log('Generating comprehensive summary...');
      
      // Determine the primary category based on uploaded documents
      const primaryCategory = determinePrimaryCategory(files);
      
      // Prepare request payload
      const payload: { category?: string } = {};
      if (primaryCategory) {
        payload.category = primaryCategory;
        console.log(`Sending category: ${primaryCategory} to generate-summary endpoint`);
      } else {
        console.log('No category determined, sending empty payload for comprehensive summary');
      }
      
      const response = await axios.post<SummaryResult>(`${API_BASE_URL}/api/generate-summary`, payload);
      console.log('Summary generated:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error generating summary:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || 'Failed to generate summary';
        throw new Error(errorMessage);
      }
      throw error;
    }
  }, [determinePrimaryCategory]);

  // Process all files with new workflow
  const processAllFiles = useCallback(async () => {
    const files = window.uploadedFiles;
    
    if (!files || !Array.isArray(files) || files.length === 0) {
      console.log('No files to process');
      return;
    }

    console.log(`Starting new workflow with ${files.length} files`);

    try {
      setIsProcessing(true);
      setProcessingProgress(5);
      setUploadedFiles(files);
      
      // Filter out already processed files
      const unprocessedFiles = files.filter(file => !file.processed);
      
      if (unprocessedFiles.length === 0) {
        console.log('No new files to process, checking status...');
        setCurrentPhase(ProcessingPhase.CHECKING_STATUS);
        setProcessingProgress(50);
        
        // Skip to status check
        const status = await checkAnalysisStatus();
        if (status.ready_for_summary) {
          // Phase 2a: Check summarization status
          setCurrentPhase(ProcessingPhase.CHECKING_SUMMARIZATION_STATUS);
          setProcessingProgress(60);
          
          const sumStatus = await checkSummarizationStatus();
          console.log(`Summarization status: completed=${sumStatus.summarization_completed}`);
          
          if (sumStatus.summarization_completed) {
            console.log('Summarization already completed, skipping generation...');
            setCurrentPhase(ProcessingPhase.COMPLETE);
            setProcessingProgress(100);
            setIsProcessing(false);
            
            // Store results and navigate
            sessionStorage.setItem('processingComplete', 'true');
            
            // Determine the correct route based on uploaded document categories
            const targetRoute = determineTargetRoute(files, sumStatus);
            
            setTimeout(() => {
              navigate(`/view-results/${targetRoute}`);
            }, 2000);
          } else {
            // Phase 3: Generate comprehensive summary
            setCurrentPhase(ProcessingPhase.GENERATING_SUMMARY);
            setProcessingProgress(80);
            
            const summary = await generateSummary(files);
            setSummaryResult(summary);
            
            // Phase 4: Verify summarization completion
            setProcessingProgress(90);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Brief wait for summarization to complete
            
            const finalSumStatus = await checkSummarizationStatus();
            if (!finalSumStatus.summarization_completed) {
              console.warn('Summarization may not be fully complete yet');
            }
            
            setCurrentPhase(ProcessingPhase.COMPLETE);
            setProcessingProgress(100);
            setIsProcessing(false);
            
            // Store results and navigate
            sessionStorage.setItem('summaryResult', JSON.stringify(summary));
            sessionStorage.setItem('processingComplete', 'true');
            
            // Determine the correct route based on uploaded document categories
            const targetRoute = determineTargetRoute(files, finalSumStatus);
            
            setTimeout(() => {
              navigate(`/view-results/${targetRoute}`);
            }, 2000);
          }
        }
        return;
      }
      
      console.log(`Processing ${unprocessedFiles.length} unprocessed files`);
      
      // Phase 1: Process documents individually
      setCurrentPhase(ProcessingPhase.PROCESSING_DOCUMENTS);
      const results: ProcessingResult[] = [];
      let processed = 0;
      
      for (const file of unprocessedFiles) {
        try {
          console.log(`Processing file ${file.category}-${file.file.name}`);
          const result = await processFile(file);
          results.push(result);
          
          // Update progress (0-40% for document processing)
          processed++;
          const progressPercentage = 5 + (processed / unprocessedFiles.length) * 35;
          setProcessingProgress(progressPercentage);
          
        } catch (error) {
          console.error(`Error processing file:`, error);
          results.push({
            success: false,
            ocr_text: '',
            parsing_results: '',
            financial_analysis: '',
            files: { ocr: '', parsing: '', analysis: '' },
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          
          processed++;
          const progressPercentage = 5 + (processed / unprocessedFiles.length) * 35;
          setProcessingProgress(progressPercentage);
        }
      }
      
      setProcessingResults(results);
      console.log('Document processing complete, checking analysis status...');
      
      // Phase 2: Check analysis status
      setCurrentPhase(ProcessingPhase.CHECKING_STATUS);
      setProcessingProgress(50);
      
      // Wait a moment for files to be written
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const status = await checkAnalysisStatus();
      console.log(`Analysis status: ${status.total_files} files, ready: ${status.ready_for_summary}`);
      
      if (!status.ready_for_summary) {
        throw new Error(`Analysis not ready: ${status.message}`);
      }
      
      // Phase 2a: Check summarization status
      setCurrentPhase(ProcessingPhase.CHECKING_SUMMARIZATION_STATUS);
      setProcessingProgress(60);
      
      const sumStatus = await checkSummarizationStatus();
      console.log(`Summarization status: completed=${sumStatus.summarization_completed}`);
      
      let finalSummarizationStatus = sumStatus;
      
      if (sumStatus.summarization_completed) {
        console.log('Summarization already completed, skipping generation...');
        setCurrentPhase(ProcessingPhase.COMPLETE);
        setProcessingProgress(100);
        setErrors([]);
        setIsProcessing(false);
      } else {
        // Phase 3: Generate comprehensive summary
        setCurrentPhase(ProcessingPhase.GENERATING_SUMMARY);
        setProcessingProgress(80);
        
        const summary = await generateSummary(files);
        setSummaryResult(summary);
        
        // Phase 4: Verify summarization completion
        setProcessingProgress(90);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Brief wait for summarization to complete
        
        finalSummarizationStatus = await checkSummarizationStatus();
        if (!finalSummarizationStatus.summarization_completed) {
          console.warn('Summarization may not be fully complete yet');
        }
        
        // Store summary result for the results page
        sessionStorage.setItem('summaryResult', JSON.stringify(summary));
        
        // Phase 5: Complete
        setCurrentPhase(ProcessingPhase.COMPLETE);
        setProcessingProgress(100);
        setErrors([]);
        setIsProcessing(false);
      }
      
      // Store results in sessionStorage for results page
      sessionStorage.setItem('processingResults', JSON.stringify(results));
      sessionStorage.setItem('processingComplete', 'true');
      
      console.log('All phases complete, navigating to results...');
      
      // Determine the correct route based on uploaded document categories
      const targetRoute = determineTargetRoute(files, finalSummarizationStatus);
      
      // Auto-navigate to results after a delay
      setTimeout(() => {
        navigate(`/view-results/${targetRoute}`);
      }, 2000);
      
    } catch (error) {
      console.error('Error in processing workflow:', error);
      setErrors([{ 
        fileName: 'Processing error', 
        message: error instanceof Error ? error.message : 'Failed to complete processing workflow' 
      }]);
      setIsProcessing(false);
    }
  }, [processFile, checkAnalysisStatus, checkSummarizationStatus, generateSummary, navigate, determineTargetRoute]);

  // Initialize processing on component mount
  useEffect(() => {
    const testApiConnection = async () => {
      try {
        console.log('Testing API connection...');
        const testResponse = await axios.get(`${API_BASE_URL}/`);
        console.log('API test response:', testResponse.status, testResponse.data);
      } catch (error) {
        console.error('API test failed:', error);
      }
    };
    
    testApiConnection();
    
    if (processedRef.current) {
      console.log('Files have already been processed in this session, skipping duplicate processing');
      return;
    }
    
    const initializeProcessing = async () => {
      processedRef.current = true;
      
      const files = window.uploadedFiles;
      
      if (files && Array.isArray(files) && files.length > 0) {
        console.log(`Found ${files.length} files in window.uploadedFiles, starting new workflow`);
        setUploadedFiles(files);
        await processAllFiles();
        return;
      }
      
      const sessionData = sessionStorage.getItem('uploadedFilesMetadata');
      if (sessionData) {
        try {
          console.log('Files not found in window object, trying session storage');
          navigate('/upload-documents');
        } catch (error) {
          console.error('Error initializing from session storage:', error);
          navigate('/upload-documents');
        }
      } else {
        console.log('No files found for processing, redirecting to upload page');
        navigate('/upload-documents');
      }
    };

    initializeProcessing();
  }, [processAllFiles, navigate]);

  // Get categories of the uploaded files
  const getCategories = useCallback(() => {
    return uploadedFiles.map(file => {
      const category = DOCUMENT_TYPES.find(cat => cat.id === file.category);
      return category ? category.name : file.category;
    });
  }, [uploadedFiles]);

  // Handle manual navigation to results
  const handleManualContinue = useCallback(() => {
    // Determine the correct route based on uploaded document categories
    const files = window.uploadedFiles || uploadedFiles;
    const targetRoute = determineTargetRoute(files);
    navigate(`/view-results/${targetRoute}`);
  }, [navigate, uploadedFiles, determineTargetRoute]);

  // Get phase description
  const getPhaseDescription = () => {
    switch (currentPhase) {
      case ProcessingPhase.PROCESSING_DOCUMENTS:
        return 'Processing individual documents...';
      case ProcessingPhase.CHECKING_STATUS:
        return 'Checking analysis status...';
      case ProcessingPhase.CHECKING_SUMMARIZATION_STATUS:
        return 'Checking summarization status...';
      case ProcessingPhase.GENERATING_SUMMARY:
        return 'Generating comprehensive summary...';
      case ProcessingPhase.COMPLETE:
        return 'Analysis complete!';
      default:
        return 'Processing...';
    }
  };

  // Get phase title
  const getPhaseTitle = () => {
    switch (currentPhase) {
      case ProcessingPhase.PROCESSING_DOCUMENTS:
        return 'Document Processing';
      case ProcessingPhase.CHECKING_STATUS:
        return 'Analysis Status Check';
      case ProcessingPhase.CHECKING_SUMMARIZATION_STATUS:
        return 'Summarization Status Check';
      case ProcessingPhase.GENERATING_SUMMARY:
        return 'Summary Generation';
      case ProcessingPhase.COMPLETE:
        return 'Complete';
      default:
        return 'Processing';
    }
  };

  // Early return while processing
  if (!uploadedFiles.length && !errors.length) {
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
            Processing Documents
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Our AI is analyzing your financial documents
          </Typography>
        </Box>
        
        {errors.length > 0 && (
          <Alert severity="error" sx={{ mb: 3, width: '100%' }}>
            {errors.length === 1 
              ? `Error: ${errors[0].message}` 
              : `${errors.length} errors occurred during processing. See results page for details.`}
          </Alert>
        )}
        
        {currentPhase === ProcessingPhase.COMPLETE ? (
          <Alert severity="success" sx={{ mb: 3, width: '100%' }}>
            Processing complete! {summaryResult && summaryResult.files_processed 
              ? `Generated summary from ${summaryResult.files_processed} files.`
              : summaryResult && `Generated summary from ${summaryResult.total_files_processed} files.`}
            {summaryResult && summaryResult.message && (
              <Box component="span" sx={{ display: 'block', mt: 1, fontSize: '0.875rem' }}>
                {summaryResult.message}
              </Box>
            )}
          </Alert>
        ) : (
          <Alert severity="info" sx={{ mb: 3, width: '100%' }}>
            {getPhaseDescription()} This process involves multiple steps for comprehensive analysis.
          </Alert>
        )}
        
        <Box sx={{ textAlign: 'center', p: 5, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1 }}>
          <CircularProgress 
            variant="determinate" 
            value={processingProgress} 
            size={80} 
            thickness={4}
            sx={{ mb: 3 }}
          />
          
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="h6">
              {currentPhase === ProcessingPhase.COMPLETE 
                ? 'Analysis Complete!' 
                : `${getPhaseTitle()} - ${Math.round(processingProgress)}%`}
            </Typography>
          </Box>
          
          <Typography variant="body1" paragraph>
            {currentPhase === ProcessingPhase.COMPLETE 
              ? `All documents have been analyzed and summarized${errors.length ? ' with some errors' : ' successfully'}.` 
              : getPhaseDescription()}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {currentPhase === ProcessingPhase.COMPLETE
              ? 'You will be redirected to the results page in a moment.'
              : 'The new workflow processes documents individually, then generates a comprehensive summary.'}
          </Typography>
          
          {uploadedFiles.length > 0 && (
            <Box sx={{ mt: 4, mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Processing categories:
              </Typography>
              <Box sx={{ mt: 1 }}>
                {getCategories().map((category, index) => (
                  <Typography key={index} variant="body2">
                    • {category} {currentPhase === ProcessingPhase.COMPLETE || processingProgress >= 50 ? '✓' : ''}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}
          
          {currentPhase === ProcessingPhase.COMPLETE && (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleManualContinue}
              sx={{ mt: 3 }}
              disabled={isProcessing}
            >
              View Results
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ProcessingDocumentsPage; 