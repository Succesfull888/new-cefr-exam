import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Chip, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Visibility, ArrowBack } from '@mui/icons-material';
import api from '../utils/api';

const MyExams = () => {
  const navigate = useNavigate();
  
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await api.get('/api/exams/my-exams');
        const examsData = Array.isArray(res.data) ? res.data : [];
        
        // Exams ma'lumotlarni oxirgi yuborilgan vaqt bo'yicha saralash
        const sortedExams = [...examsData].sort((a, b) => {
          const dateA = a?.submittedAt ? new Date(a.submittedAt) : new Date(0);
          const dateB = b?.submittedAt ? new Date(b.submittedAt) : new Date(0);
          return dateB - dateA;
        });
        
        setExams(sortedExams);
        setLoading(false);
      } catch (err) {
        console.error('Fetch exams error:', err);
        setError('Failed to load your exams. Please try again.');
        setLoading(false);
      }
    };
    
    fetchExams();
  }, []);
  
  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <CircularProgress />
    </Box>;
  }
  
  if (error) {
    return (
      <Container maxWidth="md">
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Retry
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
            My Exams
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </Box>
        
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          {exams.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom>
                You haven't taken any exams yet.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/dashboard')}
                sx={{ mt: 2 }}
              >
                Go to Dashboard
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Exam</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Score</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {exams.map((exam) => (
                    <TableRow key={exam?._id || `exam-${Math.random()}`}>
                      <TableCell>{exam?.examTemplate?.title || "Untitled Exam"}</TableCell>
                      <TableCell>{exam?.submittedAt ? new Date(exam.submittedAt).toLocaleDateString() : "Unknown date"}</TableCell>
                      <TableCell>
                        <Chip 
                          label={exam?.status === 'evaluated' ? 'Evaluated' : 'Submitted'} 
                          color={exam?.status === 'evaluated' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {exam?.status === 'evaluated' ? `${exam?.totalScore || 0} / 75` : 'Pending'}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          onClick={() => navigate(`/exam-result/${exam?._id}`)}
                        >
                          <Visibility />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default MyExams;
