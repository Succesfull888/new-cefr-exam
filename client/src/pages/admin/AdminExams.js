import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Chip, Tabs, Tab, CircularProgress } from '@mui/material';
import { Edit, Delete, Visibility, Add, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useSnackbar } from 'notistack';
import AlertDialog from '../../components/ui/AlertDialog';

const AdminExams = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [examTemplates, setExamTemplates] = useState([]);
  const [studentExams, setStudentExams] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examType, setExamType] = useState('');
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch exam templates
        const templatesRes = await api.get('/api/exams/templates');
        const templatesData = Array.isArray(templatesRes.data) ? templatesRes.data : [];
        setExamTemplates(templatesData);
        
        // Fetch submitted exams
        const examsRes = await api.get('/api/admin/exams');
        const examsData = Array.isArray(examsRes.data) ? examsRes.data : [];
        setStudentExams(examsData);
        
        setLoading(false);
      } catch (err) {
        console.error('Fetch exams error:', err);
        setError('Failed to load exams');
        enqueueSnackbar('Failed to load exams', { variant: 'error' });
        setLoading(false);
      }
    };
    
    fetchData();
  }, [enqueueSnackbar]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleDeleteTemplate = (template) => {
    setSelectedExam(template);
    setExamType('template');
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteExam = (exam) => {
    setSelectedExam(exam);
    setExamType('exam');
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    try {
      if (!selectedExam || !selectedExam._id) {
        setDeleteDialogOpen(false);
        return;
      }
      
      if (examType === 'template') {
        await api.delete(`/api/exams/templates/${selectedExam._id}`);
        setExamTemplates(prevTemplates => 
          prevTemplates.filter(t => t._id !== selectedExam._id)
        );
        enqueueSnackbar('Exam template deleted successfully', { variant: 'success' });
      } else {
        await api.delete(`/api/admin/exams/${selectedExam._id}`);
        setStudentExams(prevExams => 
          prevExams.filter(e => e._id !== selectedExam._id)
        );
        enqueueSnackbar('Exam submission deleted successfully', { variant: 'success' });
      }
      
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error('Delete error:', err);
      enqueueSnackbar('Failed to delete', { variant: 'error' });
    }
  };
  
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
            Try Again
          </Button>
        </Box>
      </Container>
    );
  }
  
  const renderTemplateRow = (template) => {
    if (!template || !template._id) return null;
    
    return (
      <TableRow key={template._id}>
        <TableCell>{template.title || 'Untitled Template'}</TableCell>
        <TableCell>{Array.isArray(template.questions) ? template.questions.length : 0}</TableCell>
        <TableCell>
          {template.createdAt ? new Date(template.createdAt).toLocaleDateString() : 'Unknown date'}
        </TableCell>
        <TableCell align="right">
          <IconButton
            color="primary"
            onClick={() => navigate(`/admin/exams/edit/${template._id}`)}
            size="small"
          >
            <Edit />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleDeleteTemplate(template)}
            size="small"
          >
            <Delete />
          </IconButton>
        </TableCell>
      </TableRow>
    );
  };
  
  const renderExamRow = (exam) => {
    if (!exam || !exam._id) return null;
    
    // Safe accessing of nested properties
    const examTitle = exam.examTemplate?.title || 'Untitled Exam';
    const studentName = exam.student ? 
      `${exam.student.firstName || ''} ${exam.student.lastName || ''}` : 
      'Unknown Student';
    const submittedDate = exam.submittedAt ? 
      new Date(exam.submittedAt).toLocaleDateString() : 
      'Unknown date';
    const status = exam.status || 'submitted';
    const totalScore = exam.totalScore !== undefined ? exam.totalScore : 0;
    
    return (
      <TableRow key={exam._id}>
        <TableCell>{examTitle}</TableCell>
        <TableCell>{studentName}</TableCell>
        <TableCell>{submittedDate}</TableCell>
        <TableCell>
          <Chip 
            label={status === 'evaluated' ? 'Evaluated' : 'Submitted'} 
            color={status === 'evaluated' ? 'success' : 'warning'}
            size="small"
          />
        </TableCell>
        <TableCell>
          {status === 'evaluated' ? `${totalScore} / 75` : 'Pending'}
        </TableCell>
        <TableCell align="right">
          <IconButton
            color="primary"
            onClick={() => navigate(`/admin/exams/evaluate/${exam._id}`)}
            size="small"
          >
            <Visibility />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleDeleteExam(exam)}
            size="small"
          >
            <Delete />
          </IconButton>
        </TableCell>
      </TableRow>
    );
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Manage Exams
          </Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/admin/dashboard')}
              sx={{ mr: 2 }}
            >
              Back to Dashboard
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => navigate('/admin/exams/edit/new')}
            >
              Create New Exam
            </Button>
          </Box>
        </Box>
        
        <Paper elevation={3} sx={{ mb: 4 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Exam Templates" />
            <Tab label="Student Submissions" />
          </Tabs>
          
          <Box sx={{ p: 3 }}>
            {tabValue === 0 ? (
              // Exam Templates Tab
              <>
                {!Array.isArray(examTemplates) || examTemplates.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      No exam templates found.
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<Add />}
                      onClick={() => navigate('/admin/exams/edit/new')}
                      sx={{ mt: 2 }}
                    >
                      Create New Exam
                    </Button>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Title</TableCell>
                          <TableCell>Questions</TableCell>
                          <TableCell>Created Date</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {examTemplates.map(template => renderTemplateRow(template))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </>
            ) : (
              // Student Submissions Tab
              <>
                {!Array.isArray(studentExams) || studentExams.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      No exam submissions found.
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Exam</TableCell>
                          <TableCell>Student</TableCell>
                          <TableCell>Submitted Date</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Score</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {studentExams.map(exam => renderExamRow(exam))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </>
            )}
          </Box>
        </Paper>
      </Box>
      
      <AlertDialog
        open={deleteDialogOpen}
        title={`Delete ${examType === 'template' ? 'Exam Template' : 'Exam Submission'}`}
        content={`Are you sure you want to delete this ${examType === 'template' ? 'exam template' : 'exam submission'}? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Container>
  );
};

export default AdminExams;
