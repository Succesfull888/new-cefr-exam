import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Button, Paper, Grid, TextField, Rating, Divider, Accordion, AccordionSummary, AccordionDetails, CircularProgress, Alert } from '@mui/material';
import { ExpandMore, Save, ArrowBack, Person, Mic } from '@mui/icons-material';
import api from '../../utils/api';
import QuestionDisplay from '../../components/exam/QuestionDisplay';
import { useSnackbar } from 'notistack';

const AdminExamEvaluate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState([
    { part: 1, score: 0, feedback: '' },
    { part: 2, score: 0, feedback: '' },
    { part: 3, score: 0, feedback: '' }
  ]);
  const [totalScore, setTotalScore] = useState(0);
  
  // Fetch exam details
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await api.get(`/api/exams/${id}`);
        setExam(res.data);
        
        // If exam is already evaluated, load the feedback
        if (res.data.status === 'evaluated' && res.data.feedback.length > 0) {
          setFeedback(res.data.feedback);
          setTotalScore(res.data.totalScore);
        }
        
        setLoading(false);
      } catch (err) {
        enqueueSnackbar('Failed to load exam', { variant: 'error' });
        navigate('/admin/exams');
      }
    };
    
    fetchExam();
  }, [id, navigate, enqueueSnackbar]);
  
  // Update feedback for a part
  const handleFeedbackChange = (part, field, value) => {
    const updatedFeedback = feedback.map(item => {
      if (item.part === part) {
        return { ...item, [field]: value };
      }
      return item;
    });
    
    setFeedback(updatedFeedback);
    
    // Calculate total score
    const newTotalScore = updatedFeedback.reduce((sum, item) => sum + item.score, 0);
    setTotalScore(newTotalScore);
  };
  
  // Submit evaluation
  const handleSubmitEvaluation = async () => {
    try {
      setSubmitting(true);
      
      await api.put(`/api/exams/${id}/evaluate`, {
        feedback,
        totalScore
      });
      
      enqueueSnackbar('Evaluation submitted successfully!', { variant: 'success' });
      navigate('/admin/exams');
    } catch (err) {
      enqueueSnackbar('Failed to submit evaluation', { variant: 'error' });
      setSubmitting(false);
    }
  };
  
  // Get responses for a part
  const getPartResponses = (part) => {
    if (!exam) return [];
    
    const partQuestions = exam.examTemplate.questions.filter(q => q.part === part);
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
    
    return partResponses;
  };
  
  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <CircularProgress />
    </Box>;
  }
  
  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 3, my: 4 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Evaluate Exam
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/admin/exams')}
          >
            Back to Exams
          </Button>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Exam: {exam.examTemplate.title}
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Person color="primary" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  Student: {exam.student.firstName} {exam.student.lastName} ({exam.student.username})
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1">
                Submitted: {new Date(exam.submittedAt).toLocaleString()}
              </Typography>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          {[1, 2, 3].map(part => (
            <Accordion key={part} defaultExpanded={part === 1}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">Part {part}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  {getPartResponses(part).map((item, index) => (
                    <Box key={index} sx={{ mb: 3 }}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          Question {index + 1}:
                        </Typography>
                        
                        <QuestionDisplay 
                          question={item.question} 
                          examState="reading"
                        />
                        
                        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                          <Mic color="secondary" sx={{ mr: 1 }} />
                          <Typography variant="subtitle1">
                            Student's Response:
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mt: 1 }}>
                          <audio 
                            controls 
                            style={{ width: '100%' }}
                            src={item.response.audioUrl}
                          />
                        </Box>
                      </Paper>
                    </Box>
                  ))}
                  
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Evaluation for Part {part}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Score (out of 25):
                      </Typography>
                      <TextField
                        type="number"
                        value={feedback.find(f => f.part === part)?.score || 0}
                        onChange={(e) => handleFeedbackChange(part, 'score', Math.min(25, Math.max(0, parseInt(e.target.value) || 0)))}
                        inputProps={{ min: 0, max: 25 }}
                        fullWidth
                      />
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Feedback:
                      </Typography>
                      <TextField
                        multiline
                        rows={4}
                        value={feedback.find(f => f.part === part)?.feedback || ''}
                        onChange={(e) => handleFeedbackChange(part, 'feedback', e.target.value)}
                        fullWidth
                      />
                    </Box>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
          
          <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Total Score: {totalScore} / 75
            </Typography>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              Please make sure you have evaluated all parts before submitting.
            </Alert>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Save />}
                onClick={handleSubmitEvaluation}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Evaluation'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminExamEvaluate;