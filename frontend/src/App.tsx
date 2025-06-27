import { useState, useEffect } from 'react'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/Layout'
import Home from './pages/Home'
import UploadDocumentsPage from './pages/UploadDocuments'
import ProcessingDocumentsPage from './pages/ProcessingDocuments'
import ViewResultsPage from './pages/ViewResults'
import { 
  BalanceSheetResultsPage,
  CashFlowResultsPage,
  IncomeStatementResultsPage,
  AllKindResultPage
} from './pages/ViewResults'
import ChatInterface from './components/ChatInterface/ChatInterface'


function App() {
  const [darkMode] = useState(false)

  // Clear uploaded files from window object when the component unmounts
  useEffect(() => {
    // Initialize uploadedFiles if it doesn't exist
    if (!window.uploadedFiles) {
      window.uploadedFiles = [];
    }
    
    // Cleanup function to clear uploadedFiles when app unmounts
    return () => {
      if (window.uploadedFiles) {
        window.uploadedFiles = [];
      }
    };
  }, []);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
      background: {
        default: darkMode ? '#121212' : '#f5f5f5',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 500,
      },
      h6: {
        fontWeight: 500,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 500,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
    },
  })

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* Main Financial Analysis Application Routes */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="upload-documents" element={<UploadDocumentsPage />} />
            <Route path="processing-documents" element={<ProcessingDocumentsPage />} />
            
            {/* Document-specific results routes */}
            <Route path="view-results">
              <Route path="balance-sheet" element={<BalanceSheetResultsPage />} />
              <Route path="cash-flow" element={<CashFlowResultsPage />} />
              <Route path="income-statement" element={<IncomeStatementResultsPage />} />
              <Route path="all-kind" element={<AllKindResultPage />} />
              <Route index element={<Navigate to="balance-sheet" replace />} />
            </Route>
            
            {/* Legacy route for backward compatibility */}
            <Route path="view-results-legacy" element={<ViewResultsPage />} />
          </Route>
          
          {/* Chat Interface Route */}
          <Route path="/chat" element={<ChatInterface />} />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
