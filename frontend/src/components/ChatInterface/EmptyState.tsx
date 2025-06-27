import React from 'react';
import { Box, Typography, Paper, styled } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';

const EmptyContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  borderRadius: 16,
  backgroundColor: theme.palette.background.paper,
  margin: theme.spacing(2),
  boxShadow: 'none',
  border: `1px dashed ${theme.palette.divider}`,
  height: '70%',
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.main,
  borderRadius: '50%',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const EmptyState: React.FC = () => {
  return (
    <EmptyContainer>
      <IconWrapper>
        <ChatIcon fontSize="large" />
      </IconWrapper>
      <Typography variant="h6" gutterBottom>
        No messages yet
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: 400 }}>
        Start a conversation by typing a message below. You can ask about financial analysis, report generation, or data visualization.
      </Typography>
    </EmptyContainer>
  );
};

export default EmptyState; 