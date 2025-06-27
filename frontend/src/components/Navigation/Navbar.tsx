import React from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
  useTheme
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ChatIcon from '@mui/icons-material/Chat';

interface NavbarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onPageChange }) => {
  const theme = useTheme();

  return (
    <AppBar 
      position="static" 
      color="default" 
      elevation={0}
      sx={{ 
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ flexWrap: 'wrap' }}>
          <Typography variant="h6" color="primary" fontWeight="bold" sx={{ flexGrow: 1 }}>
            AI Financial Analyzer
          </Typography>
          <Box>
            <Button
              startIcon={<DashboardIcon />}
              sx={{ 
                my: 1, 
                mx: 1.5,
                color: currentPage === 'dashboard' ? 'primary.main' : 'text.secondary',
                borderBottom: currentPage === 'dashboard' ? `2px solid ${theme.palette.primary.main}` : 'none',
                borderRadius: 0,
                '&:hover': {
                  backgroundColor: 'transparent',
                  borderBottom: `2px solid ${theme.palette.primary.main}`,
                }
              }}
              onClick={() => onPageChange('dashboard')}
            >
              Dashboard
            </Button>
            <Button
              startIcon={<ChatIcon />}
              sx={{ 
                my: 1, 
                mx: 1.5,
                color: currentPage === 'chat' ? 'primary.main' : 'text.secondary',
                borderBottom: currentPage === 'chat' ? `2px solid ${theme.palette.primary.main}` : 'none',
                borderRadius: 0,
                '&:hover': {
                  backgroundColor: 'transparent',
                  borderBottom: `2px solid ${theme.palette.primary.main}`,
                }
              }}
              onClick={() => onPageChange('chat')}
            >
              Chat Assistant
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 