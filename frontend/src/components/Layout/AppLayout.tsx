import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import { Outlet } from 'react-router-dom';
import AppNavbar from './AppNavbar';

const AppLayout: React.FC = () => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      width: '100%',
      maxWidth: '100vw',
      overflow: 'hidden'
    }}>
      <CssBaseline />
      <AppNavbar />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          width: '100%'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AppLayout; 