import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Chip,
  Alert,
  Stack,
  styled,
  alpha,
  CircularProgress,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  FormHelperText,
  Grid,
  IconButton
} from '@mui/material';
import { useDropzone, Accept } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AddIcon from '@mui/icons-material/Add';
///import { uploadCategoryDocument } from '../../services/api';

// Define financial document categories
export const DOCUMENT_TYPES = [
  {
    id: 'balance-sheet',
    name: 'Balance Sheet',
    description: 'Upload your balance sheet document',
  },
  {
    id: 'cash-flow',
    name: 'Cash Flow',
    description: 'Upload your cash flow statement',
  },
  {
    id: 'income-statement',
    name: 'Income Statement',
    description: 'Upload your income statement',
  },
  {
    id: 'assets',
    name: 'Assets',
    description: 'Upload your assets documentation',
  },
  {
    id: 'multiple-type',
    name: 'Multiple Type',
    description: 'Upload documents of multiple financial types for comprehensive analysis',
  },
];

// Define file format types
export const FILE_FORMATS = [
  {
    id: 'image',
    name: 'Images',
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif']
    } as Accept,
    icon: <ImageIcon />,
  },
  {
    id: 'pdf',
    name: 'PDF',
    accept: {
      'application/pdf': ['.pdf']
    } as Accept,
    icon: <PictureAsPdfIcon />,
  },
];

// Define types
export interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  category: string;
  fileFormat?: string;
  uploadProgress?: number;
  downloadURL?: string;
  processed?: boolean;
  error?: string;
  fileId?: string;
}

interface CategoryFileUploadProps {
  onComplete: (files: UploadedFile[]) => void;
}

// Styled components
const UploadZone = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  border: `2px dashed ${theme.palette.divider}`,
  backgroundColor: alpha(theme.palette.primary.main, 0.04),
  transition: 'all 0.2s ease-in-out',
  cursor: 'pointer',
  height: '100%',
  minHeight: 250,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    borderColor: theme.palette.primary.main,
  },
}));

const CategoryFileUpload: React.FC<CategoryFileUploadProps> = ({ onComplete }) => {
  const theme = useTheme();
  const additionalFileInputRef = useRef<HTMLInputElement>(null);
  
  // Change from single file to array of files
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('');
  const [selectedFileFormat, setSelectedFileFormat] = useState<string>('');
  const [documentTypeError, setDocumentTypeError] = useState<string | null>(null);
  const [fileFormatError, setFileFormatError] = useState<string | null>(null);

  // Maximum number of files allowed
  const MAX_FILES = 10;

  // Helper functions
  const generateFileId = () => {
    return `${selectedDocumentType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const validateFileFormat = (file: File) => {
    const fileFormat = getSelectedFileFormat();
    return fileFormat?.id === 'image' 
      ? file.type.startsWith('image/') 
      : file.type === 'application/pdf';
  };

  const isDuplicateFile = (newFile: File) => {
    return uploadedFiles.some(uploadedFile => 
      uploadedFile.file.name === newFile.name && 
      uploadedFile.file.size === newFile.size
    );
  };

  const getFileCountText = () => {
    return uploadedFiles.length > 1 ? 'Continue with Documents' : 'Continue with Document';
  };

  // Handle document type selection
  const handleDocumentTypeChange = (event: SelectChangeEvent) => {
    setSelectedDocumentType(event.target.value);
    setDocumentTypeError(null);
  };

  // Handle file format selection
  const handleFileFormatChange = (event: SelectChangeEvent) => {
    setSelectedFileFormat(event.target.value);
    setFileFormatError(null);
    
    // If user has already uploaded files, clear them since format changed
    if (uploadedFiles.length > 0) {
      handleRemoveAllFiles();
    }
  };

  // Get the currently selected file format object
  const getSelectedFileFormat = () => {
    return FILE_FORMATS.find(format => format.id === selectedFileFormat);
  };

  // Get the currently selected document type object
  const getSelectedDocumentType = () => {
    return DOCUMENT_TYPES.find(type => type.id === selectedDocumentType);
  };

  // Process files and add to array
  const processFiles = (files: File[]) => {
    const newUploadedFiles: UploadedFile[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      // Check for duplicates
      if (isDuplicateFile(file)) {
        errors.push(`File "${file.name}" is already uploaded`);
        return;
      }

      // Validate file format
      if (!validateFileFormat(file)) {
        const fileFormat = getSelectedFileFormat();
        errors.push(`"${file.name}" is not a valid ${fileFormat?.name.toLowerCase()} file`);
        return;
      }

      // Check file limit
      if (uploadedFiles.length + newUploadedFiles.length >= MAX_FILES) {
        errors.push(`Maximum ${MAX_FILES} files allowed`);
        return;
      }

      const fileId = generateFileId();
      const filePreview = URL.createObjectURL(file);

      newUploadedFiles.push({
        id: fileId,
        file,
        preview: filePreview,
        category: selectedDocumentType,
        fileFormat: selectedFileFormat,
        uploadProgress: 0
      });
    });

    if (errors.length > 0) {
      setGeneralError(errors.join(', '));
    } else {
      setGeneralError(null);
    }

    if (newUploadedFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
    }
  };

  // Setup dropzone for initial upload
  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    if (!selectedDocumentType) {
      setDocumentTypeError('Please select a document type first');
      return;
    }
    
    if (!selectedFileFormat) {
      setFileFormatError('Please select a file format first');
      return;
    }

    processFiles(acceptedFiles);
  };

  // Setup dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: selectedFileFormat ? getSelectedFileFormat()?.accept : undefined,
    maxFiles: MAX_FILES,
    disabled: !selectedDocumentType || !selectedFileFormat || uploadedFiles.length > 0
  });

  // Handle file removal by ID
  const handleRemoveFile = (fileId: string) => {
    const fileToRemove = uploadedFiles.find(file => file.id === fileId);
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  // Handle removing all files
  const handleRemoveAllFiles = () => {
    uploadedFiles.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setUploadedFiles([]);
  };

  // Handle adding more files
  const handleAddMoreFiles = () => {
    if (additionalFileInputRef.current) {
      additionalFileInputRef.current.click();
    }
  };

  // Handle additional file selection
  const handleAdditionalFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      processFiles(files);
    }
    // Reset the input value to allow selecting the same file again
    event.target.value = '';
  };

  // Upload files
  const handleUpload = async () => {
    if (uploadedFiles.length === 0) return;
    
    setUploading(true);
    setGeneralError(null);
    
    try {
      // Add a slight delay to simulate processing
      setTimeout(() => {
        setUploading(false);
        onComplete(uploadedFiles);
      }, 1000);
    } catch (error) {
      console.error('Error preparing files:', error);
      setGeneralError('There was a problem preparing your files. Please try again.');
      setUploading(false);
    }
  };

  // Validation for form submission
  const isFormValid = uploadedFiles.length > 0 && !!selectedDocumentType && !!selectedFileFormat;

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Upload Financial Document{uploadedFiles.length > 1 ? 's' : ''}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Please select the type of document you want to upload and choose your preferred file format.
        </Typography>
      </Box>

      {generalError && (
        <Alert severity="error" sx={{ mb: 3, width: '100%' }}>
          {generalError}
        </Alert>
      )}
      
      <Stack spacing={3} sx={{ mb: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <FormControl fullWidth error={!!documentTypeError}>
            <InputLabel id="document-type-label">Document Type</InputLabel>
            <Select
              labelId="document-type-label"
              id="document-type"
              value={selectedDocumentType}
              label="Document Type"
              onChange={handleDocumentTypeChange}
              disabled={uploading || uploadedFiles.length > 0}
            >
              {DOCUMENT_TYPES.map((type) => (
                <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
              ))}
            </Select>
            {documentTypeError && <FormHelperText>{documentTypeError}</FormHelperText>}
          </FormControl>
          
          <FormControl fullWidth error={!!fileFormatError}>
            <InputLabel id="file-format-label">File Format</InputLabel>
            <Select
              labelId="file-format-label"
              id="file-format"
              value={selectedFileFormat}
              label="File Format"
              onChange={handleFileFormatChange}
              disabled={uploading || uploadedFiles.length > 0}
            >
              {FILE_FORMATS.map((format) => (
                <MenuItem key={format.id} value={format.id}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {format.icon}
                    <Typography>{format.name}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
            {fileFormatError && <FormHelperText>{fileFormatError}</FormHelperText>}
          </FormControl>
        </Stack>
      </Stack>
      
      {/* Show upload zone only when no files uploaded */}
      {uploadedFiles.length === 0 && (
        <Card 
          elevation={2} 
          sx={{ 
            height: '100%',
            mb: 4
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {getSelectedDocumentType()?.name || 'Document Upload'}
            </Typography>
            
            <UploadZone 
              {...getRootProps()} 
              sx={{ 
                bgcolor: isDragActive 
                  ? alpha('#2196f3', 0.08) 
                  : alpha('#f5f5f5', 0.8),
                borderColor: isDragActive ? 'primary.main' : 'divider',
                minHeight: 250,
                opacity: (!selectedDocumentType || !selectedFileFormat) ? 0.7 : 1,
              }}
            >
              <input {...getInputProps()} />
              {selectedFileFormat === 'pdf' ? (
                <PictureAsPdfIcon 
                  color="primary" 
                  sx={{ fontSize: 60, mb: 1 }} 
                />
              ) : (
                <CloudUploadIcon 
                  color="primary" 
                  sx={{ fontSize: 60, mb: 1 }} 
                />
              )}
              
              <Typography variant="body1" align="center" sx={{ mb: 1 }}>
                {!selectedDocumentType || !selectedFileFormat ? (
                  'Please select document type and file format above'
                ) : isDragActive ? (
                  `Drop ${selectedFileFormat === 'pdf' ? 'PDF' : 'image'} here...`
                ) : (
                  `Drag & drop ${selectedFileFormat === 'pdf' ? 'a PDF' : 'an image'}, or click to select`
                )}
              </Typography>
              
              {selectedDocumentType && selectedFileFormat && (
                <Typography variant="caption" color="text.secondary" align="center">
                  {getSelectedDocumentType()?.description}
                </Typography>
              )}
            </UploadZone>
          </CardContent>
        </Card>
      )}

      {/* Show uploaded files grid when files exist */}
      {uploadedFiles.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Uploaded Files ({uploadedFiles.length})
          </Typography>
          
          <Grid container spacing={2}>
            {uploadedFiles.map((uploadedFile) => (
              <Grid item xs={12} sm={6} md={4} key={uploadedFile.id}>
                <Card elevation={2} sx={{ height: '100%' }}>
                  <Box sx={{ position: 'relative' }}>
                    {uploadedFile.fileFormat === 'image' ? (
                      <CardMedia
                        component="img"
                        height="200"
                        image={uploadedFile.preview}
                        alt={`${getSelectedDocumentType()?.name || 'Document'} preview`}
                        sx={{ borderRadius: '4px 4px 0 0', objectFit: 'cover' }}
                      />
                    ) : (
                      <Box 
                        sx={{ 
                          height: 200, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          backgroundColor: alpha(theme.palette.primary.main, 0.04),
                          borderRadius: '4px 4px 0 0'
                        }}
                      >
                        <Stack direction="column" spacing={2} alignItems="center">
                          <PictureAsPdfIcon sx={{ fontSize: 60, color: theme.palette.error.main }} />
                          <Typography variant="body2" align="center">
                            {uploadedFile.file.name}
                          </Typography>
                        </Stack>
                      </Box>
                    )}
                    
                    <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                      <Chip 
                        label={uploadedFile.file.name.length > 15 
                          ? `${uploadedFile.file.name.substring(0, 15)}...` 
                          : uploadedFile.file.name
                        }
                        size="small"
                        sx={{ 
                          backgroundColor: alpha('#fff', 0.8),
                          backdropFilter: 'blur(4px)',
                        }}
                      />
                    </Box>
                    
                    {uploadedFile.error && (
                      <Alert 
                        severity="error" 
                        sx={{ 
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          fontSize: '0.75rem',
                          borderRadius: 0
                        }}
                        icon={<ErrorIcon fontSize="small" />}
                      >
                        {uploadedFile.error}
                      </Alert>
                    )}
                  </Box>
                  
                  <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveFile(uploadedFile.id)}
                      disabled={uploading}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {/* Add more files button */}
          {uploadedFiles.length < MAX_FILES && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddMoreFiles}
                disabled={uploading}
                sx={{ borderRadius: 2 }}
              >
                Add More {selectedFileFormat === 'pdf' ? 'PDFs' : 'Images'}
              </Button>
            </Box>
          )}
          
          {/* Hidden file input for additional files */}
          <input
            ref={additionalFileInputRef}
            type="file"
            multiple
            accept={getSelectedFileFormat()?.accept ? Object.keys(getSelectedFileFormat()!.accept).join(',') : ''}
            onChange={handleAdditionalFileChange}
            style={{ display: 'none' }}
          />
        </Box>
      )}
      
      <Stack 
        direction="row" 
        spacing={2} 
        justifyContent="center" 
        sx={{ mt: 4, width: '100%' }}
      >
        <Button
          variant="contained"
          color="primary"
          size="large"
          disabled={!isFormValid || uploading}
          onClick={handleUpload}
          startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : undefined}
        >
          {uploading ? 'Processing...' : getFileCountText()}
        </Button>
      </Stack>
    </Box>
  );
};

export default CategoryFileUpload; 