import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Button, Paper, Grid, TextField, Rating, Divider, Accordion, AccordionSummary, AccordionDetails, CircularProgress, Alert, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
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
  const [error, setError] = useState(null);
  
  // Fetch exam details
  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching exam with ID:', id);
        const res = await api.get(`/api/exams/${id}`);
        console.log('Exam data:', res.data);
        
        if (!res.data) {
          throw new Error('Exam data is empty');
        }
        
        setExam(res.data);
        
        // If exam is already evaluated, load the feedback
        if (res.data.status === 'evaluated') {
          if (Array.isArray(res.data.feedback) && res.data.feedback.length > 0) {
            setFeedback(res.data.feedback);
          }
          setTotalScore(res.data.totalScore || 0);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching exam:', err);
        setError('Failed to load exam');
        enqueueSnackbar('Failed to load exam: ' + (err.response?.data?.message || err.message), { variant: 'error' });
        setLoading(false);
      }
    };
    
    if (id) {
      fetchExam();
    }
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
      
      // Validate scores before submitting
      for (const item of feedback) {
        if (item.score < 0 || item.score > 25) {
          enqueueSnackbar(`Part ${item.part} score must be between 0 and 25`, { variant: 'error' });
          setSubmitting(false);
          return;
        }
      }
      
      await api.put(`/api/exams/${id}/evaluate`, {
        feedback,
        totalScore
      });
      
      enqueueSnackbar('Evaluation submitted successfully!', { variant: 'success' });
      navigate('/admin/exams');
    } catch (err) {
      console.error('Error submitting evaluation:', err);
      enqueueSnackbar('Failed to submit evaluation: ' + (err.response?.data?.message || err.message), { variant: 'error' });
      setSubmitting(false);
    }
  };
  
  // Get responses for a part - answersdan oladi, agar u mavjud bo'lmasa responsesdan
  const getPartResponses = (part) => {
    if (!exam) return [];
    
    // 1. Yangi answers formatidan olish (afzalroq)
    if (exam.answers && exam.answers.length > 0) {
      return exam.answers
        .filter(answer => answer.questionData && answer.questionData.part === part)
        .map(answer => ({
          question: answer.questionData,
          response: { audioUrl: answer.audioUrl, _id: answer._id }
        }));
    }
    
    // 2. Eski responses formatidan olish
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
  
  // Savol va uning ma'lumotlarini ko'rsatadigan komponent
  const renderQuestion = (question, responseAudioUrl) => {
    // Part 3 uchun - jadval
    if (question.part === 3 && question.tableData) {
      return (
        <Box>
          <Typography variant="body1" gutterBottom>
            {question.question}
          </Typography>
          
          <TableContainer component={Paper} sx={{ my: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell 
                    colSpan={question.tableData.columns?.length || 2} 
                    align="center"
                  >
                    <Typography fontWeight="bold">
                      {question.tableData.topic || "Discussion Topic"}
                    </Typography>
                  </TableCell>
                </TableRow>
                {Array.isArray(question.tableData.columns) && (
                  <TableRow>
                    {question.tableData.columns.map((col, idx) => (
                      <TableCell key={`col-${idx}`} align="center">
                        <Typography fontWeight="bold">{col || `Column ${idx+1}`}</Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                )}
              </TableHead>
              <TableBody>
                {Array.isArray(question.tableData.rows) && 
                 question.tableData.rows.map((row, rowIdx) => (
                  <TableRow key={`row-${rowIdx}`}>
                    {Array.isArray(row) && row.map((cell, cellIdx) => (
                      <TableCell key={`cell-${rowIdx}-${cellIdx}`}>
                        {cell || `Cell ${rowIdx}-${cellIdx}`}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
            <Mic color="secondary" sx={{ mr: 1 }} />
            <Typography variant="subtitle1">
              Student's Response:
            </Typography>
          </Box>
          
          <Box sx={{ mt: 1 }}>
            {responseAudioUrl ? (
              <audio 
                controls 
                style={{ width: '100%' }}
                src={responseAudioUrl}
              />
            ) : (
              <Alert severity="error">Audio not available</Alert>
            )}
          </Box>
        </Box>
      );
    }
    
    // Rasmli savol uchun
    if (question.questionType === 'image' && question.imageUrl) {
      return (
        <Box>
          <Typography variant="body1" gutterBottom>
            {question.question}
          </Typography>
          
          <Box sx={{ my: 2, textAlign: 'center' }}>
            <img 
              src={question.imageUrl} 
              alt="Question" 
              style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '4px' }} 
            />
          </Box>
          
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
            <Mic color="secondary" sx={{ mr: 1 }} />
            <Typography variant="subtitle1">
              Student's Response:
            </Typography>
          </Box>
          
          <Box sx={{ mt: 1 }}>
            {responseAudioUrl ? (
              <audio 
                controls 
                style={{ width: '100%' }}
                src={responseAudioUrl}
              />
            ) : (
              <Alert severity="error">Audio not available</Alert>
            )}
          </Box>
        </Box>
      );
    }
    
    // Oddiy matnli savol uchun
    return (
      <Box>
        <Typography variant="body1" gutterBottom>
          {question.question}
        </Typography>
        
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
          <Mic color="secondary" sx={{ mr: 1 }} />
          <Typography variant="subtitle1">
            Student's Response:
          </Typography>
        </Box>
        
        <Box sx={{ mt: 1 }}>
          {responseAudioUrl ? (
            <audio 
              controls 
              style={{ width: '100%' }}
              src={responseAudioUrl}
            />
          ) : (
            <Alert severity="error">Audio not available</Alert>
          )}
        </Box>
      </Box>
    );
  };
  
  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <CircularProgress />
    </Box>;
  }
  
  if (error || !exam) {
    return (
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 3, my: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || "Failed to load exam"}
          </Alert>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/admin/exams')}
          >
            Back to Exams
          </Button>
        </Paper>
      </Container>
    );
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
          
          {[1, 2, 3].map(part => {
            const partResponses = getPartResponses(part);
            
            return (
              <Accordion key={part} defaultExpanded={part === 1}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">
                    Part {part} {partResponses.length === 0 && "(No responses)"}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    {partResponses.length === 0 ? (
                      <Alert severity="warning" sx={{ mb: 3 }}>
                        No responses found for Part {part}
                      </Alert>
                    ) : (
                      partResponses.map((item, index) => (
                        <Box key={index} sx={{ mb: 3 }}>
                          <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                              Question {index + 1}:
                            </Typography>
                            
                            {/* Bu joyda savolni va javobni ko'rsatadigan komponentni chaqiramiz */}
                            {renderQuestion(item.question, item.response.audioUrl)}
                          </Paper>
                        </Box>
                      ))
                    )}
                    
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
            );
          })}
          
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
                startIcon={submitting ? <CircularProgress size={24} /> : <Save />}
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
