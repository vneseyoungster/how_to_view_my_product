import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Stepper, 
  Step, 
  StepLabel,
  Button,
  Alert,
  Grid,
  Divider,
  styled,
  useTheme
} from '@mui/material';
import CategoryFileUpload, { UploadedFile, DOCUMENT_TYPES } from '../FileUpload/CategoryFileUpload';
import FinancialCharts from '../Visualization/FinancialCharts';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';

// Define interface for processing status
interface ProcessingStatus {
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  message: string;
  files?: UploadedFile[];
}

// Styled components
const StepIconRoot = styled('div')<{ ownerState: { active?: boolean; completed?: boolean } }>(
  ({ theme, ownerState }) => ({
    display: 'flex',
    height: 22,
    alignItems: 'center',
    color: theme.palette.text.secondary,
    '& .StepIcon-completedIcon': {
      color: theme.palette.primary.main,
      zIndex: 1,
      fontSize: 18,
    },
    '& .StepIcon-circle': {
      width: 8,
      height: 8,
      borderRadius: '50%',
      backgroundColor: ownerState.completed
        ? theme.palette.primary.main
        : ownerState.active
        ? theme.palette.primary.main
        : theme.palette.grey[300],
    },
  }),
);

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    status: 'idle',
    message: 'Upload your financial images to begin analysis'
  });
  const [dataLoaded, setDataLoaded] = useState(false);

  const steps = ['Upload Documents', 'Processing', 'View Analysis'];

  const handleUploadComplete = (files: UploadedFile[]) => {
    setProcessingStatus({
      status: 'processing',
      message: 'Your documents are being processed. This may take a few moments...',
      files
    });
    setActiveStep(1);
    
    // Simulate processing time
    setTimeout(() => {
      // For demonstration purposes, we'll just show the files as processed
      // In a real application, this would likely involve making API calls to get processing results
      setProcessingStatus({
        status: 'completed',
        message: 'Files uploaded successfully! In a complete application, these would be analyzed by the backend.',
        files
      });
      setDataLoaded(true);
      setActiveStep(2);
    }, 3000);
  };

  const handleReset = () => {
    setActiveStep(0);
    setProcessingStatus({
      status: 'idle',
      message: 'Upload your financial images to begin analysis',
      files: undefined
    });
    setDataLoaded(false);
  };

  // Get count of uploaded files by category
  const getUploadedFilesStats = () => {
    if (!processingStatus.files) return { count: 0, categories: [] };
    
    const categories = processingStatus.files.map(file => {
      const category = DOCUMENT_TYPES.find(cat => cat.id === file.category);
      return category ? category.name : file.category;
    });
    
    return {
      count: processingStatus.files.length,
      categories
    };
  };

  const stats = getUploadedFilesStats();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 2 }}>
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
            AI Financial Report Analyzer
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Upload your financial document images and get instant insights with AI-powered analysis
          </Typography>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label, index) => {
            const stepProps: { completed?: boolean } = {};
            
            return (
              <Step key={label} {...stepProps}>
                <StepLabel 
                  StepIconComponent={(props) => {
                    const { active, completed } = props;
                    
                    let icon;
                    if (index === 0) {
                      icon = <UploadFileIcon />;
                    } else if (index === 1) {
                      icon = <AnalyticsIcon />;
                    } else {
                      icon = <AutoGraphIcon />;
                    }
                    
                    return (
                      <StepIconRoot ownerState={{ active, completed }}>
                        {completed ? icon : active ? icon : <div className="StepIcon-circle" />}
                      </StepIconRoot>
                    );
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            );
          })}
        </Stepper>
        
        {processingStatus.status === 'error' && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {processingStatus.message}
          </Alert>
        )}
        
        {processingStatus.status === 'processing' && (
          <Alert severity="info" sx={{ mb: 3 }}>
            {processingStatus.message}
          </Alert>
        )}
        
        {processingStatus.status === 'completed' && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {processingStatus.message}
          </Alert>
        )}
        
        <Box>
          {activeStep === 0 && (
            <CategoryFileUpload onComplete={handleUploadComplete} />
          )}
          
          {activeStep === 1 && (
            <Box sx={{ textAlign: 'center', p: 5 }}>
              <Typography variant="h6" gutterBottom>
                Processing {stats.count} {stats.count === 1 ? 'document' : 'documents'}
              </Typography>
              <Typography variant="body1" paragraph>
                Our AI is analyzing your financial documents and extracting key metrics.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This typically takes 30-60 seconds depending on the number and complexity of documents.
              </Typography>
              <Box sx={{ mt: 4, mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Processing categories:
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {stats.categories.map((category, index) => (
                    <Typography key={index} variant="body2">
                      • {category}
                    </Typography>
                  ))}
                </Box>
              </Box>
            </Box>
          )}
          
          {activeStep === 2 && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Upload Status Summary
                    </Typography>
                    <Typography variant="body1">
                      Successfully uploaded {stats.count} {stats.count === 1 ? 'document' : 'documents'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Your files have been uploaded to Firebase Storage successfully. In a complete application, 
                      these would be processed by a backend API for analysis. Currently, we're just demonstrating 
                      the upload functionality.
                    </Typography>
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      onClick={handleReset}
                      sx={{ mt: 1 }}
                    >
                      Upload More Documents
                    </Button>
                  </Paper>
                </Grid>
                
                <Grid item xs={12}>
                  <FinancialCharts loading={!dataLoaded} />
                </Grid>
                
                <Grid item xs={12}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Key Financial Metrics
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Revenue
                          </Typography>
                          <Typography variant="h5">
                            $1,250,000
                          </Typography>
                          <Typography variant="body2" color="success.main">
                            +12.5% YoY
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Net Income
                          </Typography>
                          <Typography variant="h5">
                            $320,000
                          </Typography>
                          <Typography variant="body2" color="success.main">
                            +8.2% YoY
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Cash Flow
                          </Typography>
                          <Typography variant="h5">
                            $160,000
                          </Typography>
                          <Typography variant="body2" color="success.main">
                            +5.3% QoQ
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </Paper>
      
      <Box sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
        <Typography variant="body2">
          AI Financial Report Analyzer &copy; {new Date().getFullYear()}
        </Typography>
      </Box>
    </Container>
  );
};

export default Dashboard; 