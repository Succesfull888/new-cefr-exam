import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Paper, Grid, Card, CardContent, Stack, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, CircularProgress } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Assignment, Person, CheckCircle, HourglassEmpty, TrendingUp, School } from '@mui/icons-material';
import api from '../../utils/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    exams: 0,
    pendingEvaluations: 0,
    completedEvaluations: 0
  });
  const [recentExams, setRecentExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch statistics
        const usersRes = await api.get('/api/admin/users');
        const examsRes = await api.get('/api/admin/exams');
        
        const usersData = Array.isArray(usersRes.data) ? usersRes.data : [];
        const examsData = Array.isArray(examsRes.data) ? examsRes.data : [];
        
        setStats({
          users: usersData.length,
          exams: examsData.length,
          pendingEvaluations: examsData.filter(exam => exam?.status === 'submitted').length,
          completedEvaluations: examsData.filter(exam => exam?.status === 'evaluated').length
        });
        
        // Fetch recent exams
        const sortedExams = [...examsData]
          .sort((a, b) => {
            const dateA = a?.submittedAt ? new Date(a.submittedAt) : new Date(0);
            const dateB = b?.submittedAt ? new Date(b.submittedAt) : new Date(0);
            return dateB - dateA;
          })
          .slice(0, 5);
          
        setRecentExams(sortedExams);
        
        setLoading(false);
      } catch (err) {
        console.error('Admin dashboard data fetch error:', err);
        setError('Failed to load dashboard data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
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
          Admin Dashboard
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Person color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Users</Typography>
                </Box>
                <Typography variant="h3" component="div" sx={{ textAlign: 'center', my: 2 }}>
                  {stats.users}
                </Typography>
                <Box sx={{ textAlign: 'center' }}>
                  <RouterLink to="/admin/users" style={{ textDecoration: 'none' }}>
                    <Typography variant="body2" color="primary">
                      View All Users
                    </Typography>
                  </RouterLink>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Assignment color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Total Exams</Typography>
                </Box>
                <Typography variant="h3" component="div" sx={{ textAlign: 'center', my: 2 }}>
                  {stats.exams}
                </Typography>
                <Box sx={{ textAlign: 'center' }}>
                  <RouterLink to="/admin/exams" style={{ textDecoration: 'none' }}>
                    <Typography variant="body2" color="primary">
                      View All Exams
                    </Typography>
                  </RouterLink>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <HourglassEmpty color="warning" sx={{ mr: 1 }} />
                  <Typography variant="h6">Pending</Typography>
                </Box>
                <Typography variant="h3" component="div" sx={{ textAlign: 'center', my: 2 }}>
                  {stats.pendingEvaluations}
                </Typography>
                <Box sx={{ textAlign: 'center' }}>
                  <RouterLink to="/admin/exams" style={{ textDecoration: 'none' }}>
                    <Typography variant="body2" color="primary">
                      View Pending Exams
                    </Typography>
                  </RouterLink>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckCircle color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">Evaluated</Typography>
                </Box>
                <Typography variant="h3" component="div" sx={{ textAlign: 'center', my: 2 }}>
                  {stats.completedEvaluations}
                </Typography>
                <Box sx={{ textAlign: 'center' }}>
                  <RouterLink to="/admin/exams" style={{ textDecoration: 'none' }}>
                    <Typography variant="body2" color="primary">
                      View Evaluated Exams
                    </Typography>
                  </RouterLink>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <Assignment color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Recent Exams</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {recentExams.length === 0 ? (
                <Typography variant="body1">No exams submitted yet.</Typography>
              ) : (
                <List>
                  {recentExams.map(exam => (
                    <ListItem disablePadding key={exam?._id || `exam-${Math.random()}`}>
                      <ListItemButton component={RouterLink} to={`/admin/exams/evaluate/${exam?._id}`}>
                        <ListItemIcon>
                          {exam?.status === 'evaluated' ? <CheckCircle color="success" /> : <HourglassEmpty color="warning" />}
                        </ListItemIcon>
                        <ListItemText 
                          primary={exam?.examTemplate?.title || "Untitled Exam"} 
                          secondary={`${exam?.student?.firstName || 'Student'} ${exam?.student?.lastName || ''} • ${exam?.submittedAt ? new Date(exam.submittedAt).toLocaleDateString() : 'Unknown date'}`} 
                        />
                        {exam?.status === 'evaluated' && (
                          <Typography variant="body2" sx={{ ml: 2 }}>
                            {exam?.totalScore || 0} / 75
                          </Typography>
                        )}
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <TrendingUp color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Quick Links</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={2}>
                <ListItemButton 
                  component={RouterLink} 
                  to="/admin/exams"
                  sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
                >
                  <ListItemIcon>
                    <Assignment color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Manage Exams" />
                </ListItemButton>
                
                <ListItemButton 
                  component={RouterLink} 
                  to="/admin/users"
                  sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
                >
                  <ListItemIcon>
                    <Person color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Manage Users" />
                </ListItemButton>
                
                <ListItemButton 
                  component={RouterLink} 
                  to="/admin/exams/edit/new"
                  sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
                >
                  <ListItemIcon>
                    <School color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Create New Exam" />
                </ListItemButton>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AdminDashboard;
