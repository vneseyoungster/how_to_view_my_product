import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  IconButton,
  InputBase,
  Divider,
  Switch,
  Avatar,
  ListItemButton,
  styled,
  useTheme
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SendIcon from '@mui/icons-material/Send';
import SettingsIcon from '@mui/icons-material/Settings';
import DescriptionIcon from '@mui/icons-material/Description';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FolderIcon from '@mui/icons-material/Folder';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ChatMessage from './ChatMessage';
import EmptyState from './EmptyState';
import { Link } from 'react-router-dom';
import UploadFileIcon from '@mui/icons-material/UploadFile';

// Custom styled components
const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: 280,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: 280,
    boxSizing: 'border-box',
    borderRight: 'none',
    backgroundColor: theme.palette.background.paper,
  },
}));

const NewChatButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(2),
  borderRadius: 20,
  textTransform: 'none',
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const MessageInput = styled(Paper)(({ theme }) => ({
  padding: '4px 15px',
  display: 'flex',
  alignItems: 'center',
  borderRadius: 25,
  marginTop: theme.spacing(2),
  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
}));

const RegenerateButton = styled(Button)(({ theme }) => ({
  borderRadius: 20,
  textTransform: 'none',
  border: `1px solid ${theme.palette.divider}`,
  color: theme.palette.text.secondary,
  padding: '6px 16px',
}));

const ChatContainer = styled(Paper)(({ theme }) => ({
  flexGrow: 1,
  borderRadius: 15,
  overflow: 'hidden',
  height: 'calc(100vh - 180px)',
  display: 'flex',
  flexDirection: 'column',
}));

const ChatArea = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  overflowY: 'auto',
  backgroundColor: theme.palette.background.paper,
}));

const ChatInterface: React.FC = () => {
  const theme = useTheme();
  const [message, setMessage] = useState('');
  const [activeProject, setActiveProject] = useState('Lorem Project 1');
  const [projectEnabled, setProjectEnabled] = useState(true);
  const [messages, setMessages] = useState<Array<{text: string, isUser: boolean, timestamp: string}>>([]);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    // Add welcome message when component mounts if there are no messages
    if (messages.length === 0 && isFirstLoad) {
      const welcomeMessage = {
        text: 'Hello! I\'m your AI financial assistant. How can I help you analyze your financial data today?',
        isUser: false,
        timestamp: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      };
      setMessages([welcomeMessage]);
      setIsFirstLoad(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        text: message,
        isUser: true,
        timestamp: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      };
      
      setMessages([...messages, newMessage]);
      setMessage('');
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponse = {
          text: 'I\'m analyzing your request. This is a simulated response as this is just a UI prototype.',
          isUser: false,
          timestamp: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  const handleRegenerateResponse = () => {
    console.log('Regenerating response');
    // Implementation would go here
  };
  
  const handleNewChat = () => {
    setMessages([]);
    // We don't reset isFirstLoad here so the welcome message doesn't reappear
  };

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      {/* Sidebar */}
      <StyledDrawer variant="permanent">
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
          <Typography variant="h6" color="primary" fontWeight="bold" sx={{ flexGrow: 1 }}>
            LOREM
          </Typography>
        </Box>
        
        <NewChatButton 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleNewChat}
        >
          NEW CHAT
        </NewChatButton>
        
        <List sx={{ px: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ pl: 2, pt: 2 }}>
            Recent
          </Typography>
          
          <ListItem 
            disablePadding 
            secondaryAction={
              <Switch 
                size="small" 
                checked={projectEnabled} 
                onChange={() => setProjectEnabled(!projectEnabled)}
                sx={{ mr: 1 }}
              />
            }
          >
            <ListItemButton 
              selected={activeProject === 'Lorem Project 1'}
              onClick={() => setActiveProject('Lorem Project 1')}
              sx={{ 
                borderRadius: 1,
                backgroundColor: activeProject === 'Lorem Project 1' ? 'primary.main' : 'transparent',
                color: activeProject === 'Lorem Project 1' ? 'white' : 'inherit',
                '&:hover': {
                  backgroundColor: activeProject === 'Lorem Project 1' ? 'primary.dark' : 'action.hover',
                },
                my: 0.5
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: activeProject === 'Lorem Project 1' ? 'white' : 'inherit' }}>
                <DescriptionIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Lorem Project 1" />
            </ListItemButton>
          </ListItem>
          
          <ListItemButton sx={{ borderRadius: 1, my: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <SportsEsportsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Create new game environment..." />
          </ListItemButton>
          
          <Typography variant="caption" color="text.secondary" sx={{ pl: 2, pt: 2 }}>
            Last 7 days
          </Typography>
          
          <ListItemButton sx={{ borderRadius: 1, my: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <InsertDriveFileIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Lorem Ipsum Project" />
          </ListItemButton>
          
          <Typography variant="caption" color="text.secondary" sx={{ pl: 2, pt: 2 }}>
            Project Types
          </Typography>
          
          <ListItemButton sx={{ borderRadius: 1, my: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <AttachMoneyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Crypto Landing Page" />
          </ListItemButton>
          
          <ListItemButton sx={{ borderRadius: 1, my: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <ReceiptLongIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Customer Statement Types" />
          </ListItemButton>
          
          <ListItemButton sx={{ borderRadius: 1, my: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <AnalyticsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="ML States On Binary OPS" />
          </ListItemButton>
          
          <ListItemButton sx={{ borderRadius: 1, my: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <FolderIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Lorem PDF parser" />
          </ListItemButton>
        </List>

        <Box sx={{ flexGrow: 1 }} />
        
        <Box sx={{ p: 2 }}>
          <Divider sx={{ mb: 2 }} />
          <List>
            <ListItemButton 
              component={Link} 
              to="/upload-documents"
              sx={{ borderRadius: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <UploadFileIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Financial Analyzer" />
            </ListItemButton>
            
            <ListItemButton sx={{ borderRadius: 1 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItemButton>
            
            <ListItem sx={{ mt: 1 }}>
              <ListItemIcon>
                <Avatar sx={{ width: 30, height: 30 }}>AM</Avatar>
              </ListItemIcon>
              <ListItemText primary="Andrea Martin" />
            </ListItem>
          </List>
        </Box>
      </StyledDrawer>

      {/* Chat Area */}
      <Box sx={{ 
        flexGrow: 1, 
        p: 3, 
        backgroundColor: theme.palette.grey[100], 
        display: 'flex', 
        flexDirection: 'column',
        height: 'calc(100vh - 64px)'
      }}>
        <ChatContainer>
          <ChatArea>
            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <ChatMessage 
                  key={index} 
                  text={msg.text} 
                  isUser={msg.isUser} 
                  timestamp={msg.timestamp} 
                />
              ))
            ) : (
              <EmptyState />
            )}
          </ChatArea>
          
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <RegenerateButton variant="outlined" size="small" onClick={handleRegenerateResponse}>
              Regenerate response
            </RegenerateButton>
            
            <MessageInput elevation={1}>
              <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder="What is your mind..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <IconButton 
                color="primary" 
                sx={{ p: '10px' }} 
                onClick={handleSendMessage}
              >
                <SendIcon />
              </IconButton>
            </MessageInput>
          </Box>
        </ChatContainer>
      </Box>
    </Box>
  );
};

export default ChatInterface; 