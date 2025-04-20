import React from 'react';
import { Card, CardContent, CardActions, Typography, Button, Box } from '@mui/material';
import { PlayCircleOutline, HelpOutline, Timer } from '@mui/icons-material';

const ExamCard = ({ 
  title, 
  description, 
  questionCount, 
  duration,
  level,
  onStart 
}) => {
  // Xatolarsiz ishlashi uchun barcha proplar tekshirilib, default qiymatlar bilan ta'minlanadi
  const examTitle = title || "Untitled Exam";
  const examDescription = description || "No description available";
  const questions = questionCount || 0;
  const examDuration = duration || "20-30";
  
  // onStart funksiyasi berilmagan bo'lsa, shunchaki konsol xabar chiqaruvchi funksiya yaratiladi
  const handleStart = () => {
    if (typeof onStart === 'function') {
      onStart();
    } else {
      console.log("Warning: No onStart handler provided for exam:", examTitle);
    }
  };

  return (
    <Card 
      variant="outlined" 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          {examTitle}
        </Typography>
        
        {/* Level ko'rsatkichi, agar berilgan bo'lsa */}
        {level && (
          <Box 
            sx={{ 
              display: 'inline-block',
              bgcolor: 
                level === 'A1' || level === 'A2' ? 'success.light' :
                level === 'B1' || level === 'B2' ? 'primary.light' :
                'secondary.light',
              color: 'white',
              px: 1,
              py: 0.3,
              borderRadius: 1,
              mb: 1.5,
              fontSize: '0.75rem',
              fontWeight: 'bold'
            }}
          >
            {level}
          </Box>
        )}
        
        <Typography variant="body2" color="textSecondary" paragraph>
          {examDescription}
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
          {/* Savollar soni */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <HelpOutline fontSize="small" color="action" sx={{ mr: 1 }} />
            <Typography variant="body2" color="textSecondary">
              {questions} {questions === 1 ? 'question' : 'questions'}
            </Typography>
          </Box>
          
          {/* Imtihon davomiyligi */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Timer fontSize="small" color="action" sx={{ mr: 1 }} />
            <Typography variant="body2" color="textSecondary">
              {examDuration} minutes
            </Typography>
          </Box>
        </Box>
      </CardContent>
      
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button 
          variant="contained"
          color="primary" 
          startIcon={<PlayCircleOutline />} 
          onClick={handleStart}
          fullWidth
          sx={{ 
            mt: 1,
            fontWeight: 'medium',
            textTransform: 'none'
          }}
        >
          Start Exam
        </Button>
      </CardActions>
    </Card>
  );
};

export default ExamCard;
