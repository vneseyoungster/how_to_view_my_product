# Document-Specific Routes Specification

**Version**: 1.0  
**Date**: June 17, 2025  
**Status**: Approved for Implementation

## Table of Contents

1. [Overview & Requirements](#overview--requirements)
2. [Current State Analysis](#current-state-analysis)
3. [Technical Architecture](#technical-architecture)
4. [Implementation Details](#implementation-details)
5. [Component Specifications](#component-specifications)
6. [Routing Configuration](#routing-configuration)
7. [Data Flow & Filtering](#data-flow--filtering)
8. [Testing Strategy](#testing-strategy)
9. [Migration Plan](#migration-plan)
10. [Risk Assessment](#risk-assessment)

---

## Overview & Requirements

### Business Requirements

The current ViewResults page displays all financial analysis results in a single route (`/view-results`). This enhancement will split the results into document-specific routes to improve user experience and provide more focused analysis views.

**Goals:**
- Provide focused analysis views per document type
- Improve navigation and URL structure
- Enable document-type-specific chart configurations
- Maintain all existing functionality
- Support mixed document type scenarios

### User Experience Improvements

1. **Focused Analysis**: Users can view results specific to their document type
2. **Better URLs**: Descriptive URLs like `/view-results/income-statement`
3. **Targeted Charts**: Show only relevant visualizations per document type
4. **Improved Navigation**: Clear document type context throughout the flow

---

## Current State Analysis

### Existing Structure

**Current Route:**
- Single route: `/view-results`
- Displays all document types in one view
- Generic chart selection logic
- Unified data processing

**Document Types (from CategoryFileUpload.tsx):**
```typescript
export const DOCUMENT_TYPES = [
  { id: 'balance-sheet', name: 'Balance Sheet' },
  { id: 'cash-flow', name: 'Cash Flow' },
  { id: 'income-statement', name: 'Income Statement' },
  { id: 'assets', name: 'Assets' }
];
```

### Current Data Flow
```
Upload → Processing → Single ViewResults Page
                         ↓
                    All charts displayed
                    All data shown together
```

---

## Technical Architecture

### New Route Structure

```
/view-results/
├── balance-sheet        → BalanceSheetResultsPage
├── cash-flow           → CashFlowResultsPage  
├── income-statement    → IncomeStatementResultsPage
├── assets             → AssetsResultsPage
└── [index redirect]   → Default to primary document type
```

### Component Hierarchy

```
BaseResultsPage (shared logic)
├── BalanceSheetResultsPage
├── CashFlowResultsPage
├── IncomeStatementResultsPage
└── AssetsResultsPage
```

### URL Patterns

| Document Type | Route | Example |
|---------------|-------|---------|
| Balance Sheet | `/view-results/balance-sheet` | Full balance sheet analysis |
| Cash Flow | `/view-results/cash-flow` | Cash flow trends and components |
| Income Statement | `/view-results/income-statement` | Revenue, expenses, profit analysis |
| Assets | `/view-results/assets` | Asset allocation and composition |

---

## Implementation Details

### Files to Create

#### 1. Base Component
**File**: `src/pages/ViewResults/BaseResultsPage.tsx`
**Purpose**: Shared functionality for all document-specific pages

**Key Features:**
- Session storage data loading
- Mock data toggle functionality
- Error handling patterns
- Common UI components
- Data transformation utilities

#### 2. Document-Specific Pages

**Files:**
- `src/pages/ViewResults/BalanceSheetResultsPage.tsx`
- `src/pages/ViewResults/CashFlowResultsPage.tsx`
- `src/pages/ViewResults/IncomeStatementResultsPage.tsx`
- `src/pages/ViewResults/AssetsResultsPage.tsx`

**Each page includes:**
- Document-specific data filtering
- Relevant chart selection
- Customized metadata display
- Appropriate mock data

### Files to Modify

#### 1. App.tsx - Routing Update
```typescript
// Before
<Route path="view-results" element={<ViewResultsPage />} />

// After
<Route path="view-results">
  <Route path="balance-sheet" element={<BalanceSheetResultsPage />} />
  <Route path="cash-flow" element={<CashFlowResultsPage />} />
  <Route path="income-statement" element={<IncomeStatementResultsPage />} />
  <Route path="assets" element={<AssetsResultsPage />} />
  <Route index element={<Navigate to="balance-sheet" replace />} />
</Route>
```

#### 2. ProcessingDocumentsPage.tsx - Navigation Logic
- Determine target route based on uploaded document types
- Handle mixed document types (default or user selection)
- Update success redirect logic

#### 3. ViewResults/index.ts - Exports Update
```typescript
export { default as BaseResultsPage } from './BaseResultsPage';
export { default as BalanceSheetResultsPage } from './BalanceSheetResultsPage';
export { default as CashFlowResultsPage } from './CashFlowResultsPage';
export { default as IncomeStatementResultsPage } from './IncomeStatementResultsPage';
export { default as AssetsResultsPage } from './AssetsResultsPage';
```

---

## Component Specifications

### BaseResultsPage Component

**Purpose**: Shared logic and utilities for all document-specific pages

**Interface:**
```typescript
interface BaseResultsPageProps {
  documentType: string;
  children?: React.ReactNode;
}

interface BaseResultsPageReturn {
  // Data
  uploadedFiles: UploadedFile[];
  processingResults: ProcessingResult[];
  summaryResult: SummaryResult | null;
  
  // State
  isLoading: boolean;
  error: string | null;
  useMockData: boolean;
  selectedMockCompany: string;
  
  // Handlers
  handleStartOver: () => void;
  handleToggleMockData: (enabled: boolean) => void;
  handleMockCompanyChange: (company: string) => void;
  
  // Data getters
  getFinancialData: () => Record<string, FinancialMetric>;
  getFilteredFinancialData: (docType: string) => FinancialData;
  getUploadedFilesStats: () => FileStats;
  
  // UI Components
  PromptInfoDisplay: React.FC;
  SummaryTypeSelector: React.FC;
  ProcessingSummary: React.FC;
}
```

**Key Functions:**
```typescript
// Data filtering by document type
const filterDataByDocumentType = (
  data: FinancialData, 
  documentType: string
): FinancialData => {
  // Filter financial data relevant to document type
  // Return document-specific data structure
};

// Chart selection by document type
const getRelevantCharts = (documentType: string): string[] => {
  const chartMapping = {
    'balance-sheet': ['assetAllocation', 'liabilityBreakdown'],
    'cash-flow': ['cashFlowTrend', 'cashFlowComponents'],
    'income-statement': ['incomeBreakdown', 'profitMargins'],
    'assets': ['assetComposition', 'depreciation']
  };
  return chartMapping[documentType] || [];
};
```

### Document-Specific Pages

Each page extends BaseResultsPage functionality:

**Template Structure:**
```typescript
const DocumentTypeResultsPage: React.FC = () => {
  const {
    // Destructure needed props from BaseResultsPage
    isLoading,
    error,
    useMockData,
    getFilteredFinancialData,
    PromptInfoDisplay,
    // ... other props
  } = useBaseResultsPage('document-type');

  const financialData = getFilteredFinancialData('document-type');
  const relevantCharts = getRelevantCharts('document-type');

  return (
    <DocumentResultsLayout documentType="document-type">
      <ProcessingSummary />
      <DocumentSpecificCharts 
        data={financialData} 
        charts={relevantCharts}
      />
      <PromptInfoDisplay />
    </DocumentResultsLayout>
  );
};
```

---

## Routing Configuration

### App.tsx Updates

**New Routing Structure:**
```typescript
<Route path="/" element={<AppLayout />}>
  <Route index element={<Home />} />
  <Route path="upload-documents" element={<UploadDocumentsPage />} />
  <Route path="processing-documents" element={<ProcessingDocumentsPage />} />
  
  {/* Document-specific results routes */}
  <Route path="view-results">
    <Route path="balance-sheet" element={<BalanceSheetResultsPage />} />
    <Route path="cash-flow" element={<CashFlowResultsPage />} />
    <Route path="income-statement" element={<IncomeStatementResultsPage />} />
    <Route path="assets" element={<AssetsResultsPage />} />
    <Route index element={<Navigate to="balance-sheet" replace />} />
  </Route>
</Route>
```

### Navigation Logic Updates

**ProcessingDocumentsPage Route Determination:**
```typescript
const determineResultsRoute = (uploadedFiles: UploadedFile[]): string => {
  // Get primary document type from uploaded files
  const documentTypes = uploadedFiles.map(file => file.category);
  const primaryType = documentTypes[0] || 'balance-sheet';
  
  // Handle mixed document types
  if (new Set(documentTypes).size > 1) {
    // Store mixed types in session storage for user selection
    sessionStorage.setItem('mixedDocumentTypes', JSON.stringify(documentTypes));
    return '/view-results/balance-sheet'; // Default
  }
  
  return `/view-results/${primaryType}`;
};
```

**Navigation Helpers:**
```typescript
// In BaseResultsPage
const handleStartOver = () => {
  // Clear session storage
  sessionStorage.clear();
  
  // Navigate to upload page
  navigate('/upload-documents');
};

// Document type switching
const handleDocumentTypeSwitch = (newType: string) => {
  navigate(`/view-results/${newType}`);
};
```

---

## Data Flow & Filtering

### Document-Specific Data Filtering

**Financial Data Filtering:**
```typescript
interface DocumentDataFilter {
  documentType: string;
  relevantMetrics: string[];
  chartTypes: string[];
  mockDataKey: string;
}

const DOCUMENT_FILTERS: Record<string, DocumentDataFilter> = {
  'balance-sheet': {
    documentType: 'balance-sheet',
    relevantMetrics: ['totalAssets', 'totalLiabilities', 'equity'],
    chartTypes: ['assetAllocation', 'liabilityBreakdown'],
    mockDataKey: 'balanceSheetData'
  },
  'cash-flow': {
    documentType: 'cash-flow',
    relevantMetrics: ['netOperating', 'netInvesting', 'netFinancing'],
    chartTypes: ['cashFlowTrend', 'cashFlowComponents'],
    mockDataKey: 'cashFlowData'
  },
  'income-statement': {
    documentType: 'income-statement',
    relevantMetrics: ['totalRevenue', 'totalExpenses', 'netIncome'],
    chartTypes: ['incomeBreakdown', 'profitMargins'],
    mockDataKey: 'incomeStatementData'
  },
  'assets': {
    documentType: 'assets',
    relevantMetrics: ['currentAssets', 'fixedAssets', 'depreciation'],
    chartTypes: ['assetComposition', 'depreciation'],
    mockDataKey: 'assetsData'
  }
};
```

### Chart Component Mapping

**Chart Selection Logic:**
```typescript
const getChartsForDocumentType = (documentType: string): React.ComponentType[] => {
  const chartMap = {
    'balance-sheet': [AssetAllocationChart, LiabilityBreakdownChart],
    'cash-flow': [CashFlowTrendChart, CashFlowComponentsChart],
    'income-statement': [IncomeBreakdownChart, ProfitMarginsChart],
    'assets': [AssetCompositionChart, DepreciationChart]
  };
  
  return chartMap[documentType] || [];
};
```

### Session Storage Enhancement

**New Session Storage Keys:**
```typescript
// Existing keys (maintained)
'uploadedFiles' -> UploadedFile[]
'processingResults' -> ProcessingResult[]
'summaryResult' -> SummaryResult
'processingComplete' -> boolean
'useMockData' -> boolean

// New keys
'primaryDocumentType' -> string
'mixedDocumentTypes' -> string[]
'documentSpecificData' -> Record<string, any>
```

---

## Testing Strategy

### Unit Testing

**BaseResultsPage Tests:**
```typescript
describe('BaseResultsPage', () => {
  it('should load session storage data correctly');
  it('should filter data by document type');
  it('should handle mock data toggle');
  it('should provide correct chart selection');
  it('should handle navigation');
});
```

**Document-Specific Page Tests:**
```typescript
describe('BalanceSheetResultsPage', () => {
  it('should display balance sheet specific charts');
  it('should filter balance sheet metrics');
  it('should show relevant mock data');
  it('should handle empty data gracefully');
});
```

### Integration Testing

**Routing Tests:**
- Navigate directly to document-specific routes
- Verify route parameter handling
- Test backward compatibility
- Check navigation flow from processing page

**Data Flow Tests:**
- Upload different document types
- Verify correct route redirection
- Test mixed document type handling
- Validate data persistence across routes

### User Flow Testing

**Complete Workflows:**
1. Upload balance sheet → Processing → Balance sheet results
2. Upload cash flow → Processing → Cash flow results
3. Mixed documents → Processing → Default route + type selection
4. Mock data toggle across all document types

---

## Migration Plan

### Phase 1: Foundation (Day 1)
1. Create BaseResultsPage component
2. Extract shared logic from current ViewResultsPage
3. Create document-specific page skeletons
4. Update index.ts exports

### Phase 2: Routing (Day 2)
1. Update App.tsx with new route structure
2. Implement navigation logic in ProcessingDocumentsPage
3. Add route guards and error handling
4. Test basic routing functionality

### Phase 3: Data Filtering (Day 3)
1. Implement document-specific data filtering
2. Create chart mapping logic
3. Update mock data for document types
4. Test data flow and filtering

### Phase 4: UI Polish (Day 4)
1. Complete document-specific page implementations
2. Add document type switching UI
3. Implement URL parameter handling
4. Final testing and bug fixes

### Phase 5: Testing & Documentation (Day 5)
1. Comprehensive testing of all routes
2. Performance testing
3. Documentation updates
4. User acceptance testing

---

## Risk Assessment

### High Risk Areas

1. **Session Storage Compatibility**
   - Risk: Breaking existing data flow
   - Mitigation: Maintain backward compatibility, comprehensive testing

2. **Navigation Flow Changes**
   - Risk: Users getting lost in new route structure
   - Mitigation: Clear navigation indicators, fallback routes

3. **Chart Configuration Complexity**
   - Risk: Incorrect chart selection per document type
   - Mitigation: Centralized chart mapping, extensive testing

### Medium Risk Areas

1. **Mock Data Synchronization**
   - Risk: Mock data not matching document types
   - Mitigation: Update mock data structure, validation

2. **Performance Impact**
   - Risk: Multiple page components affecting load time
   - Mitigation: Code splitting, lazy loading

### Low Risk Areas

1. **URL Structure Changes**
   - Risk: SEO or bookmarking issues
   - Mitigation: Redirect old URLs, maintain URL patterns

---

## Backward Compatibility

### Maintaining Existing Functionality

1. **Session Storage**: Keep all existing keys and data structures
2. **Navigation**: Support old `/view-results` route with redirect
3. **Mock Data**: Maintain existing mock data interface
4. **Chart Components**: Keep all existing chart components functional

### Migration Strategy

1. **Gradual Migration**: Implement alongside existing route initially
2. **Feature Flags**: Use environment variables to control new routes
3. **Fallback Mechanisms**: Graceful degradation if new routes fail
4. **Data Validation**: Ensure data compatibility across old and new systems

---

## Success Criteria

### Functional Requirements
- [ ] All four document-specific routes functional
- [ ] Correct data filtering per document type
- [ ] Appropriate chart selection per route
- [ ] Mock data toggle works on all routes
- [ ] Navigation flow updated correctly

### Performance Requirements
- [ ] Page load time < 2 seconds
- [ ] Route switching < 500ms
- [ ] No memory leaks in navigation
- [ ] Responsive design maintained

### User Experience Requirements
- [ ] Clear document type context
- [ ] Intuitive navigation between types
- [ ] Error handling for invalid routes
- [ ] Consistent UI across all routes

---

**Document Status**: Ready for Implementation  
**Next Steps**: Begin Phase 1 of Migration Plan  
**Review Date**: June 24, 2025