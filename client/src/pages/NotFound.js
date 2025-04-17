import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const AdminNotFound = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        textAlign: 'center',
        padding: 3
      }}
    >
      <Typography variant="h2" color="primary" gutterBottom>
        404
      </Typography>
      <Typography variant="h4" gutterBottom>
        Sahifa topilmadi
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
        Siz qidirayotgan admin sahifasi mavjud emas yoki ko'chirish mumkin emas.
      </Typography>
      <Button
        component={Link}
        to="/admin/dashboard"
        variant="contained"
        color="primary"
        size="large"
      >
        Admin paneliga qaytish
      </Button>
    </Box>
  );
};

export default AdminNotFound;