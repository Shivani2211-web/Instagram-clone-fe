import { Box } from '@mui/material';
import Reels from '../components/reels/Reels';

const ReelsPage = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <Reels />
      </Box>
    </Box>
  );
};

export default ReelsPage;
