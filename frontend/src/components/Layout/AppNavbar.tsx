import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  useTheme,
  Stepper,
  Step,
  StepLabel,
  Container,
  Hidden,
  Divider,
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import ChatIcon from '@mui/icons-material/Chat';

const steps = [
  { label: 'Upload', path: '/upload-documents', icon: <UploadFileIcon /> },
  { label: 'Process', path: '/processing-documents', icon: <AnalyticsIcon /> },
  { label: 'Results', path: '/view-results', icon: <AutoGraphIcon /> },
];

const AppNavbar: React.FC = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  // Set the active step based on the current path
  useEffect(() => {
    const currentPath = location.pathname;
    const index = steps.findIndex(step => step.path === currentPath);
    setActiveStep(index !== -1 ? index : 0);
  }, [location.pathname]);

  // Check if we're in the chat route
  const isChatRoute = location.pathname === '/chat';

  return (
    <AppBar 
      position="static" 
      color="default" 
      elevation={0}
      sx={{ 
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        mb: 2
      }}
    >
      <Container maxWidth={false}>
        <Toolbar>
          <Typography 
            variant="h6" 
            component={Link} 
            to="/" 
            sx={{ 
              flexGrow: 1, 
              textDecoration: 'none', 
              color: theme.palette.primary.main,
              fontWeight: 600,
            }}
          >
            AI Financial Analyzer
          </Typography>

          <Hidden smDown>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {/* Main process steps */}
              {steps.map((step, index) => (
                <Button
                  key={step.path}
                  component={Link}
                  to={step.path}
                  startIcon={step.icon}
                  color={activeStep === index && !isChatRoute ? 'primary' : 'inherit'}
                  sx={{ 
                    mx: 1,
                    borderBottom: activeStep === index && !isChatRoute
                      ? `2px solid ${theme.palette.primary.main}` 
                      : 'none',
                    borderRadius: 0,
                    paddingBottom: '6px',
                  }}
                >
                  {step.label}
                </Button>
              ))}
              
              {/* Divider between main app and chat */}
              <Divider orientation="vertical" flexItem sx={{ mx: 2, height: '24px' }} />
              
              {/* Chat Interface button */}
              <Button
                component={Link}
                to="/chat"
                startIcon={<ChatIcon />}
                color={isChatRoute ? 'primary' : 'inherit'}
                sx={{ 
                  ml: 1,
                  borderBottom: isChatRoute 
                    ? `2px solid ${theme.palette.primary.main}` 
                    : 'none',
                  borderRadius: 0,
                  paddingBottom: '6px',
                }}
              >
                Chat
              </Button>
            </Box>
          </Hidden>
        </Toolbar>
        
        {!isChatRoute && (
          <Hidden mdUp>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ pb: 2 }}>
              {steps.map((step, index) => (
                <Step 
                  key={step.label} 
                  completed={index < activeStep}
                  onClick={() => {
                    if (index <= activeStep) {
                      navigate(step.path);
                    }
                  }}
                  sx={{ 
                    cursor: index <= activeStep ? 'pointer' : 'not-allowed',
                    opacity: index <= activeStep ? 1 : 0.6,
                  }}
                >
                  <StepLabel StepIconComponent={() => React.cloneElement(step.icon, { 
                    color: index <= activeStep ? 'primary' : 'disabled',
                    fontSize: 'small'
                  })}>
                    {step.label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Hidden>
        )}
        
        {/* For mobile - add chat button when in main flow */}
        <Hidden mdUp>
          <Box sx={{ display: 'flex', justifyContent: 'center', pb: 2 }}>
            {isChatRoute ? (
              <Button
                variant="outlined"
                component={Link}
                to="/upload-documents"
                startIcon={<UploadFileIcon />}
                color="primary"
                size="small"
              >
                Back to App
              </Button>
            ) : (
              <Button
                variant="outlined"
                component={Link}
                to="/chat"
                startIcon={<ChatIcon />}
                color="primary"
                size="small"
              >
                Open Chat
              </Button>
            )}
          </Box>
        </Hidden>
      </Container>
    </AppBar>
  );
};

export default AppNavbar; 