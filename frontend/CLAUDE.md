# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server (runs on http://localhost:5173)
- `npm run build` - Build for production (TypeScript compile + Vite build)
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally

### Firebase Deployment
- `firebase deploy --only hosting` - Deploy to Firebase Hosting
- `firebase deploy --only storage` - Deploy storage rules

## Architecture Overview

This is a React TypeScript frontend for an AI Financial Report Analyzer using Vite, Material UI, and Firebase Storage.

### Key Application Flow
1. **Upload Documents** (`/upload-documents`) - Users upload financial documents via Firebase Storage
2. **Processing Documents** (`/processing-documents`) - Shows processing status/simulation
3. **View Results** (`/view-results`) - Displays extracted financial data with charts
4. **Chat Interface** (`/chat`) - Standalone chat interface for AI assistance

### Core Architecture Patterns

**State Management**: Uses global `window.uploadedFiles` array for file state persistence across routes (initialized in App.tsx)

**File Upload Flow**: 
- Files → Firebase Storage (`src/services/storageService.ts`)
- File URLs → Backend API (`src/services/api.ts`)
- Currently API calls are commented out to prevent CORS errors during development

**Type Structure**: Centralized in `src/types/` with financial document types:
- `balanceSheet.ts`, `cashFlow.ts`, `incomeStatement.ts`, `financialPosition.ts`
- Main exports through `src/types/index.ts`

**Chart Visualization**: 
- Chart.js with react-chartjs-2
- Components in `src/components/Visualization/charts/`
- Uses mock data from `src/mock/financial-data.ts`

### Environment Configuration

Requires `.env.local` with:
```
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
```

### Key Components Structure
- **AppLayout** - Main layout with navbar and outlet for pages
- **CategoryFileUpload** - Handles document uploads with drag-and-drop
- **FinancialCharts** - Container for all chart visualizations
- **Dashboard** - Main dashboard interface

### Firebase Integration
- Storage configured in `src/services/firebase.ts`
- Upload logic in `src/services/storageService.ts`
- Files stored in `financial_documents/` bucket folder