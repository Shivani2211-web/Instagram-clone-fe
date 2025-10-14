import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  IconButton, 
  Divider,
  InputAdornment,
  Avatar
} from '@mui/material';
import { 
  Close as CloseIcon, 
  NavigateBefore as BackIcon, 
//   NavigateNext as NextIcon,
  TagFaces as EmojiIcon,
  AddLocation as LocationIcon,
  Collections as GalleryIcon
} from '@mui/icons-material';

const CreatePost = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setStep(2);
    }
  };

  const handleShare = () => {
    // Handle post creation logic
    console.log('Creating post with:', { caption, location, selectedImage });
    navigate('/');
  };

  const renderStep1 = () => (
    <Box textAlign="center" p={4}>
      <Box mb={4}>
        <GalleryIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>Drag photos and videos here</Typography>
        <Button 
          variant="contained" 
          component="label"
          sx={{ mt: 2 }}
        >
          Select from computer
          <input 
            type="file" 
            hidden 
            accept="image/*" 
            onChange={handleImageUpload}
          />
        </Button>
      </Box>
    </Box>
  );

  const renderStep2 = () => (
    <Box display="flex" height="100vh">
      {/* Image Preview */}
      <Box 
        flex={1.5} 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        bgcolor="#fafafa"
        borderRight="1px solid #dbdbdb"
      >
        {selectedImage && (
          <img 
            src={selectedImage} 
            alt="Preview" 
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
          />
        )}
      </Box>

      {/* Caption and Options */}
      <Box flex={1} p={2} display="flex" flexDirection="column">
        <Box display="flex" alignItems="center" mb={3}>
          <Avatar 
            src="/default-avatar.jpg" 
            sx={{ width: 30, height: 30, mr: 1.5 }} 
          />
          <Typography fontWeight={600}>johndoe</Typography>
        </Box>

        <TextField
          fullWidth
          multiline
          rows={6}
          placeholder="Write a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                  <EmojiIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          placeholder="Add location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocationIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        <Divider sx={{ my: 2 }} />

        <Box flexGrow={1} />
        
        <Button 
          variant="contained" 
          fullWidth 
          onClick={handleShare}
          disabled={!selectedImage}
          sx={{ mt: 2, textTransform: 'none', py: 1 }}
        >
          Share
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box height="100vh" bgcolor="#fafafa">
      {/* Header */}
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="space-between" 
        p={2}
        borderBottom="1px solid #dbdbdb"
        bgcolor="white"
      >
        <IconButton onClick={() => step === 1 ? navigate(-1) : setStep(1)}>
          {step === 1 ? <CloseIcon /> : <BackIcon />}
        </IconButton>
        
        <Typography variant="h6" fontWeight={500}>
          {step === 1 ? 'New Post' : 'Create New Post'}
        </Typography>
        
        {step === 2 && (
          <Button 
            color="primary" 
            onClick={handleShare}
            disabled={!selectedImage}
            sx={{ textTransform: 'none' }}
          >
            Share
          </Button>
        )}
        {step === 1 && <div style={{ width: 40 }}></div>}
      </Box>

      {/* Content */}
      <Box height="calc(100% - 64px)">
        {step === 1 ? renderStep1() : renderStep2()}
      </Box>
    </Box>
  );
};

export default CreatePost;
