import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { ChartContainerProps } from '../types';

const ChartContainer: React.FC<ChartContainerProps> = ({ 
  loading = false, 
  height = 400, 
  children 
}) => {
  if (loading) {
    return (
      <Box sx={{ 
        height, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height, position: 'relative' }}>
      {children}
    </Box>
  );
};

export const EmptyChartMessage: React.FC<{ message: string }> = ({ message }) => (
  <Box sx={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100%' 
  }}>
    <Typography color="text.secondary">
      {message}
    </Typography>
  </Box>
);

export default ChartContainer; 