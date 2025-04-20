import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Paper, Grid, Card, CardContent, Stack, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, CircularProgress, Button } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Assignment, Person, CheckCircle, HourglassEmpty, TrendingUp, School, Refresh, ErrorOutline } from '@mui/icons-material';
import api from '../../utils/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: 0,
    exams: 0,
    pendingEvaluations: 0,
    completedEvaluations: 0
  });
  const [recentExams, setRecentExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let usersData = [];
      let examsData = [];
      
      try {
        // Fetch statistics - wrapping in try-catch blocks to handle each API call separately
        const usersRes = await api.get('/api/admin/users');
        if (usersRes && usersRes.data) {
          usersData = Array.isArray(usersRes.data) ? usersRes.data : [];
        }
      } catch (userErr) {
        console.error('Error fetching users:', userErr);
        // Continue execution even if users API fails
      }
      
      try {
        const examsRes = await api.get('/api/admin/exams');
        if (examsRes && examsRes.data) {
          examsData = Array.isArray(examsRes.data) ? examsRes.data : [];
        }
      } catch (examErr) {
        console.error('Error fetching exams:', examErr);
        // Continue execution even if exams API fails
      }
      
      // Set stats with whatever data we managed to fetch
      setStats({
        users: usersData.length || 0,
        exams: examsData.length || 0,
        pendingEvaluations: examsData.filter(exam => exam && exam.status === 'submitted').length || 0,
        completedEvaluations: examsData.filter(exam => exam && exam.status === 'evaluated').length || 0
      });
      
      // Process recent exams if we have any
      if (examsData.length > 0) {
        // Safely sort and slice exams
        const sortedExams = [...examsData]
          .filter(exam => exam !== null && exam !== undefined) // Remove any null/undefined entries
          .sort((a, b) => {
            try {
              const dateA = a?.submittedAt ? new Date(a.submittedAt) : new Date(0);
              const dateB = b?.submittedAt ? new Date(b.submittedAt) : new Date(0);
              return dateB - dateA;
            } catch (e) {
              return 0; // Default fallback if comparison fails
            }
          })
          .slice(0, 5);
          
        setRecentExams(sortedExams);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Admin dashboard data fetch error:', err);
      setError('Failed to load dashboard data. Please try again.');
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading dashboard data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <ErrorOutline color="error" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" color="error" gutterBottom>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<Refresh />}
            onClick={() => fetchDashboardData()}
            sx={{ mt: 2 }}
          >
            Try Again
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/admin')}
            sx={{ mt: 2, ml: 2 }}
          >
            Go to Admin Home
          </Button>
        </Box>
      </Container>
    );
  }
  
  // Render the dashboard UI
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
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Assignment color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Recent Exams</Typography>
                </Box>
                <Button 
                  size="small" 
                  startIcon={<Refresh />} 
                  onClick={fetchDashboardData}
                >
                  Refresh
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {recentExams.length === 0 ? (
                <Typography variant="body1" sx={{ py: 3, textAlign: 'center' }}>No exams submitted yet.</Typography>
              ) : (
                <List>
                  {recentExams.map((exam, index) => (
                    <ListItem 
                      disablePadding 
                      key={exam?._id || `exam-${index}-${Math.random()}`}
                      divider={index < recentExams.length - 1}
                    >
                      <ListItemButton 
                        component={RouterLink} 
                        to={`/admin/exams/evaluate/${exam?._id || ''}`}
                        disabled={!exam?._id}
                      >
                        <ListItemIcon>
                          {exam?.status === 'evaluated' ? 
                            <CheckCircle color="success" /> : 
                            <HourglassEmpty color="warning" />
                          }
                        </ListItemIcon>
                        <ListItemText 
                          primary={exam?.examTemplate?.title || "Untitled Exam"} 
                          secondary={
                            exam?.student ? 
                              `${exam.student?.firstName || 'Student'} ${exam.student?.lastName || ''} • ${exam?.submittedAt ? new Date(exam.submittedAt).toLocaleDateString() : 'Unknown date'}` :
                              'Unknown student • Unknown date'
                          } 
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
