import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Chip, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Visibility, ArrowBack } from '@mui/icons-material';
import api from '../utils/api';

const MyExams = () => {
  const navigate = useNavigate();
  
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await api.get('/api/exams/my-exams');
        setExams(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Fetch exams error:', err);
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
                    <TableRow key={exam._id}>
                      <TableCell>{exam.examTemplate.title}</TableCell>
                      <TableCell>{new Date(exam.submittedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip 
                          label={exam.status === 'evaluated' ? 'Evaluated' : 'Submitted'} 
                          color={exam.status === 'evaluated' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {exam.status === 'evaluated' ? `${exam.totalScore} / 75` : 'Pending'}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          onClick={() => navigate(`/exam-result/${exam._id}`)}
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