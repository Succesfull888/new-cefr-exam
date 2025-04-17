import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Button, Paper, Grid, Divider, Chip, CircularProgress, Alert, Card, CardContent } from '@mui/material';
import { ArrowBack, Person, CalendarToday, Assignment, Grade } from '@mui/icons-material';
import api from '../utils/api';
import QuestionDisplay from '../components/exam/QuestionDisplay';

const ExamResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await api.get(`/api/exams/${id}`);
        setExam(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Fetch exam result error:', err);
        setLoading(false);
      }
    };
    
    fetchExam();
  }, [id]);
  
  // Get part details
  const getPartDetails = (partNumber) => {
    const partQuestions = exam.examTemplate.questions.filter(q => q.part === partNumber);
    const partResponses = [];
    
    partQuestions.forEach(question => {
      const response = exam.responses.find(r => r.questionId === question._id);
      if (response) {
        partResponses.push({
          question,
          response
        });
      }
    });
    
    const partFeedback = exam.feedback.find(f => f.part === partNumber);
    
    return {
      questions: partQuestions,
      responses: partResponses,
      feedback: partFeedback
    };
  };
  
  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <CircularProgress />
    </Box>;
  }
  
  if (!exam) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Alert severity="error">
            Exam not found. It may have been deleted or you don't have permission to view it.
          </Alert>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/my-exams')}
            sx={{ mt: 3 }}
          >
            Back to My Exams
          </Button>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Exam Result
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/my-exams')}
          >
            Back to My Exams
          </Button>
        </Box>
        
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography variant="h5" gutterBottom>
                  {exam.examTemplate.title}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Person color="primary" fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">
                      Student: {exam.student.firstName} {exam.student.lastName}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarToday color="primary" fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">
                      Submitted: {new Date(exam.submittedAt).toLocaleString()}
                    </Typography>
                  </Box>
                  {exam.status === 'evaluated' && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Grade color="primary" fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="body2">
                        Evaluated: {new Date(exam.evaluatedAt).toLocaleString()}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <Chip 
                  label={exam.status === 'evaluated' ? 'Evaluated' : 'Submitted'} 
                  color={exam.status === 'evaluated' ? 'success' : 'warning'}
                  sx={{ mb: 1, mr: 1 }}
                />
                {exam.status === 'evaluated' && (
                  <Typography variant="h6">
                    Score: {exam.totalScore} / 75
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          {exam.status === 'submitted' ? (
            <Alert severity="info" sx={{ mb: 3 }}>
              Your exam has been submitted and is pending evaluation. Check back later to see your results.
            </Alert>
          ) : (
            [1, 2, 3].map(partNumber => {
              const partDetails = getPartDetails(partNumber);
              return (
                <Box key={partNumber} sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Part {partNumber}
                  </Typography>
                  
                  {partDetails.responses.map((item, index) => (
                    <Card variant="outlined" sx={{ mb: 2 }} key={index}>
                      <CardContent>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Question {index + 1}:
                        </Typography>
                        
                        <QuestionDisplay 
                          question={item.question} 
                          examState="reading"
                        />
                        
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Your Response:
                          </Typography>
                          <audio 
                            controls 
                            style={{ width: '100%' }}
                            src={item.response.audioUrl}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {partDetails.feedback && (
                    <Card 
                      sx={{ 
                        mt: 2, 
                        bgcolor: 'primary.light', 
                        color: 'primary.contrastText' 
                      }}
                    >
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={4}>
                            <Typography variant="h6">
                              Score: {partDetails.feedback.score} / 25
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={8}>
                            <Typography variant="subtitle1" gutterBottom>
                              Feedback:
                            </Typography>
                            <Typography variant="body2">
                              {partDetails.feedback.feedback || "No detailed feedback provided."}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  )}
                </Box>
              );
            })
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ExamResult;