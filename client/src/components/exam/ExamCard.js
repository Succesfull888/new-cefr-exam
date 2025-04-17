import React from 'react';
import { Card, CardContent, CardActions, Typography, Button, Box } from '@mui/material';
import { PlayCircleOutline, HelpOutline } from '@mui/icons-material';

const ExamCard = ({ title, description, questionCount, onStart }) => {
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
          {title}
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          {description}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <HelpOutline fontSize="small" color="action" />
          <Typography variant="body2" color="textSecondary" sx={{ ml: 0.5 }}>
            {questionCount} questions
          </Typography>
        </Box>
      </CardContent>
      <CardActions>
        <Button 
          size="small" 
          color="primary" 
          startIcon={<PlayCircleOutline />} 
          onClick={onStart}
          fullWidth
        >
          Start Exam
        </Button>
      </CardActions>
    </Card>
  );
};

export default ExamCard;