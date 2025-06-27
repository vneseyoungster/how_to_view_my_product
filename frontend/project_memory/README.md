# AI Financial Report Analyzer - Frontend

This is the frontend application for the AI Financial Report Analyzer project. It provides a user interface for uploading financial documents, processing them with AI, and visualizing the extracted financial data.

## Features

- Document upload interface supporting multiple formats (PDF, Word, Excel)
- Firebase Storage integration for secure file storage
- AI-powered data extraction from financial reports
- Visualization of key financial metrics:
  - Line charts for Cash Flow from Operating Activities
  - Stacked area charts for cash inflows and outflows
  - Waterfall charts for cash components breakdown
- Responsive design for desktop and mobile devices

## Technologies Used

- React 18 with TypeScript
- Vite for fast development and building
- Material UI for components and styling
- Chart.js for data visualization
- Firebase Storage for document storage
- Axios for API communication

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm 8.x or higher
- Firebase account with a project created

### Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```
   cd frontend
   ```
3. Install dependencies:
   ```
   npm install
   ```

### Firebase Setup

1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Firebase Storage in your project
3. Install the Firebase CLI:
   ```
   npm install -g firebase-tools
   ```
4. Login to Firebase:
   ```
   firebase login
   ```
5. Initialize Firebase in your project (this will connect your local project to your Firebase project):
   ```
   firebase init
   ```
   - Select "Storage" when prompted for Firebase features
   - Select your Firebase project
   - Accept the default firebase.storage.rules file
   
6. Deploy Firebase Storage rules:
   ```
   firebase deploy --only storage
   ```

### Configuration

Create a `.env.local` file in the root of the frontend directory with the following variables:

```
# API URL
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

Replace the Firebase configuration values with those from your Firebase project. You can find these in the Firebase console under Project Settings > General > Your apps > Firebase SDK snippet > Config.

### Development

To start the development server:

```
npm run dev
```

This will start the application in development mode at [http://localhost:5173](http://localhost:5173).

### Building for Production

To build the application for production:

```
npm run build
```

The built files will be in the `dist` directory.

### Deploying to Firebase Hosting

After building the application, you can deploy it to Firebase Hosting:

```
firebase deploy --only hosting
```

This will make your application available at your Firebase Hosting URL.

### Preview Production Build

To preview the production build locally:

```
npm run preview
```

## Project Structure

```
frontend/
├── public/            # Static assets
├── src/
│   ├── assets/        # Images, fonts, etc.
│   ├── components/    # React components
│   │   ├── Dashboard/     # Main dashboard interface
│   │   ├── FileUpload/    # Document upload component
│   │   └── Visualization/ # Charts and data visualization
│   ├── services/      # API services
│   │   ├── api.ts         # Backend API service
│   │   ├── firebase.ts    # Firebase initialization
│   │   └── storageService.ts # Firebase Storage service
│   ├── App.tsx        # Main application component
│   ├── main.tsx       # Application entry point
│   └── index.css      # Global styles
├── .env.local         # Environment variables
├── firebase.json      # Firebase configuration
├── firebase.storage.rules # Firebase Storage rules
├── index.html         # HTML template
├── package.json       # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration
└── vite.config.ts     # Vite configuration
```

## Connecting to the Backend

The frontend is designed to work with the AI Financial Report Analyzer backend API. Make sure the backend server is running and accessible at the URL specified in your `.env.local` file.

## Current Status (As of May 27, 2025)

- Core frontend development is largely complete.
- Document upload, processing simulation, and results display are functional.
- Mock data functionality is integrated for demonstration and testing.
- Recent fixes include resolving JSX syntax errors in the results display page (`ViewResultsPage.tsx`) and addressing layout issues to ensure the application utilizes the full viewport width.
- The application structure includes main pages for upload, processing, results, and a chat interface.
- Key financial metrics are visualized using Chart.js.
- Firebase Storage is used for document uploads.
- The application is built with React, Vite, TypeScript, and Material UI.
- Next steps involve further testing, backend integration, and preparing for deployment.

## License

This project is part of the AI Financial Report Analyzer application developed as a BSc Computer Science undergraduate project.
