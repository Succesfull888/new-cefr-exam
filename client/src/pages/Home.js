import React from 'react';
import { Container, Box, Typography, Button, Paper, Grid, Card, CardContent, CardMedia, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Assignment, School, ContactSupport, ArrowForward } from '@mui/icons-material';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  return (
    <Box>
      {/* Hero Section */}
      <Box 
        sx={{ 
          py: 8, 
          bgcolor: 'primary.main', 
          color: 'primary.contrastText',
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
            CEFR Speaking Exam Platform
          </Typography>
          <Typography variant="h6" paragraph>
            Improve your speaking skills with our comprehensive CEFR-aligned speaking exam practice platform
          </Typography>
          {isAuthenticated ? (
            <Button 
              variant="contained" 
              color="secondary" 
              size="large"
              onClick={() => navigate('/dashboard')}
              sx={{ mt: 2 }}
            >
              Go to Dashboard
            </Button>
          ) : (
            <Box sx={{ mt: 3 }}>
              <Button 
                variant="contained" 
                color="secondary" 
                size="large"
                onClick={() => navigate('/register')}
                sx={{ mr: 2 }}
              >
                Register
              </Button>
              <Button 
                variant="outlined" 
                color="inherit"
                size="large"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
            </Box>
          )}
        </Container>
      </Box>
      
      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mt: 8, mb: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Key Features
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Everything you need to practice and improve your speaking skills
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <Assignment color="primary" sx={{ fontSize: 60 }} />
                </Box>
                <Typography variant="h5" component="h3" gutterBottom>
                  Realistic Exams
                </Typography>
                <Typography variant="body1" paragraph>
                  Practice with exams that follow the structure and format of real CEFR speaking tests, including all three parts.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <School color="primary" sx={{ fontSize: 60 }} />
                </Box>
                <Typography variant="h5" component="h3" gutterBottom>
                  Expert Feedback
                </Typography>
                <Typography variant="body1" paragraph>
                  Receive detailed feedback and evaluation from experienced language teachers to help you improve.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <ContactSupport color="primary" sx={{ fontSize: 60 }} />
                </Box>
                <Typography variant="h5" component="h3" gutterBottom>
                  Track Progress
                </Typography>
                <Typography variant="body1" paragraph>
                  Monitor your improvement over time with detailed statistics and performance tracking.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
      
      {/* How It Works Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h4" component="h2" gutterBottom>
              How It Works
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Simple and effective process to improve your speaking skills
            </Typography>
          </Box>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Step 1: Create an Account
                </Typography>
                <Typography variant="body1" paragraph>
                  Register with your name and create login credentials to access the platform.
                </Typography>
                
                <Typography variant="h6" gutterBottom color="primary">
                  Step 2: Take a Speaking Exam
                </Typography>
                <Typography variant="body1" paragraph>
                  Choose from available exams and complete all three parts of the speaking test. Your responses will be recorded for evaluation.
                </Typography>
                
                <Typography variant="h6" gutterBottom color="primary">
                  Step 3: Receive Expert Feedback
                </Typography>
                <Typography variant="body1" paragraph>
                  Get detailed feedback and scores from language experts to understand your strengths and areas for improvement.
                </Typography>
                
                <Typography variant="h6" gutterBottom color="primary">
                  Step 4: Practice and Improve
                </Typography>
                <Typography variant="body1" paragraph>
                  Take multiple exams to track your progress and continually enhance your speaking skills.
                </Typography>
                
                <Box sx={{ mt: 3 }}>
                  {isAuthenticated ? (
                    <Button
                      variant="contained"
                      color="primary"
                      endIcon={<ArrowForward />}
                      onClick={() => navigate('/dashboard')}
                    >
                      Go to Dashboard
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      endIcon={<ArrowForward />}
                      onClick={() => navigate('/register')}
                    >
                      Get Started
                    </Button>
                  )}
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <img 
                  src="/images/speaking-exam.svg" 
                  alt="Speaking Exam Illustration" 
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* About Us Section */}
      <Container maxWidth="lg" sx={{ mt: 8, mb: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            About Us
          </Typography>
        </Box>
        
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="body1" paragraph>
            Our CEFR Speaking Exam Platform was created by experienced language teacher Maruf Irgashev to provide students with an effective tool for practicing and improving their speaking skills.
          </Typography>
          
          <Typography variant="body1" paragraph>
            We understand the challenges that language learners face when preparing for speaking exams, especially the lack of opportunities to practice in a structured environment with expert feedback.
          </Typography>
          
          <Typography variant="body1">
            Our mission is to make high-quality speaking practice accessible to all learners, helping them build confidence and achieve their language learning goals.
          </Typography>
        </Paper>
      </Container>
      
      {/* Contact Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" component="h2" gutterBottom>
              Contact Us
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Have questions or need assistance? Get in touch with us.
            </Typography>
          </Box>
          
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} sm={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Email
                  </Typography>
                  <Typography variant="body1">
                    rocketenglish12@gmail.com
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Phone
                  </Typography>
                  <Typography variant="body1">
                    +998 93 650 48 88
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;