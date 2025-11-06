import React, { useRef, useState } from 'react';
import { Box, IconButton, Typography, CircularProgress, Button } from '@mui/material';
import { CameraAlt as CameraIcon, Close as CloseIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { storiesAPI } from '../../api/endpoints';

interface CreateStoryProps {
  onClose: () => void;
  onStoryCreated?: () => void;
}

export const CreateStory = ({ onClose, onStoryCreated }: CreateStoryProps) => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !currentUser) return;
    
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      
      // Upload the image
      const uploadResponse = await storiesAPI.uploadStoryImage(formData);
      
      // Create the story with the uploaded image URL
      if (uploadResponse && uploadResponse.url) {
        await storiesAPI.createStory({
          image: uploadResponse.url,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
        });
        
        // Notify parent component that story was created
        if (onStoryCreated) {
          onStoryCreated();
        }
        
        onClose();
      }
    } catch (error) {
      console.error('Error uploading story:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'background.paper',
        zIndex: 1300,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <IconButton onClick={onClose} disabled={isLoading}>
          <CloseIcon />
        </IconButton>
        <Typography variant="h6">Create Story</Typography>
        <Box sx={{ width: 40 }} /> {/* For alignment */}
      </Box>

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          textAlign: 'center',
        }}
      >
        {preview ? (
          <>
            <Box
              component="img"
              src={preview}
              alt="Story preview"
              sx={{
                maxWidth: '100%',
                maxHeight: '60vh',
                borderRadius: 2,
                mb: 3,
              }}
            />
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setSelectedFile(null);
                  setPreview(null);
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : null}
              >
                {isLoading ? 'Sharing...' : 'Share to Story'}
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Box
              onClick={() => fileInputRef.current?.click()}
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                bgcolor: 'grey.100',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'grey.200',
                },
              }}
            >
              <CameraIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
            </Box>
            <Typography variant="h6" gutterBottom>
              Create a story with a photo or video
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Share moments that disappear after 24 hours
            </Typography>
            <Button
              variant="contained"
              onClick={() => fileInputRef.current?.click()}
              startIcon={<CameraIcon />}
            >
              Select from device
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,video/*"
              style={{ display: 'none' }}
              capture="environment"
            />
          </>
        )}
      </Box>
    </Box>
  );
};

export default CreateStory;
