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

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Firebase configuration:
   ```env
   # API URL
   VITE_API_URL=http://localhost:5000/api
   
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

## Getting Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Go to **Project Settings** > **General**
4. Scroll down to **Your apps** section
5. Click on the web app icon or **Add app** if none exists
6. Copy the configuration values to your `.env.local` file

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

### Preview Production Build
```bash
npm run preview
```

### Code Quality
```bash
npm run lint
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

## Firebase Deployment

If you want to deploy to Firebase Hosting:

```bash
firebase deploy --only hosting
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: API calls are commented out by default to prevent CORS issues during development
2. **Firebase Errors**: Make sure all Firebase configuration values are correct
3. **Build Errors**: Run `npm run lint` to check for code issues

### Environment Variables Not Loading
- Make sure your `.env.local` file is in the root directory
- Restart the development server after changing environment variables
- Verify all variable names start with `VITE_`

## Development Notes

- The app uses global `window.uploadedFiles` for file state management
- Mock data is used for charts when backend API is not available
- Firebase Storage handles file uploads with organized folder structure

## Support

For issues or questions, check the project documentation or create an issue in the repository.