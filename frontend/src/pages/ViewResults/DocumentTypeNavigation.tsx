import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Tabs, Tab, Paper } from '@mui/material';
import { 
  AccountBalance as BalanceSheetIcon,
  TrendingUp as CashFlowIcon,
  Receipt as IncomeStatementIcon
} from '@mui/icons-material';

interface DocumentTab {
  value: string;
  label: string;
  icon: React.ReactElement;
}

const DOCUMENT_TABS: DocumentTab[] = [
  {
    value: 'balance-sheet',
    label: 'Balance Sheet',
    icon: <BalanceSheetIcon />
  },
  {
    value: 'cash-flow',
    label: 'Cash Flow',
    icon: <CashFlowIcon />
  },
  {
    value: 'income-statement',
    label: 'Income Statement',
    icon: <IncomeStatementIcon />
  }
];

export const DocumentTypeNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine active document type from URL
  const getActiveDocumentType = (): string => {
    const path = location.pathname;
    const match = path.match(/\/view-results\/([^/]+)/);
    if (match && match[1]) {
      return match[1];
    }
    return 'balance-sheet';
  };
  
  const activeDocumentType = getActiveDocumentType();
  
  // Handle navigation to document type
  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    navigate(`/view-results/${newValue}`);
  };
  
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        borderBottom: 1, 
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2 }}>
        <Tabs
          value={activeDocumentType}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
              '&.Mui-selected': {
                fontWeight: 600
              }
            }
          }}
        >
          {DOCUMENT_TABS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {tab.icon}
                  <span>{tab.label}</span>
                </Box>
              }
              sx={{
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            />
          ))}
        </Tabs>
      </Box>
    </Paper>
  );
};

export default DocumentTypeNavigation; 