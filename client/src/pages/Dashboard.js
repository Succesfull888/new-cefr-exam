import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Button, Paper, Grid, Card, CardContent, CardActions, Divider, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { School, Assignment, Timeline, Person } from '@mui/icons-material';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ExamCard from '../components/exam/ExamCard';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [examTemplates, setExamTemplates] = useState([]);
  const [recentExams, setRecentExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch exam templates
        const templatesRes = await api.get('/api/exams/templates');
        const templatesData = Array.isArray(templatesRes.data) ? templatesRes.data : [];
        setExamTemplates(templatesData);
        console.log('Templates loaded:', templatesData.length);
        
        // Fetch recent exams
        const examsRes = await api.get('/api/exams/my-exams');
        const examsData = Array.isArray(examsRes.data) ? examsRes.data : [];
        setRecentExams(examsData.slice(0, 3)); // Show only 3 most recent exams
        console.log('Recent exams loaded:', examsData.length);
        
        setLoading(false);
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        if (err.response) {
          console.log('Error response:', err.response.data);
          console.log('Error status:', err.response.status);
        }
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
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
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
              Welcome back, {user?.firstName || 'Student'}!
            </Typography>
            <Typography variant="body1">
              Continue practicing your speaking skills with our CEFR-aligned speaking exams.
            </Typography>
          </Paper>
        </Box>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <Assignment color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Available Exams</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {examTemplates.length === 0 ? (
                <Typography variant="body1">No exams available at the moment.</Typography>
              ) : (
                <Grid container spacing={2}>
                  {examTemplates.map(template => (
                    <Grid item xs={12} sm={6} key={template?._id || `template-${Math.random()}`}>
                      <ExamCard
                        title={template?.title || "Untitled Exam"}
                        description={template?.description || "Practice your speaking skills with this exam."}
                        questionCount={template?.questions?.length || 0}
                        level={template?.level || null}
                        duration={template?.duration || "20-30"}
                        onStart={() => navigate(`/take-exam/${template?._id}`)}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
            
            <Paper elevation={2} sx={{ p: 2 }}>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <Timeline color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Your Recent Exams</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {recentExams.length === 0 ? (
                <Typography variant="body1">You haven't taken any exams yet.</Typography>
              ) : (
                <Grid container spacing={2}>
                  {recentExams.map(exam => (
                    <Grid item xs={12} key={exam?._id || `exam-${Math.random()}`}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {exam?.examTemplate?.title || "Untitled Exam"}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Submitted: {exam?.submittedAt ? new Date(exam.submittedAt).toLocaleDateString() : 'Unknown date'}
                          </Typography>
                          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                bgcolor: exam?.status === 'evaluated' ? 'success.light' : 'warning.light',
                                color: exam?.status === 'evaluated' ? 'success.contrastText' : 'warning.contrastText',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                display: 'inline-block'
                              }}
                            >
                              {exam?.status === 'evaluated' ? 'Evaluated' : 'Submitted'}
                            </Typography>
                            
                            {exam?.status === 'evaluated' && (
                              <Typography variant="body2" sx={{ ml: 2, fontWeight: 'bold' }}>
                                Score: {exam?.totalScore || 0} / 75
                              </Typography>
                            )}
                          </Box>
                        </CardContent>
                        <CardActions>
                          <Button 
                            size="small" 
                            color="primary"
                            onClick={() => navigate(`/exam-result/${exam?._id}`)}
                          >
                            View Details
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
              
              {recentExams.length > 0 && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Button 
                    variant="outlined" 
                    onClick={() => navigate('/my-exams')}
                  >
                    View All Exams
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <Person color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Your Profile</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" fontWeight="bold">
                  Name: {user?.firstName || ''} {user?.lastName || ''}
                </Typography>
                <Typography variant="body1">
                  Username: {user?.username || 'Not available'}
                </Typography>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <Box>
                <Typography variant="body1" fontWeight="bold" gutterBottom>
                  Statistics:
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      Exams taken:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" fontWeight="bold">
                      {user?.exams?.length || 0}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      Average score:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" fontWeight="bold">
                      {user?.averageScore ? `${user.averageScore.toFixed(1)} / 75` : 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
            
            <Paper elevation={2} sx={{ p: 2 }}>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <School color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Tips for Success</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="body2" paragraph>
                • Practice speaking regularly and record yourself to identify areas for improvement.
              </Typography>
              <Typography variant="body2" paragraph>
                • Focus on fluency, pronunciation, vocabulary, and grammar.
              </Typography>
              <Typography variant="body2" paragraph>
                • Listen to native speakers and try to imitate their rhythm and intonation.
              </Typography>
              <Typography variant="body2">
                • Don't be afraid to make mistakes -- they're part of the learning process!
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;
