import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

const Timer = ({ seconds, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  
  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete && onComplete();
      return;
    }
    
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeLeft, onComplete]);
  
  const progress = (seconds - timeLeft) / seconds * 100;
  const isWarning = timeLeft <= 5; // Last 5 seconds
  
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress 
        variant="determinate" 
        value={progress} 
        size={80}
        thickness={4}
        sx={{ 
          color: isWarning ? 'error.main' : 'primary.main',
          animation: isWarning ? 'pulse 1s infinite' : 'none',
          '@keyframes pulse': {
            '0%': { opacity: 1 },
            '50%': { opacity: 0.7 },
            '100%': { opacity: 1 },
          }
        }}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography 
          variant="h5" 
          component="div" 
          color={isWarning ? 'error.main' : 'text.primary'}
          fontWeight={isWarning ? 'bold' : 'normal'}
        >
          {timeLeft}
        </Typography>
      </Box>
    </Box>
  );
};

export default Timer;