import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, CircularProgress, Alert } from '@mui/material';
import { Edit, Delete, ArrowBack, Person, Key } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useSnackbar } from 'notistack';

const AdminUsers = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    username: ''
  });
  const [newPassword, setNewPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/api/admin/users');
        setUsers(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Fetch users error:', err);
        enqueueSnackbar('Failed to load users', { variant: 'error' });
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [enqueueSnackbar]);
  
  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username
    });
    setFormErrors({});
    setEditDialogOpen(true);
  };
  
  const handleResetPasswordClick = (user) => {
    setSelectedUser(user);
    setNewPassword('');
    setFormErrors({});
    setResetPasswordDialogOpen(true);
  };
  
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };
  
  const handleEditChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
    
    // Clear errors
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: null
      });
    }
  };
  
  const validateEditForm = () => {
    const errors = {};
    
    if (!editFormData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!editFormData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!editFormData.username.trim()) {
      errors.username = 'Username is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const validatePasswordForm = () => {
    const errors = {};
    
    if (!newPassword) {
      errors.password = 'Password is required';
    } else if (newPassword.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleEditSubmit = async () => {
    if (!validateEditForm()) return;
    
    setSubmitLoading(true);
    
    try {
      const res = await api.put(`/api/admin/users/${selectedUser._id}`, editFormData);
      
      // Update users list
      setUsers(users.map(user => 
        user._id === selectedUser._id 
          ? { ...user, ...editFormData } 
          : user
      ));
      
      enqueueSnackbar('User updated successfully', { variant: 'success' });
      setEditDialogOpen(false);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update user';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setSubmitLoading(false);
    }
  };
  
  const handleResetPasswordSubmit = async () => {
    if (!validatePasswordForm()) return;
    
    setSubmitLoading(true);
    
    try {
      await api.put(`/api/admin/users/${selectedUser._id}/reset-password`, {
        password: newPassword
      });
      
      enqueueSnackbar('Password reset successfully', { variant: 'success' });
      setResetPasswordDialogOpen(false);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to reset password';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setSubmitLoading(false);
    }
  };
  
  const handleDeleteSubmit = async () => {
    setSubmitLoading(true);
    
    try {
      await api.delete(`/api/admin/users/${selectedUser._id}`);
      
      // Update users list
      setUsers(users.filter(user => user._id !== selectedUser._id));
      
      enqueueSnackbar('User deleted successfully', { variant: 'success' });
      setDeleteDialogOpen(false);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete user';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setSubmitLoading(false);
    }
  };
  
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
            Manage Users
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/admin/dashboard')}
          >
            Back to Dashboard
          </Button>
        </Box>
        
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          {users.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom>
                No users found.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Username</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Exams Taken</TableCell>
                    <TableCell>Average Score</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>{user.firstName} {user.lastName}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.role === 'admin' ? 'Admin' : 'Student'} 
                          color={user.role === 'admin' ? 'secondary' : 'primary'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{user.exams?.length || 0}</TableCell>
                      <TableCell>
                        {user.averageScore ? `${user.averageScore.toFixed(1)} / 75` : 'N/A'}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          onClick={() => handleEditClick(user)}
                          size="small"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          color="primary"
                          onClick={() => handleResetPasswordClick(user)}
                          size="small"
                        >
                          <Key />
                        </IconButton>
                        {user.role !== 'admin' && (
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(user)}
                            size="small"
                          >
                            <Delete />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
      
      {/* Edit User Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Person sx={{ mr: 1 }} />
            Edit User
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={editFormData.firstName}
                  onChange={handleEditChange}
                  error={!!formErrors.firstName}
                  helperText={formErrors.firstName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={editFormData.lastName}
                  onChange={handleEditChange}
                  error={!!formErrors.lastName}
                  helperText={formErrors.lastName}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={editFormData.username}
                  onChange={handleEditChange}
                  error={!!formErrors.username}
                  helperText={formErrors.username}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleEditSubmit} 
            color="primary"
            disabled={submitLoading}
          >
            {submitLoading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Reset Password Dialog */}
      <Dialog 
        open={resetPasswordDialogOpen} 
        onClose={() => setResetPasswordDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Key sx={{ mr: 1 }} />
            Reset Password
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              You are resetting password for: <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong>
            </Alert>
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (formErrors.password) {
                  setFormErrors({ ...formErrors, password: null });
                }
              }}
              error={!!formErrors.password}
              helperText={formErrors.password}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetPasswordDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleResetPasswordSubmit} 
            color="primary"
            disabled={submitLoading}
          >
            {submitLoading ? <CircularProgress size={24} /> : 'Reset Password'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete User Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete user <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong>?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            This action cannot be undone. All exams associated with this user will also be deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteSubmit} 
            color="error"
            disabled={submitLoading}
          >
            {submitLoading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminUsers;