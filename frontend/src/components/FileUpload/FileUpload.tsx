import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  CircularProgress,
  LinearProgress 
} from '@mui/material';
import { 
  Description as DescriptionIcon, 
  PictureAsPdf as PdfIcon, 
  TableChart as ExcelIcon, 
  Upload as UploadIcon 
} from '@mui/icons-material';
import { uploadDocument } from '../../services/api';

interface FileUploadProps {
  onUploadComplete: (data: any) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadComplete }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
    setError(null);
    setUploadProgress(0);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/msword': ['.doc'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1
  });

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.pdf')) return <PdfIcon color="error" />;
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) return <ExcelIcon color="success" />;
    return <DescriptionIcon color="primary" />;
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Use the uploadDocument service with progress tracking
      const result = await uploadDocument(files[0], (progress) => {
        setUploadProgress(progress);
      });
      
      onUploadComplete(result);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(`Failed to upload file: ${err.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Upload Financial Document
      </Typography>
      
      <Box 
        {...getRootProps()} 
        sx={{
          border: '2px dashed #cccccc',
          borderRadius: 2,
          p: 3,
          mb: 2,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragActive ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
          '&:hover': {
            bgcolor: 'rgba(0, 0, 0, 0.05)'
          }
        }}
      >
        <input {...getInputProps()} />
        <UploadIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
        <Typography variant="body1">
          {isDragActive
            ? 'Drop the files here...'
            : 'Drag & drop a financial document here, or click to select'}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Supported formats: PDF, Word, Excel
        </Typography>
      </Box>

      {files.length > 0 && (
        <>
          <Typography variant="subtitle1" gutterBottom>
            Selected File:
          </Typography>
          <List>
            {files.map((file, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  {getFileIcon(file.name)}
                </ListItemIcon>
                <ListItemText 
                  primary={file.name} 
                  secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`} 
                />
              </ListItem>
            ))}
          </List>
          
          {uploading && (
            <Box sx={{ width: '100%', mt: 2, mb: 2 }}>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                {uploadProgress < 100 
                  ? `Uploading: ${Math.round(uploadProgress)}%` 
                  : 'Processing file...'}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={uploadProgress} 
                color="primary"
              />
            </Box>
          )}
          
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleUpload}
            disabled={uploading}
            startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <UploadIcon />}
            sx={{ mt: 2 }}
          >
            {uploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </>
      )}

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
    </Paper>
  );
};

export default FileUpload; 