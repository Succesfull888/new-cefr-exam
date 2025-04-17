import React from 'react';
import { Box, Container, Typography, Link, Divider, Grid, IconButton } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Facebook, Twitter, Instagram, LinkedIn } from '@mui/icons-material';

const Footer = () => {
  return (
    <Box component="footer" sx={{ bgcolor: 'background.paper', py: 6, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
        </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              CEFR Speaking Exam
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Comprehensive speaking practice platform aligned with CEFR standards to help you improve your language skills and prepare for exams.
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Quick Links
            </Typography>
            <Link component={RouterLink} to="/" color="inherit" display="block" sx={{ mb: 1 }}>
              Home
            </Link>
            <Link component={RouterLink} to="/login" color="inherit" display="block" sx={{ mb: 1 }}>
              Login
            </Link>
            <Link component={RouterLink} to="/register" color="inherit" display="block" sx={{ mb: 1 }}>
              Register
            </Link>
          </Grid>
          <Grid item xs={12} sm={4}>
  <Typography variant="h6" color="text.primary" gutterBottom>
    Contact Us
  </Typography>
  <Typography variant="body2" color="text.secondary" paragraph>
    Email: rocketenglish12@gmail.com
  </Typography>
  <Typography variant="body2" color="text.secondary" paragraph>
    Phone: +998 (93) 650-48-88
  </Typography>
  <Box>
    <IconButton 
      color="primary" 
      aria-label="telegram"
      href="https://t.me/your_telegram_username" 
      target="_blank"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1.218 19.175c-.375.069-.752-.111-.988-.45-.157-.223-2.377-1.739-2.558-1.885-.182-.146-.676-.055-.676-.055l-1.784-.003c-.437 0-.598-.45-.15-.953.45-.504 5.10-4.694 6.901-6.18 1.801-1.485 3.875-1.35 3.875-1.35l1.945-.009c.292 0 1.434.522 1.434 1.845 0 .492-.147 1.173-.293 1.845-.146.672-1.968 5.394-1.968 5.394s-.293.503-.768.593c-.475.09-1.218.09-1.377-.09-.159-.18-.305-.632-.305-.632l-1.58-3.523s-.073-.262-.219-.383c-.146-.121-.378-.254-.378-.254l2.441 6.095s.145.18.073.307z" />
      </svg>
    </IconButton>
    <IconButton 
      color="primary" 
      aria-label="instagram"
      href="https://instagram.com/your_instagram_handle" 
      target="_blank"
    >
      <Instagram />
    </IconButton>
    <IconButton 
      color="primary" 
      aria-label="youtube"
      href="https://youtube.com/c/your_youtube_channel" 
      target="_blank"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
      </svg>
    </IconButton>
    <IconButton 
      color="primary" 
      aria-label="linkedin"
      href="https://linkedin.com/in/your_linkedin_profile" 
      target="_blank"
    >
      <LinkedIn />
    </IconButton>
  </Box>
</Grid>
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} CEFR Speaking Exam Platform. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;