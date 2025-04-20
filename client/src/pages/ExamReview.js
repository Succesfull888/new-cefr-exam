import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Divider, Alert, Grid, CircularProgress, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import api from '../../utils/api';
import { useSnackbar } from 'notistack';

const ExamReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/api/exams/${id}`);
        console.log("Exam data:", response.data);
        setExam(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching exam:", err);
        setError("Could not load exam details");
        setLoading(false);
        enqueueSnackbar("Failed to load exam details", { variant: 'error' });
      }
    };

    if (id) {
      fetchExam();
    }
  }, [id, enqueueSnackbar]);

  // Answers to'g'ri formatlangan versiyasini olish
  const getFormattedAnswers = () => {
    const formattedAnswers = [];
    
    // 1. answers massividan olish
    if (exam?.answers && exam.answers.length > 0) {
      return exam.answers.map(answer => ({
        questionData: answer.questionData,
        audioUrl: answer.audioUrl,
        score: answer.score,
        feedback: answer.feedback
      }));
    }
    
    // 2. Eski responses va examTemplate dan yaratish
    if (exam?.responses && exam?.examTemplate?.questions) {
      return exam.responses.map(response => {
        const questionData = exam.examTemplate.questions.find(
          q => q._id.toString() === response.questionId.toString()
        );
        
        return {
          questionData: questionData || { question: 'Question not found', part: 0 },
          audioUrl: response.audioUrl,
          score: 0,
          feedback: ''
        };
      });
    }
    
    return [];
  };

  // Part 1 savollarini ko'rsatish
  const renderPart1 = () => {
    const answers = getFormattedAnswers();
    const part1Answers = answers.filter(a => a.questionData?.part === 1);
    
    if (part1Answers.length === 0) {
      return (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Part 1 ma'lumotlari topilmadi
        </Alert>
      );
    }
    
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Part 1: General Questions
        </Typography>
        
        <Grid container spacing={3}>
          {part1Answers.map((answer, index) => (
            <Grid item xs={12} md={6} key={`part1-${index}`}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Question {index + 1}
                  </Typography>
                  
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {answer.questionData?.question || "Question not available"}
                  </Typography>
                  
                  {answer.questionData?.questionType === 'image' && answer.questionData?.imageUrl && (
                    <Box sx={{ mb: 2, textAlign: 'center' }}>
                      <img 
                        src={answer.questionData.imageUrl} 
                        alt="Question" 
                        style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }} 
                      />
                    </Box>
                  )}
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Your Answer:
                    </Typography>
                    {answer.audioUrl ? (
                      <audio controls src={answer.audioUrl} style={{ width: '100%' }} />
                    ) : (
                      <Alert severity="error">Audio recording not available</Alert>
                    )}
                  </Box>
                  
                  {exam?.status === 'evaluated' && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: '4px' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Score: {answer.score || 0} / 25
                      </Typography>
                      {answer.feedback && (
                        <Typography variant="body2">
                          <strong>Feedback:</strong> {answer.feedback}
                        </Typography>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };
  
  // Part 2 savollarini ko'rsatish
  const renderPart2 = () => {
    const answers = getFormattedAnswers();
    const part2Answers = answers.filter(a => a.questionData?.part === 2);
    
    if (part2Answers.length === 0) {
      return (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Part 2 ma'lumotlari topilmadi
        </Alert>
      );
    }
    
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Part 2: Image Description
        </Typography>
        
        {part2Answers.map((answer, index) => (
          <Card key={`part2-${index}`} variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="body1" gutterBottom>
                {answer.questionData?.question || "Question not available"}
              </Typography>
              
              {answer.questionData?.imageUrl ? (
                <Box sx={{ my: 2, textAlign: 'center' }}>
                  <img 
                    src={answer.questionData.imageUrl} 
                    alt="Part 2" 
                    style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '4px' }} 
                  />
                </Box>
              ) : (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Image not available
                </Alert>
              )}
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Your Answer:
                </Typography>
                {answer.audioUrl ? (
                  <audio controls src={answer.audioUrl} style={{ width: '100%' }} />
                ) : (
                  <Alert severity="error">Audio recording not available</Alert>
                )}
              </Box>
              
              {exam?.status === 'evaluated' && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: '4px' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Score: {answer.score || 0} / 25
                  </Typography>
                  {answer.feedback && (
                    <Typography variant="body2">
                      <strong>Feedback:</strong> {answer.feedback}
                    </Typography>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  };

  // Part 3 savollarini ko'rsatish
  const renderPart3 = () => {
    const answers = getFormattedAnswers();
    const part3Answers = answers.filter(a => a.questionData?.part === 3);
    
    if (part3Answers.length === 0) {
      return (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Part 3 ma'lumotlari topilmadi
        </Alert>
      );
    }
    
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Part 3: Table Discussion
        </Typography>
        
        {part3Answers.map((answer, index) => (
          <Card key={`part3-${index}`} variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="body1" gutterBottom>
                {answer.questionData?.question || "Question not available"}
              </Typography>
              
              {answer.questionData?.tableData ? (
                <TableContainer component={Paper} sx={{ my: 3 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell 
                          colSpan={answer.questionData.tableData.columns?.length || 2} 
                          align="center"
                        >
                          <Typography fontWeight="bold">
                            {answer.questionData.tableData.topic || "Discussion Topic"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      {Array.isArray(answer.questionData.tableData.columns) && (
                        <TableRow>
                          {answer.questionData.tableData.columns.map((col, idx) => (
                            <TableCell key={`col-${idx}`} align="center">
                              <Typography fontWeight="bold">{col || `Column ${idx+1}`}</Typography>
                            </TableCell>
                          ))}
                        </TableRow>
                      )}
                    </TableHead>
                    <TableBody>
                      {Array.isArray(answer.questionData.tableData.rows) && 
                       answer.questionData.tableData.rows.map((row, rowIdx) => (
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
              ) : (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Table data missing
                </Alert>
              )}
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Your Answer:
                </Typography>
                {answer.audioUrl ? (
                  <audio controls src={answer.audioUrl} style={{ width: '100%' }} />
                ) : (
                  <Alert severity="error">Audio recording not available</Alert>
                )}
              </Box>
              
              {exam?.status === 'evaluated' && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: '4px' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Score: {answer.score || 0} / 25
                  </Typography>
                  {answer.feedback && (
                    <Typography variant="body2">
                      <strong>Feedback:</strong> {answer.feedback}
                    </Typography>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error || !exam) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || "Failed to load exam"}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/myexams')} startIcon={<ArrowBack />}>
          Back to My Exams
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          {exam.examTemplate?.title || "Exam Review"}
        </Typography>
        
        <Button variant="outlined" onClick={() => navigate('/myexams')} startIcon={<ArrowBack />}>
          Back to My Exams
        </Button>
      </Box>
      
      {exam.status === 'evaluated' && (
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Evaluation Results
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Total Score:</strong> {exam.totalScore} / 75
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Submitted:</strong> {new Date(exam.submittedAt).toLocaleString()}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Evaluated:</strong> {exam.evaluatedAt ? new Date(exam.evaluatedAt).toLocaleString() : 'Not yet evaluated'}
            </Typography>
            {exam.feedback && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Overall Feedback:
                </Typography>
                <Typography variant="body2" sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: '4px' }}>
                  {exam.feedback}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Part 1 */}
      {renderPart1()}
      
      {/* Part 2 */}
      <Divider sx={{ my: 3 }} />
      {renderPart2()}
      
      {/* Part 3 */}
      <Divider sx={{ my: 3 }} />
      {renderPart3()}
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/myexams')}
          startIcon={<ArrowBack />}
        >
          Back to My Exams
        </Button>
      </Box>
    </Box>
  );
};

export default ExamReview;
