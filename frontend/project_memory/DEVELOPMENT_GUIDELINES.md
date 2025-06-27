# AI Financial Report Analyzer - Development Guidelines

**Single Source of Truth for Development, Maintenance, and Bug Fixing**

This document serves as the definitive reference for all development work on the AI Financial Report Analyzer frontend application. It combines architectural decisions, development patterns, and lessons learned from the project's evolution.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Tech Stack](#architecture--tech-stack)
3. [Development Workflow](#development-workflow)
4. [Component Architecture](#component-architecture)
5. [State Management & Data Flow](#state-management--data-flow)
6. [Type System & Data Structures](#type-system--data-structures)
7. [API Integration Patterns](#api-integration-patterns)
8. [Testing & Quality Assurance](#testing--quality-assurance)
9. [Deployment & Environment](#deployment--environment)
10. [Troubleshooting Guide](#troubleshooting-guide)
11. [Code Style & Conventions](#code-style--conventions)
12. [Performance & optimization](#performance--optimization)
13. [Migration & Maintenance](#migration--maintenance)

---

## Project Overview

### Application Purpose
React TypeScript frontend for an AI Financial Report Analyzer that processes financial documents (PDF, Word, Excel) using AI to extract key metrics and visualize them through interactive charts.

### Key Application Flow
1. **Upload Documents** (`/upload-documents`) - Users upload financial documents via Firebase Storage
2. **Processing Documents** (`/processing-documents`) - Shows processing status with 4-phase workflow
3. **View Results** (`/view-results`) - Displays extracted financial data with charts
4. **Chat Interface** (`/chat`) - Standalone chat interface for AI assistance

### Current Status (June 2025)
- Core frontend development completed
- Firebase Storage integration functional
- Mock data system implemented for testing
- Component architecture refactored to modular design
- Multi-file upload system implemented
- 4-phase processing workflow integrated
- All major UI/UX issues resolved

---

## Architecture & Tech Stack

### Core Technologies
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite (fast development and building)
- **UI Library**: Material-UI (MUI) for components and styling
- **Charts**: Chart.js with react-chartjs-2
- **Storage**: Firebase Storage for document uploads
- **HTTP Client**: Axios for API communication
- **Routing**: React Router DOM
- **Deployment**: Firebase Hosting

### Key Dependencies
```json
{
  "react": "^18.x",
  "typescript": "^5.x",
  "@mui/material": "^5.x",
  "react-chartjs-2": "^5.x",
  "chart.js": "^4.x",
  "firebase": "^10.x",
  "axios": "^1.x",
  "react-router-dom": "^6.x",
  "react-dropzone": "^14.x"
}
```

### Project Structure
```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Dashboard/      # Main dashboard interface
│   │   ├── FileUpload/     # Document upload handling
│   │   ├── Layout/         # Layout components (AppLayout, AppNavbar)
│   │   └── Visualization/  # Chart components
│   │       ├── charts/     # Individual chart components
│   │       └── types.ts    # Visualization type definitions
│   ├── pages/              # Page components
│   │   ├── UploadDocuments/
│   │   ├── ProcessingDocuments/
│   │   ├── ViewResults/
│   │   └── Chat/
│   ├── services/           # API and external services
│   │   ├── api.ts          # Backend API service
│   │   ├── firebase.ts     # Firebase initialization
│   │   └── storageService.ts # Firebase Storage service
│   ├── types/              # TypeScript type definitions
│   │   ├── index.ts        # Main type exports
│   │   ├── balanceSheet.ts
│   │   ├── cashFlow.ts
│   │   ├── incomeStatement.ts
│   │   └── financialPosition.ts
│   ├── mock/               # Mock data for testing
│   │   └── financial-data.ts
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── .env.local              # Environment variables
├── firebase.json           # Firebase configuration
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

---

## Development Workflow

### Essential Development Commands

#### Core Development
- `npm run dev` - Start development server (http://localhost:5173)
- `npm run build` - Build for production (TypeScript compile + Vite build)
- `npm run lint` - Run ESLint for code quality
- `npm run preview` - Preview production build locally

#### Firebase Deployment
- `firebase deploy --only hosting` - Deploy to Firebase Hosting
- `firebase deploy --only storage` - Deploy storage rules

#### Quality Assurance (CRITICAL)
**ALWAYS run these commands after making changes:**
- `npm run lint` - Check for code quality issues
- `npm run build` - Verify TypeScript compilation
- Test critical user flows manually

### Development Process
1. **Start Development**: `npm run dev`
2. **Make Changes**: Follow component architecture patterns
3. **Quality Check**: Run lint and build commands
4. **Test**: Verify functionality with mock data
5. **Commit**: Only when explicitly requested by user
6. **Deploy**: Use Firebase commands for hosting

---

## Component Architecture

### Current Architecture Pattern (Post-Refactoring)

#### Modular Chart System
The visualization system has been refactored from a monolithic component to a modular architecture:

**Before (Monolithic)**:
- Single 680-line `FinancialCharts.tsx` component
- All chart logic in one file
- Difficult to maintain and test

**After (Modular)**:
- Individual chart components in `src/components/Visualization/charts/`
- Each component handles its own data transformation and rendering
- Centralized types in `types.ts`
- Standardized `ChartContainer` wrapper

#### Chart Components Structure
```typescript
// Individual chart components
FinancialMetricsChart.tsx     // Financial performance metrics
CashFlowTrendChart.tsx        // Cash flow trend multi-line charts  
CashFlowComponentsChart.tsx   // Cash flow components stacked area
IncomeBreakdownChart.tsx      // Income breakdown comprehensive view

// Shared components
ChartContainer.tsx            // Standardized chart wrapper
types.ts                      // Centralized type definitions
index.ts                      // Clean component exports
```

#### Key Components

**CategoryFileUpload** (`src/components/FileUpload/CategoryFileUpload.tsx`)
- Handles multi-file document uploads with drag-and-drop
- Supports both PDF and image formats
- Document type and format selection
- File validation and duplicate prevention
- Maximum 10 files per upload session

**FinancialCharts** (`src/components/Visualization/FinancialCharts.tsx`)
- Container component for all chart visualizations
- Tab-based navigation between different chart types
- Data orchestration and component coordination
- Document type filtering logic

**AppLayout** (`src/components/Layout/AppLayout.tsx`)
- Main application layout with navbar and page outlet
- Responsive design for mobile and desktop
- Navigation state management

**Dashboard** (`src/components/Dashboard/Dashboard.tsx`)
- Main dashboard interface
- Integration point for all major components

### Component Development Patterns

#### 1. Single Responsibility Principle
Each component should have one clear purpose:
```typescript
// ✅ Good - Single purpose
const CashFlowTrendChart = ({ data }: Props) => {
  // Only handles cash flow trend visualization
}

// ❌ Bad - Multiple responsibilities  
const MegaChart = ({ data }: Props) => {
  // Handles multiple chart types, data transformation, etc.
}
```

#### 2. Props Interface Pattern
Always define clear TypeScript interfaces:
```typescript
interface ChartProps {
  data: FinancialData;
  loading?: boolean;
  error?: string;
}
```

#### 3. Container Pattern
Use `ChartContainer` for consistent chart styling:
```typescript
return (
  <ChartContainer loading={loading} error={error}>
    <Chart data={chartData} options={chartOptions} />
  </ChartContainer>
);
```

---

## State Management & Data Flow

### Global State Pattern
The application uses a simple global state pattern for file persistence:

```typescript
// Initialized in App.tsx
declare global {
  interface Window {
    uploadedFiles: UploadedFile[];
  }
}

window.uploadedFiles = [];
```

### Data Flow Architecture

#### File Upload Flow
```
User selects files → CategoryFileUpload → Firebase Storage → API processing
                                      ↓
Session storage ← Window.uploadedFiles ← Upload confirmation
```

#### Processing Flow (4-Phase Workflow)
```
Phase 1: PROCESSING_DOCUMENTS    (5-50% progress)
├── Individual document processing
├── Fast processing without summarization
└── Error handling per document

Phase 2: CHECKING_STATUS         (60% progress)  
├── Call /api/analysis-status
├── Verify all documents processed
└── Wait for completion

Phase 3: GENERATING_SUMMARY      (80% progress)
├── Call /api/generate-summary  
├── Generate comprehensive analysis
└── Create visualization data

Phase 4: COMPLETE                (100% progress)
├── Display results
├── Enable chart visualizations
└── Show summary information
```

#### Data Source Priority
```typescript
// Results display priority order
const getFinancialData = () => {
  // 1. Summary endpoint data (primary)
  if (summaryResult?.summary_content) {
    return transformCashFlowData(summaryResult.summary_content);
  }
  
  // 2. Individual processing results (fallback)
  if (summaryResult?.financial_data) {
    return summaryResult.financial_data;
  }
  
  // 3. Mock data (development/demo)
  return mockFinancialData;
};
```

### Session Storage Management
```typescript
// Key session storage items
sessionStorage.setItem('uploadedFiles', JSON.stringify(files));
sessionStorage.setItem('processingResults', JSON.stringify(results));
sessionStorage.setItem('summaryResult', JSON.stringify(summary));
sessionStorage.setItem('mockDataEnabled', JSON.stringify(enabled));
```

### State Update Patterns

#### File Upload State
```typescript
const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
const [documentType, setDocumentType] = useState<string>('');
const [fileFormat, setFileFormat] = useState<string>('');
```

#### Processing State
```typescript
enum ProcessingPhase {
  PROCESSING_DOCUMENTS = 'PROCESSING_DOCUMENTS',
  CHECKING_STATUS = 'CHECKING_STATUS', 
  GENERATING_SUMMARY = 'GENERATING_SUMMARY',
  COMPLETE = 'COMPLETE'
}

const [currentPhase, setCurrentPhase] = useState<ProcessingPhase>();
const [progress, setProgress] = useState<number>(0);
```

---

## Type System & Data Structures

### Core Type Definitions

#### Financial Data Structure
```typescript
// Main financial data interface
interface FinancialData {
  // Income Statement Metrics
  netInterestIncome: number[];
  netGainsFromServices: number[];
  totalOperatingIncome: number[];
  totalOperatingExpenses: number[];
  provisionForCreditLosses: number[];
  profitBeforeTax?: number[];
  ownersNetProfit: number[];
  
  // Cash Flow Data
  cashFlowData?: CashFlowData;
  
  // Time periods
  periods: string[];
}
```

#### Cash Flow Types (Backend Integration)
```typescript
// Backend cash flow data format
interface CashFlowYearData {
  Net_Operation: number;
  Net_Investing: number;
  Net_Financing: number;
  Profit_Before_Tax: number;
  Time_Duration: string;
}

interface BackendCashFlowData {
  [year: string]: CashFlowYearData;
}

// Transformed for visualization
interface CashFlowData {
  years: string[];
  netOperating: number[];
  netInvesting: number[];
  netFinancing: number[];
  profitBeforeTax: number[];
}
```

#### File Upload Types
```typescript
interface UploadedFile {
  id: string;
  file: File;
  documentType: string;
  fileFormat?: 'pdf' | 'images';
  uploadProgress?: number;
  downloadURL?: string;
  error?: string;
}
```

### Data Transformation Utilities

#### Cash Flow Data Transformation
```typescript
const transformBackendCashFlowData = (
  backendData: BackendCashFlowData
): CashFlowData => {
  const years = Object.keys(backendData);
  const netOperating = years.map(year => backendData[year].Net_Operation);
  const netInvesting = years.map(year => backendData[year].Net_Investing);
  const netFinancing = years.map(year => backendData[year].Net_Financing);
  const profitBeforeTax = years.map(year => backendData[year].Profit_Before_Tax);

  return {
    years,
    netOperating,
    netInvesting,
    netFinancing,
    profitBeforeTax
  };
};
```

### Type Safety Best Practices

#### 1. Always Define Interfaces
```typescript
// ✅ Good - Clear interface definition
interface ChartProps {
  data: FinancialData;
  loading?: boolean;
  error?: string;
}

// ❌ Bad - Using 'any' type
const MyChart = (props: any) => { ... }
```

#### 2. Null Safety
```typescript
// ✅ Good - Proper null checking
const displayFiles = summaryResult?.analysis_files_used?.map(file => 
  file.document_type
).filter(Boolean).join(', ') || 'No files processed';

// ❌ Bad - Risk of runtime errors
const displayFiles = summaryResult.analysis_files_used.map(file => 
  file.document_type
).join(', ');
```

#### 3. Type Guards
```typescript
const isValidFinancialData = (data: any): data is FinancialData => {
  return data && 
         Array.isArray(data.periods) && 
         Array.isArray(data.netInterestIncome);
};
```

---

## API Integration Patterns

### Backend API Service

#### API Configuration
```typescript
// src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

#### Core API Endpoints

**Document Processing**
```typescript
export const processDocument = async (fileUrl: string, documentType: string) => {
  try {
    const response = await apiClient.post('/process-document', {
      file_url: fileUrl,
      document_type: documentType
    });
    return response.data;
  } catch (error) {
    console.error('Document processing failed:', error);
    throw error;
  }
};
```

**Analysis Status Check**
```typescript
export const checkAnalysisStatus = async () => {
  try {
    const response = await apiClient.get('/analysis-status');
    return response.data;
  } catch (error) {
    console.error('Status check failed:', error);
    throw error;
  }
};
```

**Summary Generation**
```typescript
export const generateSummary = async () => {
  try {
    const response = await apiClient.post('/generate-summary');
    return response.data;
  } catch (error) {
    console.error('Summary generation failed:', error);
    throw error;
  }
};
```

### Firebase Storage Integration

#### Storage Service Configuration
```typescript
// src/services/storageService.ts
import { storage } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export const uploadFileToStorage = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const storageRef = ref(storage, `financial_documents/${file.name}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(progress);
      },
      (error) => reject(error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
};
```

### API Error Handling Patterns

#### Standardized Error Handling
```typescript
const handleApiError = (error: any, operation: string) => {
  console.error(`${operation} failed:`, error);
  
  if (error.response) {
    // Server responded with error status
    return {
      success: false,
      error: error.response.data?.message || `${operation} failed`,
      status: error.response.status
    };
  } else if (error.request) {
    // Network error
    return {
      success: false,
      error: 'Network error - please check your connection',
      status: 0
    };
  } else {
    // Other error
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
      status: -1
    };
  }
};
```

#### Retry Logic for Critical Operations
```typescript
const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  throw new Error('Max retries exceeded');
};
```

---

## Testing & Quality Assurance

### Pre-Commit Quality Checks

**CRITICAL**: Always run these commands before committing:

```bash
# 1. Lint check - identifies code quality issues
npm run lint

# 2. Build check - ensures TypeScript compilation succeeds  
npm run build

# 3. Manual testing - verify core functionality
npm run dev
```

### Testing Strategy

#### 1. Component Testing Approach
```typescript
// Individual chart components are easier to test in isolation
describe('CashFlowTrendChart', () => {
  it('should render with valid data', () => {
    const mockData = { /* valid financial data */ };
    render(<CashFlowTrendChart data={mockData} />);
    // Assert chart renders correctly
  });

  it('should handle empty data gracefully', () => {
    render(<CashFlowTrendChart data={null} />);
    // Assert empty state is shown
  });
});
```

#### 2. Integration Testing
Test critical user workflows:
- Document upload → Processing → Results display
- Mock data toggle functionality
- Error handling scenarios
- Mobile responsive behavior

#### 3. Browser Compatibility Testing
Test in multiple browsers:
- Chrome (primary)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

### Common Testing Scenarios

#### File Upload Testing
```typescript
// Test multiple file upload
const testFiles = [
  new File(['content1'], 'test1.pdf', { type: 'application/pdf' }),
  new File(['content2'], 'test2.pdf', { type: 'application/pdf' })
];

// Test drag and drop
fireEvent.dragOver(dropzone);
fireEvent.drop(dropzone, { dataTransfer: { files: testFiles } });
```

#### Chart Rendering Testing
```typescript
// Test chart with mock data
const mockFinancialData = {
  periods: ['Q1 2023', 'Q2 2023'],
  netInterestIncome: [1000, 1200],
  // ... other metrics
};

render(<FinancialCharts data={mockFinancialData} />);
```

### Error Scenario Testing

#### Network Failure Simulation
- Test API timeout scenarios
- Test Firebase storage failures
- Test offline behavior
- Test partial data loading

#### Data Validation Testing
- Test invalid file formats
- Test corrupted data responses
- Test missing required fields
- Test malformed JSON responses

---

## Deployment & Environment

### Environment Configuration

#### Required Environment Variables
Create `.env.local` file in project root:

```bash
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

#### Firebase Project Setup
1. Create Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firebase Storage
3. Configure storage rules in `firebase.storage.rules`
4. Install Firebase CLI: `npm install -g firebase-tools`
5. Login: `firebase login`
6. Initialize: `firebase init`
7. Deploy storage rules: `firebase deploy --only storage`

#### Firebase Storage Rules
```javascript
// firebase.storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /financial_documents/{allPaths=**} {
      allow read, write: if true; // Adjust security as needed
    }
  }
}
```

### Deployment Process

#### Build and Deploy to Firebase Hosting
```bash
# 1. Build the application
npm run build

# 2. Test build locally (optional)
npm run preview

# 3. Deploy to Firebase Hosting
firebase deploy --only hosting

# 4. Deploy storage rules (if changed)
firebase deploy --only storage
```

#### Production Build Verification
Before deploying, ensure:
- `npm run build` completes without errors
- `npm run lint` passes without warnings
- All TypeScript compilation succeeds
- No console errors in production build
- All environment variables are properly configured

### Performance Optimization

#### Build Optimization
```typescript
// vite.config.ts optimizations
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['chart.js', 'react-chartjs-2'],
          ui: ['@mui/material']
        }
      }
    }
  }
});
```

#### Runtime Performance
- Implement React.memo for expensive chart components
- Use lazy loading for non-critical components
- Optimize image assets and file sizes
- Implement proper loading states

---

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. "Cannot read properties of undefined" Errors

**Symptom**: Runtime error when accessing nested properties
```typescript
// ❌ Problematic code
const displayFiles = summaryResult.analysis_files_used.map(file => 
  file.document_type
).join(', ');
```

**Solution**: Implement proper null checking
```typescript
// ✅ Fixed code
const displayFiles = summaryResult?.analysis_files_used?.map(file => 
  file.document_type
).filter(Boolean).join(', ') || 'No files processed';
```

#### 2. Chart Not Displaying

**Symptoms**: 
- Chart container shows but no chart content
- Console errors related to Chart.js

**Common Causes & Solutions**:

**A. Invalid Data Format**
```typescript
// ✅ Ensure data matches expected format
const validateChartData = (data: FinancialData) => {
  if (!data || !Array.isArray(data.periods)) {
    console.error('Invalid chart data format');
    return false;
  }
  return true;
};
```

**B. Missing Chart Registration**
```typescript
// Ensure Chart.js components are registered
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
```

#### 3. Firebase Upload Failures

**Symptoms**:
- Upload progress stalls at 0%
- Firebase authentication errors
- Storage permission denied

**Solutions**:

**A. Check Firebase Configuration**
```typescript
// Verify environment variables are set
console.log('Firebase Config:', {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // Don't log sensitive data in production
});
```

**B. Update Storage Rules**
```javascript
// Less restrictive rules for development
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

#### 4. API Integration Issues

**Symptoms**:
- CORS errors in browser console
- API timeout errors
- 404 Not Found errors

**Solutions**:

**A. CORS Configuration**
```typescript
// During development, API calls may be commented out
// Check src/services/api.ts for commented endpoints
```

**B. API URL Configuration**
```typescript
// Verify API URL in environment
const API_URL = import.meta.env.VITE_API_URL;
console.log('API URL:', API_URL);
```

**C. Backend Availability**
```bash
# Test backend connectivity
curl http://localhost:5000/api/health
```

#### 5. TypeScript Compilation Errors

**Symptoms**:
- Build fails with TypeScript errors
- IDE shows type errors

**Common Solutions**:

**A. Missing Type Definitions**
```bash
# Install missing types
npm install --save-dev @types/react @types/react-dom
```

**B. Import Path Issues**
```typescript
// ✅ Use correct import paths
import { FinancialData } from '../types';
import { ChartContainer } from './charts/ChartContainer';
```

**C. Interface Mismatches**
```typescript
// Ensure props match interface definitions
interface Props {
  data: FinancialData;
  loading?: boolean; // Optional properties marked correctly
}
```

#### 6. Mobile Responsiveness Issues

**Symptoms**:
- Layout breaks on mobile devices
- Charts not properly sized
- Touch interactions not working

**Solutions**:

**A. Viewport Configuration**
```html
<!-- Ensure proper viewport meta tag -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

**B. Chart Responsive Options**
```typescript
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  // Other options...
};
```

**C. Material-UI Breakpoints**
```typescript
// Use proper breakpoint system
const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});
```

### Debug Mode and Logging

#### Enable Verbose Logging
```typescript
// Add to main.tsx or App.tsx for debugging
if (import.meta.env.DEV) {
  console.log('Development mode - verbose logging enabled');
  
  // Log critical state changes
  window.addEventListener('beforeunload', () => {
    console.log('Current session storage:', {
      uploadedFiles: sessionStorage.getItem('uploadedFiles'),
      processingResults: sessionStorage.getItem('processingResults'),
      summaryResult: sessionStorage.getItem('summaryResult'),
    });
  });
}
```

#### Component-Level Debugging
```typescript
const MyComponent = ({ data }: Props) => {
  // Debug data flow
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('Component data update:', data);
    }
  }, [data]);

  // Debug rendering issues
  if (import.meta.env.DEV && !data) {
    console.warn('Component received null/undefined data');
  }

  return <div>...</div>;
};
```

### Performance Troubleshooting

#### Identify Slow Components
```typescript
import { Profiler } from 'react';

const onRenderCallback = (id: string, phase: string, actualDuration: number) => {
  if (actualDuration > 100) { // Log slow renders
    console.log(`Slow render: ${id} (${phase}) took ${actualDuration}ms`);
  }
};

<Profiler id="FinancialCharts" onRender={onRenderCallback}>
  <FinancialCharts data={data} />
</Profiler>
```

#### Memory Leak Detection
```typescript
// Monitor for memory leaks
useEffect(() => {
  const handleMemoryWarning = () => {
    console.warn('Memory pressure detected');
  };

  // Clean up object URLs
  return () => {
    uploadedFiles.forEach(file => {
      if (file.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
      }
    });
  };
}, [uploadedFiles]);
```

---

## Code Style & Conventions

### TypeScript Best Practices

#### 1. Interface Definitions
```typescript
// ✅ Use descriptive interface names
interface FinancialChartProps {
  data: FinancialData;
  loading?: boolean;
  error?: string;
}

// ✅ Define optional properties explicitly
interface UploadedFile {
  id: string;
  file: File;
  documentType: string;
  fileFormat?: 'pdf' | 'images'; // Optional with specific types
  uploadProgress?: number;
}
```

#### 2. Component Patterns
```typescript
// ✅ Functional components with proper typing
const CashFlowChart: React.FC<ChartProps> = ({ data, loading, error }) => {
  // Component logic
  return <div>...</div>;
};

// ✅ Custom hooks for reusable logic
const useFileUpload = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  
  return { files, uploading, uploadFile };
};
```

#### 3. Error Handling Patterns
```typescript
// ✅ Structured error handling
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const processDocument = async (file: File): Promise<ApiResponse<ProcessingResult>> => {
  try {
    const result = await api.process(file);
    return { success: true, data: result };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};
```

### File Organization Conventions

#### 1. Import Order
```typescript
// 1. React and third-party libraries
import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { Chart as ChartJS } from 'chart.js';

// 2. Internal components and hooks
import { ChartContainer } from './ChartContainer';
import { useFinancialData } from '../hooks/useFinancialData';

// 3. Types and interfaces
import { FinancialData, ChartOptions } from '../types';

// 4. Services and utilities
import { apiService } from '../services/api';
import { formatCurrency } from '../utils/formatters';
```

#### 2. Component Structure
```typescript
// Component file structure template
interface ComponentProps {
  // Props interface at top
}

const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // 1. State declarations
  const [state, setState] = useState();
  
  // 2. Custom hooks
  const { data, loading } = useCustomHook();
  
  // 3. Event handlers
  const handleClick = () => { ... };
  
  // 4. Effects
  useEffect(() => { ... }, []);
  
  // 5. Render helpers
  const renderContent = () => { ... };
  
  // 6. Early returns
  if (loading) return <Loading />;
  
  // 7. Main render
  return <div>...</div>;
};

export default Component;
```

### Naming Conventions

#### 1. Files and Directories
```
// ✅ PascalCase for components
FinancialCharts.tsx
CashFlowTrendChart.tsx
CategoryFileUpload.tsx

// ✅ camelCase for utilities and services
storageService.ts
apiService.ts
formatUtils.ts

// ✅ kebab-case for assets and config
financial-data.ts
app-config.json
```

#### 2. Variables and Functions
```typescript
// ✅ Descriptive variable names
const uploadedFiles = [];
const processingResults = {};
const isLoadingComplete = true;

// ✅ Event handlers with 'handle' prefix
const handleFileUpload = () => {};
const handleChartClick = () => {};
const handleDocumentTypeChange = () => {};

// ✅ Boolean variables with 'is', 'has', 'can' prefixes
const isLoading = false;
const hasError = false;
const canProcessDocument = true;
```

#### 3. Component and Type Names
```typescript
// ✅ Components - PascalCase, descriptive
const FinancialMetricsChart = () => {};
const DocumentUploadArea = () => {};

// ✅ Interfaces - PascalCase with descriptive suffix
interface FinancialData { ... }
interface ChartOptions { ... }
interface UploadedFile { ... }

// ✅ Enums - PascalCase
enum ProcessingPhase {
  PROCESSING_DOCUMENTS = 'PROCESSING_DOCUMENTS',
  CHECKING_STATUS = 'CHECKING_STATUS'
}
```

### Comment and Documentation Standards

#### 1. Component Documentation
```typescript
/**
 * CashFlowTrendChart - Displays multi-line chart for cash flow trends
 * 
 * @param data - Financial data containing cash flow metrics
 * @param loading - Whether chart is in loading state
 * @param error - Error message to display if chart fails to render
 * 
 * Features:
 * - Multiple line series for different cash flow types
 * - Interactive tooltips with formatted currency
 * - Responsive design for mobile and desktop
 */
const CashFlowTrendChart: React.FC<ChartProps> = ({ data, loading, error }) => {
  // Implementation
};
```

#### 2. Complex Logic Documentation
```typescript
// Transform backend cash flow data to chart format
// Backend provides year-keyed objects, chart needs arrays
const transformCashFlowData = (backendData: BackendCashFlowData): CashFlowData => {
  // Extract years and sort chronologically
  const years = Object.keys(backendData).sort();
  
  // Convert to parallel arrays for Chart.js
  const netOperating = years.map(year => backendData[year].Net_Operation);
  // ... rest of transformation
};
```

#### 3. API Integration Documentation
```typescript
/**
 * Process uploaded document through backend API
 * 
 * @param fileUrl - Firebase Storage URL of uploaded file
 * @param documentType - Type of financial document (balance_sheet, cash_flow, etc.)
 * @returns Promise resolving to processing result
 * 
 * @throws Will throw error if:
 * - Network request fails
 * - Backend returns error status
 * - Invalid document format
 */
export const processDocument = async (fileUrl: string, documentType: string) => {
  // Implementation with error handling
};
```

---

## Performance & Optimization

### Frontend Performance Strategies

#### 1. Component Optimization

**React.memo for Expensive Charts**
```typescript
import React, { memo } from 'react';

const CashFlowChart = memo<ChartProps>(({ data, loading, error }) => {
  // Chart rendering logic
  return <Chart data={data} options={options} />;
}, (prevProps, nextProps) => {
  // Custom comparison for complex data
  return JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data);
});
```

**useMemo for Data Transformations**
```typescript
const FinancialCharts: React.FC<Props> = ({ rawData }) => {
  // Memoize expensive data transformations
  const chartData = useMemo(() => {
    return transformFinancialData(rawData);
  }, [rawData]);

  const chartOptions = useMemo(() => {
    return createChartOptions(chartData);
  }, [chartData]);

  return <Chart data={chartData} options={chartOptions} />;
};
```

**useCallback for Event Handlers**
```typescript
const CategoryFileUpload: React.FC<Props> = ({ onUpload }) => {
  const [files, setFiles] = useState<File[]>([]);

  // Prevent unnecessary re-renders of child components
  const handleFileAdd = useCallback((newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const handleFileRemove = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  }, []);

  return <DropZone onAdd={handleFileAdd} onRemove={handleFileRemove} />;
};
```

#### 2. Bundle Optimization

**Code Splitting**
```typescript
// Lazy load non-critical components
const ChatInterface = lazy(() => import('../pages/Chat/ChatInterface'));
const AdvancedCharts = lazy(() => import('../components/AdvancedCharts'));

// Use Suspense for loading states
<Suspense fallback={<CircularProgress />}>
  <ChatInterface />
</Suspense>
```

**Vite Configuration Optimization**
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@mui/material', '@mui/icons-material'],
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
          'firebase-vendor': ['firebase/app', 'firebase/storage']
        }
      }
    },
    // Enable gzip compression
    reportCompressedSize: true,
    // Optimize chunk size
    chunkSizeWarningLimit: 1000
  }
});
```

#### 3. Image and Asset Optimization

**Optimize Chart Canvas**
```typescript
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  // Optimize animation performance
  animation: {
    duration: 300, // Shorter animation
    easing: 'easeOutQuart'
  },
  // Optimize tooltip performance
  interaction: {
    intersect: false,
    mode: 'index' as const,
  },
  // Optimize legend rendering
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        usePointStyle: true, // Faster rendering
        padding: 20
      }
    }
  }
};
```

**File Upload Optimization**
```typescript
const optimizeFile = async (file: File): Promise<File> => {
  // For image files, implement compression if needed
  if (file.type.startsWith('image/')) {
    // Use canvas to compress large images
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    // ... compression logic
  }
  return file;
};
```

### Network Performance

#### 1. Firebase Storage Optimization

**Upload Progress Optimization**
```typescript
export const uploadWithOptimizedProgress = async (
  file: File,
  onProgress?: (progress: number) => void
) => {
  const storageRef = ref(storage, `financial_documents/${file.name}`);
  
  // Use resumable upload for large files
  const uploadTask = uploadBytesResumable(storageRef, file, {
    // Optimize chunk size for network conditions
    chunkSize: 1024 * 1024, // 1MB chunks
  });

  // Throttle progress updates to avoid UI thrashing
  let lastProgressUpdate = 0;
  const progressThrottle = 100; // Update every 100ms max

  return new Promise((resolve, reject) => {
    uploadTask.on('state_changed',
      (snapshot) => {
        const now = Date.now();
        if (now - lastProgressUpdate > progressThrottle) {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.(Math.round(progress));
          lastProgressUpdate = now;
        }
      },
      reject,
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
};
```

#### 2. API Request Optimization

**Request Batching**
```typescript
const batchProcessDocuments = async (files: UploadedFile[]) => {
  // Process documents in batches to avoid overwhelming the server
  const batchSize = 3;
  const results: ProcessingResult[] = [];

  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    
    // Process batch in parallel
    const batchPromises = batch.map(file => 
      processDocument(file.downloadURL!, file.documentType)
    );
    
    try {
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    } catch (error) {
      console.error(`Batch ${i / batchSize + 1} failed:`, error);
      // Continue with next batch instead of failing completely
    }
  }

  return results;
};
```

**Caching Strategy**
```typescript
// Simple in-memory cache for API responses
class ApiCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private ttl = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }
}

const cache = new ApiCache();

export const getCachedAnalysisStatus = async () => {
  const cacheKey = 'analysis-status';
  const cached = cache.get(cacheKey);
  
  if (cached) return cached;

  const result = await checkAnalysisStatus();
  cache.set(cacheKey, result);
  return result;
};
```

### Memory Management

#### 1. Cleanup Patterns

**File Object URL Cleanup**
```typescript
const FilePreview: React.FC<{ file: File }> = ({ file }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    // Create object URL for preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Cleanup function to prevent memory leaks
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  return previewUrl ? <img src={previewUrl} alt="Preview" /> : null;
};
```

**Event Listener Cleanup**
```typescript
const useWindowResize = (callback: () => void) => {
  useEffect(() => {
    const handleResize = () => {
      // Debounce resize events
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(callback, 150);
    };

    let resizeTimeout: number;
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [callback]);
};
```

#### 2. State Management Optimization

**Minimize Re-renders**
```typescript
// Use separate state for different concerns
const ProcessingPage = () => {
  // Separate state to avoid unnecessary re-renders
  const [processingPhase, setProcessingPhase] = useState<ProcessingPhase>();
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Don't combine unrelated state
  // ❌ const [processingState, setProcessingState] = useState({ phase, progress, error });
};
```

**Optimize Context Usage**
```typescript
// Split contexts to minimize re-renders
const FileUploadContext = createContext<FileUploadContextType | null>(null);
const ProcessingContext = createContext<ProcessingContextType | null>(null);

// Rather than one large context
// ❌ const AppContext = createContext<{ files, processing, charts } | null>(null);
```

---

## Migration & Maintenance

### Architecture Evolution History

#### Phase 1: Monolithic Component Architecture (Pre-Jan 2025)
- Single large `FinancialCharts.tsx` component (680+ lines)
- All chart logic in one file
- Difficult to maintain and test
- Tight coupling between chart types

#### Phase 2: Modular Component Architecture (Jan 2025)
- Split into individual chart components
- Centralized type definitions
- Standardized `ChartContainer` wrapper
- Improved maintainability and testability

#### Phase 3: Backend Integration Enhancement (Jan 2025)
- 4-phase processing workflow
- Multi-file upload system
- Enhanced error handling
- Summary generation integration

### Migration Guidelines for Future Changes

#### When to Refactor Components

**Signs a Component Needs Refactoring:**
1. **Size**: Component exceeds 200 lines
2. **Complexity**: Multiple concerns handled in one component
3. **Testing**: Difficult to write focused unit tests
4. **Reusability**: Similar logic duplicated across components

**Refactoring Process:**
```typescript
// 1. Identify distinct responsibilities
const LargeComponent = () => {
  // Chart rendering logic - can be extracted
  const renderChart = () => { ... };
  
  // Data transformation - can be extracted
  const transformData = () => { ... };
  
  // UI state management - can remain
  const [loading, setLoading] = useState(false);
  
  return <div>...</div>;
};

// 2. Extract into separate components/hooks
const useDataTransformation = (rawData) => {
  return useMemo(() => transformData(rawData), [rawData]);
};

const ChartRenderer = ({ data }) => {
  return <Chart data={data} />;
};

// 3. Simplified parent component
const ImprovedComponent = ({ rawData }) => {
  const transformedData = useDataTransformation(rawData);
  const [loading, setLoading] = useState(false);
  
  return (
    <ChartContainer loading={loading}>
      <ChartRenderer data={transformedData} />
    </ChartContainer>
  );
};
```

#### Adding New Chart Types

**Step-by-Step Process:**

1. **Create Chart Component**
```typescript
// src/components/Visualization/charts/NewChart.tsx
interface NewChartProps {
  data: FinancialData;
  loading?: boolean;
  error?: string;
}

const NewChart: React.FC<NewChartProps> = ({ data, loading, error }) => {
  const chartData = useMemo(() => {
    // Transform data for this chart type
    return transformDataForNewChart(data);
  }, [data]);

  return (
    <ChartContainer loading={loading} error={error}>
      <Chart type="newChartType" data={chartData} options={chartOptions} />
    </ChartContainer>
  );
};

export default NewChart;
```

2. **Add to Index Exports**
```typescript
// src/components/Visualization/charts/index.ts
export { default as NewChart } from './NewChart';
```

3. **Update Types**
```typescript
// src/components/Visualization/types.ts
interface FinancialData {
  // Add new fields required by the chart
  newMetric?: number[];
  // ... existing fields
}
```

4. **Integrate in Main Component**
```typescript
// src/components/Visualization/FinancialCharts.tsx
import { NewChart } from './charts';

const FinancialCharts = ({ data }) => {
  // Add new tab
  const tabs = [
    { label: 'Financial Metrics', component: <FinancialMetricsChart data={data} /> },
    { label: 'New Chart', component: <NewChart data={data} /> },
    // ... other tabs
  ];
  
  return <TabContainer tabs={tabs} />;
};
```

#### Updating API Integration

**Adding New Endpoints:**

1. **Define Response Types**
```typescript
// src/types/api.ts
interface NewEndpointResponse {
  success: boolean;
  data: NewDataType;
  message?: string;
}
```

2. **Add Service Function**
```typescript
// src/services/api.ts
export const callNewEndpoint = async (params: NewEndpointParams): Promise<NewEndpointResponse> => {
  try {
    const response = await apiClient.post('/new-endpoint', params);
    return response.data;
  } catch (error) {
    return handleApiError(error, 'New endpoint call');
  }
};
```

3. **Update Processing Workflow**
```typescript
// If the new endpoint is part of the processing flow
enum ProcessingPhase {
  PROCESSING_DOCUMENTS = 'PROCESSING_DOCUMENTS',
  CHECKING_STATUS = 'CHECKING_STATUS',
  GENERATING_SUMMARY = 'GENERATING_SUMMARY',
  NEW_PHASE = 'NEW_PHASE', // Add new phase
  COMPLETE = 'COMPLETE'
}
```

### Backward Compatibility Strategy

#### Maintaining Data Structure Compatibility
```typescript
// Support both old and new data formats
interface LegacyFinancialData {
  // Old structure
  operatingCashFlow: number[];
}

interface ModernFinancialData {
  // New structure
  cashFlowData: {
    operating: number[];
    investing: number[];
    financing: number[];
  };
}

type FinancialData = LegacyFinancialData | ModernFinancialData;

// Helper to normalize data
const normalizeFinancialData = (data: FinancialData): ModernFinancialData => {
  if ('cashFlowData' in data) {
    return data; // Already modern format
  }
  
  // Convert legacy format
  return {
    cashFlowData: {
      operating: data.operatingCashFlow,
      investing: [],
      financing: []
    }
  };
};
```

#### Component Interface Evolution
```typescript
// Use interface extension for backward compatibility
interface BaseChartProps {
  data: FinancialData;
  loading?: boolean;
}

// V1 interface
interface ChartPropsV1 extends BaseChartProps {
  selectedMetric: string;
}

// V2 interface (removes selectedMetric)
interface ChartPropsV2 extends BaseChartProps {
  showAllMetrics?: boolean;
}

// Support both interfaces during transition
type ChartProps = ChartPropsV1 | ChartPropsV2;
```

### Maintenance Checklist

#### Regular Maintenance Tasks

**Weekly:**
- [ ] Review and update dependencies
- [ ] Check for security vulnerabilities: `npm audit`
- [ ] Monitor Firebase Storage usage
- [ ] Review error logs and user feedback

**Monthly:**
- [ ] Update development dependencies
- [ ] Review and optimize bundle size
- [ ] Check browser compatibility
- [ ] Update documentation if needed

**Quarterly:**
- [ ] Review component architecture for refactoring opportunities
- [ ] Evaluate new React/TypeScript features
- [ ] Performance audit and optimization
- [ ] Security review and updates

**Before Major Updates:**
- [ ] Full regression testing
- [ ] Browser compatibility testing
- [ ] Mobile responsiveness testing
- [ ] API integration testing
- [ ] Documentation updates

#### Dependency Management

**Safe Update Process:**
```bash
# 1. Check outdated packages
npm outdated

# 2. Update non-breaking changes
npm update

# 3. Test after updates
npm run build
npm run lint
npm run dev

# 4. For major version updates, update individually
npm install react@latest react-dom@latest

# 5. Test thoroughly after major updates
```

**Version Pinning Strategy:**
```json
{
  "dependencies": {
    "react": "^18.2.0",           // Allow minor updates
    "typescript": "~5.0.4",       // Allow patch updates only
    "@mui/material": "5.13.1"     // Pin exact version for UI consistency
  }
}
```

### Documentation Updates

#### When Documentation Needs Updates

1. **New Features Added**: Document new components, APIs, or workflows
2. **Architecture Changes**: Update architectural diagrams and patterns
3. **Bug Fixes**: Add to troubleshooting guide if applicable
4. **Performance Improvements**: Document optimization techniques
5. **Breaking Changes**: Update migration guides

#### Documentation Review Process

```typescript
// Template for documenting new features
/**
 * Feature: [Feature Name]
 * Added: [Date]
 * Author: [Developer Name]
 * 
 * Description:
 * [Brief description of the feature]
 * 
 * Usage:
 * [Code examples and usage patterns]
 * 
 * Dependencies:
 * [Any new dependencies or requirements]
 * 
 * Testing:
 * [How to test the feature]
 */
```

---

## Conclusion

This document serves as the comprehensive guide for developing, maintaining, and troubleshooting the AI Financial Report Analyzer frontend application. It represents the accumulated knowledge from the project's evolution and should be updated as the project continues to grow.

### Key Takeaways

1. **Architecture**: Modular component design improves maintainability
2. **Type Safety**: Proper TypeScript usage prevents runtime errors
3. **Performance**: Optimization strategies prevent user experience issues
4. **Error Handling**: Comprehensive error handling improves reliability
5. **Testing**: Regular quality checks prevent regressions
6. **Documentation**: Up-to-date documentation accelerates development

### Getting Help

When encountering issues not covered in this guide:

1. **Check Recent Commits**: Review `CHANGELOG.md` for recent changes
2. **Debug Mode**: Enable verbose logging for troubleshooting
3. **Component Isolation**: Test components individually to isolate issues
4. **Browser DevTools**: Use React DevTools and browser console
5. **Community Resources**: React, TypeScript, and Material-UI documentation

### Final Notes

This document should be updated whenever:
- New architectural patterns are established
- Common issues and solutions are discovered
- Performance optimizations are implemented
- Development workflows are changed

The goal is to maintain this as the single source of truth for all development decisions and knowledge about the project.

---

**Document Version**: 1.0  
**Last Updated**: June 17, 2025  
**Next Review**: July 17, 2025