import axios from 'axios';
import { uploadFile } from './storageService';

// Create an axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// File upload service using Firebase Storage
export const uploadDocument = async (
  file: File,
  progressCallback?: (progress: number) => void
) => {
  try {
    // First upload the file to Firebase Storage
    const downloadURL = await uploadFile(
      file,
      'financial_documents',
      { 
        customMetadata: {
          fileName: file.name,
          fileSize: file.size.toString(),
          fileType: file.type,
          uploadDate: new Date().toISOString()
        }
      },
      progressCallback
    );

    // Then send the download URL to our backend for processing
    const response = await api.post('/documents/process', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileUrl: downloadURL,
    });

    return {
      ...response.data,
      fileUrl: downloadURL,
      fileName: file.name
    };
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
};

// Category-based file upload service using Firebase Storage
export const uploadCategoryDocument = async (
  file: File,
  category: string,
  progressCallback?: (progress: number) => void
) => {
  try {
    // First upload the file to Firebase Storage - use same directory as original upload
    const downloadURL = await uploadFile(
      file,
      'financial_documents', // Use the same directory that works with the original upload
      { 
        customMetadata: {
          fileName: file.name,
          fileSize: file.size.toString(),
          fileType: file.type,
          category,
          uploadDate: new Date().toISOString()
        }
      },
      progressCallback
    );

    // Skip API call to backend for now and just return the file information
    // This prevents CORS errors when the backend isn't ready
    return {
      fileUrl: downloadURL,
      fileName: file.name,
      category,
      fileId: `${category}-${Date.now()}`,
      status: 'success'
    };
    
    // The original code with API call - COMMENTED OUT
    /*
    const response = await api.post('/documents/process', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileUrl: downloadURL,
      category
    });

    return {
      ...response.data,
      fileUrl: downloadURL,
      fileName: file.name,
      category
    };
    */
  } catch (error) {
    console.error(`Error uploading ${category} document:`, error);
    throw error;
  }
};

// Get document processing status
export const getDocumentStatus = async (documentId: string) => {
  try {
    const response = await api.get(`/documents/${documentId}/status`);
    return response.data;
  } catch (error) {
    console.error('Error getting document status:', error);
    throw error;
  }
};

// Get financial data extracted from document
export const getFinancialData = async (documentId: string) => {
  try {
    const response = await api.get(`/documents/${documentId}/data`);
    return response.data;
  } catch (error) {
    console.error('Error getting financial data:', error);
    throw error;
  }
};

// Get list of processed documents
export const getDocumentsList = async () => {
  try {
    const response = await api.get('/documents');
    return response.data;
  } catch (error) {
    console.error('Error getting documents list:', error);
    throw error;
  }
};

export default api; 