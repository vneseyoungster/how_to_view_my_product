import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

const Home: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the upload documents page
    navigate('/upload-documents');
  }, [navigate]);
  
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <CircularProgress />
    </Box>
  );
};

export default Home; 