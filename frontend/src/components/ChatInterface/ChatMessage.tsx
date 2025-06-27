import React from 'react';
import { Box, Typography, Paper, Avatar, styled } from '@mui/material';

interface ChatMessageProps {
  text: string;
  isUser: boolean;
  timestamp: string;
}

const MessagePaper = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isUser'
})<{ isUser: boolean }>(({ theme, isUser }) => ({
  padding: theme.spacing(2),
  borderRadius: 12,
  maxWidth: '75%',
  backgroundColor: isUser ? theme.palette.primary.main : theme.palette.background.paper,
  color: isUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
  boxShadow: isUser ? 'none' : '0 2px 4px rgba(0,0,0,0.1)',
  border: isUser ? 'none' : `1px solid ${theme.palette.divider}`,
  alignSelf: isUser ? 'flex-end' : 'flex-start',
  margin: theme.spacing(1, 0),
}));

const ChatMessage: React.FC<ChatMessageProps> = ({ text, isUser, timestamp }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: isUser ? 'flex-end' : 'flex-start',
      mb: 2 
    }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        gap: 1
      }}>
        {!isUser && (
          <Avatar sx={{ 
            width: 32, 
            height: 32, 
            bgcolor: 'primary.main',
            fontSize: '0.875rem',
            mb: 1
          }}>
            AI
          </Avatar>
        )}
        <MessagePaper isUser={isUser}>
          <Typography variant="body1">{text}</Typography>
        </MessagePaper>
        {isUser && (
          <Avatar sx={{ 
            width: 32, 
            height: 32, 
            bgcolor: 'grey.400',
            fontSize: '0.875rem',
            mb: 1
          }}>
            YOU
          </Avatar>
        )}
      </Box>
      <Typography 
        variant="caption" 
        color="text.secondary"
        sx={{ mt: 0.5, mx: 1 }}
      >
        {timestamp}
      </Typography>
    </Box>
  );
};

export default ChatMessage; 