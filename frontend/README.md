# AI Financial Report Analyzer - Frontend

A React TypeScript frontend application for analyzing financial documents with AI assistance. Built with Vite, Material UI, and Firebase.

## Prerequisites

- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)
- **Firebase account** (for file storage)

## Installation

1. **Clone the repository** (if not already done)
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```
The app will be available at `http://localhost:5173`

### Build for Production
```bash
npm run build
```



## Application Features

- **Document Upload**: Upload financial documents (Balance Sheets, Income Statements, Cash Flow Statements)
- **Processing Simulation**: Visual feedback during document processing
- **Data Visualization**: Interactive charts and graphs for financial data
- **AI Chat Interface**: Chat with AI about your financial documents
- **Multi-format Export**: Export financial data in various formats

## Project Structure

```
src/
├── components/        # Reusable UI components
├── pages/            # Page components
├── services/         # API and Firebase services
├── types/            # TypeScript type definitions
├── mock/             # Mock data for development
└── assets/           # Static assets
```

## Key Routes

- `/` - Home page
- `/upload-documents` - Document upload interface
- `/processing-documents` - Processing status page
- `/view-results` - Financial data visualization
- `/chat` - AI chat interface


## Support

For issues or questions, check the project documentation or create an issue in the repository.
