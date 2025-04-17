import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';

const QuestionDisplay = ({ question, examState }) => {
  if (!question) return null;
  
  const { questionType, question: questionText, imageUrl, tableData } = question;
  
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        {questionText}
      </Typography>
      
      {questionType === 'image' && imageUrl && (
        <Box sx={{ mt: 2, mb: 3, textAlign: 'center' }}>
          <img 
            src={imageUrl} 
            alt="Question" 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '400px',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }} 
          />
        </Box>
      )}
      
      {questionType === 'table' && tableData && (
        <Paper variant="outlined" sx={{ mt: 2, mb: 3, overflow: 'auto' }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              {tableData.topic}
            </Typography>
            
            <Grid container spacing={2}>
              {tableData.columns.map((column, colIndex) => (
                <Grid item xs={6} key={colIndex}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 1, 
                      bgcolor: 'primary.main', 
                      color: 'primary.contrastText',
                      textAlign: 'center',
                      fontWeight: 'bold'
                    }}
                  >
                    {column}
                  </Paper>
                  
                  {tableData.rows.map((row, rowIndex) => (
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 1, 
                        mt: 1,
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                      key={rowIndex}
                    >
                      {row[colIndex]}
                    </Paper>
                  ))}
                </Grid>
              ))}
            </Grid>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default QuestionDisplay;