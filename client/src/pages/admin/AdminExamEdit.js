import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Button, Paper, TextField, IconButton, Card, CardContent, Divider, Grid, MenuItem, Select, FormControl, InputLabel, FormHelperText, CircularProgress, Accordion, AccordionSummary, AccordionDetails, Alert } from '@mui/material';
import { ArrowBack, Save, Add, Delete, ExpandMore, Image, TableChart } from '@mui/icons-material';
import api from '../../utils/api';
import { useSnackbar } from 'notistack';

const AdminExamEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const isNewExam = id === 'new';
  
  const emptyQuestion = {
    question: '',
    questionType: 'text',
    imageUrl: '',
    tableData: {
      topic: '',
      columns: ['', ''],
      rows: [['', '']]
    },
    part: 1
  };
  
  const [examTemplate, setExamTemplate] = useState({
    title: '',
    description: '',
    questions: [
      { ...emptyQuestion, part: 1 },
      { ...emptyQuestion, part: 1 },
      { ...emptyQuestion, part: 1 },
      { ...emptyQuestion, part: 1, questionType: 'image' },
      { ...emptyQuestion, part: 1, questionType: 'image' },
      { ...emptyQuestion, part: 1, questionType: 'image' },
      { ...emptyQuestion, part: 2, questionType: 'image' },
      { ...emptyQuestion, part: 3, questionType: 'table' },
    ]
  });
  
  const [loading, setLoading] = useState(!isNewExam);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [fetchError, setFetchError] = useState(null);
  
  useEffect(() => {
    const fetchExamTemplate = async () => {
      if (isNewExam) return;
      
      try {
        setLoading(true);
        setFetchError(null);
        
        const res = await api.get(`/api/exams/templates/${id}`);
        
        if (res && res.data) {
          // Ensure the questions array exists and has all required fields
          const templateData = res.data;
          
          // Check if questions array exists
          if (!Array.isArray(templateData.questions)) {
            templateData.questions = [];
          }
          
          // Ensure each question has all required fields
          const normalizedQuestions = templateData.questions.map(q => ({
            ...emptyQuestion,
            ...q,
            tableData: {
              ...emptyQuestion.tableData,
              ...(q.tableData || {}),
              columns: Array.isArray(q.tableData?.columns) ? q.tableData.columns : ['', ''],
              rows: Array.isArray(q.tableData?.rows) ? q.tableData.rows : [['', '']]
            }
          }));
          
          setExamTemplate({
            ...templateData,
            questions: normalizedQuestions
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Fetch exam template error:', err);
        setFetchError('Failed to load exam template');
        enqueueSnackbar('Failed to load exam template', { variant: 'error' });
        setLoading(false);
      }
    };
    
    fetchExamTemplate();
  }, [id, isNewExam, navigate, enqueueSnackbar, emptyQuestion]);
  
  const handleTitleDescriptionChange = (e) => {
    if (!e || !e.target) return;
    
    setExamTemplate({
      ...examTemplate,
      [e.target.name]: e.target.value
    });
    
    // Clear errors
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: null
      });
    }
  };
  
  const handleQuestionChange = (index, field, value) => {
    if (index < 0 || index >= examTemplate.questions.length) return;
    
    const updatedQuestions = [...examTemplate.questions];
    
    if (field.includes('.')) {
      // Handle nested fields (for tableData)
      const [parent, child] = field.split('.');
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        [parent]: {
          ...updatedQuestions[index][parent],
          [child]: value
        }
      };
    } else {
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        [field]: value
      };
    }
    
    setExamTemplate({
      ...examTemplate,
      questions: updatedQuestions
    });
    
    // Clear errors
    if (errors[`questions[${index}].${field}`]) {
      setErrors({
        ...errors,
        [`questions[${index}].${field}`]: null
      });
    }
  };
  
  const handleAddTableRow = (questionIndex) => {
    if (questionIndex < 0 || questionIndex >= examTemplate.questions.length) return;
    
    const updatedQuestions = [...examTemplate.questions];
    const question = updatedQuestions[questionIndex];
    
    if (!question.tableData) {
      question.tableData = {
        topic: '',
        columns: ['', ''],
        rows: [['', '']]
      };
    }
    
    if (!Array.isArray(question.tableData.rows)) {
      question.tableData.rows = [['', '']];
    }
    
    question.tableData.rows.push(['', '']);
    
    setExamTemplate({
      ...examTemplate,
      questions: updatedQuestions
    });
  };
  
  const handleRemoveTableRow = (questionIndex, rowIndex) => {
    if (questionIndex < 0 || questionIndex >= examTemplate.questions.length) return;
    
    const updatedQuestions = [...examTemplate.questions];
    const question = updatedQuestions[questionIndex];
    
    if (!question.tableData || !Array.isArray(question.tableData.rows)) {
      return;
    }
    
    if (question.tableData.rows.length > 1) {
      question.tableData.rows.splice(rowIndex, 1);
      
      setExamTemplate({
        ...examTemplate,
        questions: updatedQuestions
      });
    }
  };
  
  const handleTableCellChange = (questionIndex, rowIndex, colIndex, value) => {
    if (questionIndex < 0 || questionIndex >= examTemplate.questions.length) return;
    
    const updatedQuestions = [...examTemplate.questions];
    const question = updatedQuestions[questionIndex];
    
    if (!question.tableData || !Array.isArray(question.tableData.rows) || 
        rowIndex < 0 || rowIndex >= question.tableData.rows.length ||
        !Array.isArray(question.tableData.rows[rowIndex]) ||
        colIndex < 0 || colIndex >= question.tableData.rows[rowIndex].length) {
      return;
    }
    
    question.tableData.rows[rowIndex][colIndex] = value;
    
    setExamTemplate({
      ...examTemplate,
      questions: updatedQuestions
    });
  };
  
  const handleTableColumnChange = (questionIndex, colIndex, value) => {
    if (questionIndex < 0 || questionIndex >= examTemplate.questions.length) return;
    
    const updatedQuestions = [...examTemplate.questions];
    const question = updatedQuestions[questionIndex];
    
    if (!question.tableData || !Array.isArray(question.tableData.columns) ||
        colIndex < 0 || colIndex >= question.tableData.columns.length) {
      return;
    }
    
    question.tableData.columns[colIndex] = value;
    
    setExamTemplate({
      ...examTemplate,
      questions: updatedQuestions
    });
  };
  
  const handleImageUpload = async (questionIndex, e) => {
    if (!e || !e.target || !e.target.files || questionIndex < 0 || questionIndex >= examTemplate.questions.length) return;
    
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      enqueueSnackbar('Please upload an image file', { variant: 'error' });
      return;
    }
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      handleQuestionChange(questionIndex, 'imageUrl', reader.result);
    };
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!examTemplate.title || !examTemplate.title.trim()) {
      newErrors.title = 'Exam title is required';
    }
    
    if (!Array.isArray(examTemplate.questions)) {
      newErrors.questions = 'Questions are missing';
      setErrors(newErrors);
      return false;
    }
    
    examTemplate.questions.forEach((question, index) => {
      if (!question) return;
      
      if (!question.question || !question.question.trim()) {
        newErrors[`questions[${index}].question`] = 'Question text is required';
      }
      
      if (question.questionType === 'image' && !question.imageUrl) {
        newErrors[`questions[${index}].imageUrl`] = 'Please upload an image';
      }
      
      if (question.questionType === 'table') {
        if (!question.tableData) {
          newErrors[`questions[${index}].tableData`] = 'Table data is missing';
          return;
        }
        
        if (!question.tableData.topic || !question.tableData.topic.trim()) {
          newErrors[`questions[${index}].tableData.topic`] = 'Table topic is required';
        }
        
        if (Array.isArray(question.tableData.columns)) {
          question.tableData.columns.forEach((col, colIndex) => {
            if (!col || !col.trim()) {
              newErrors[`questions[${index}].tableData.columns[${colIndex}]`] = 'Column name is required';
            }
          });
        }
        
        if (Array.isArray(question.tableData.rows)) {
          question.tableData.rows.forEach((row, rowIndex) => {
            if (Array.isArray(row)) {
              row.forEach((cell, cellIndex) => {
                if (!cell || !cell.trim()) {
                  newErrors[`questions[${index}].tableData.rows[${rowIndex}][${cellIndex}]`] = 'Cell content is required';
                }
              });
            }
          });
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) {
      enqueueSnackbar('Please fix the errors before saving', { variant: 'error' });
      return;
    }
    
    setSaving(true);
    
    try {
      if (isNewExam) {
        await api.post('/api/exams/templates', examTemplate);
        enqueueSnackbar('Exam template created successfully', { variant: 'success' });
      } else {
        await api.put(`/api/exams/templates/${id}`, examTemplate);
        enqueueSnackbar('Exam template updated successfully', { variant: 'success' });
      }
      
      navigate('/admin/exams');
    } catch (err) {
      console.error('Save exam template error:', err);
      enqueueSnackbar('Failed to save exam template', { variant: 'error' });
      setSaving(false);
    }
  };
  
  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <CircularProgress />
    </Box>;
  }
  
  if (fetchError) {
    return (
      <Container maxWidth="md">
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            {fetchError}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/admin/exams')}
            sx={{ mt: 2 }}
          >
            Back to Exams
          </Button>
        </Box>
      </Container>
    );
  }
  
  const renderPart1Questions = () => {
    const textQuestions = examTemplate.questions.filter(q => q && q.part === 1 && q.questionType === 'text');
    const imageQuestions = examTemplate.questions.filter(q => q && q.part === 1 && q.questionType === 'image');
    
    return (
      <Box>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Part 1 consists of 6 questions: 3 general text questions and 3 questions with images.
        </Typography>
        
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          General Questions:
        </Typography>
        
        {textQuestions.map((question, questionIndex) => {
          const actualIndex = examTemplate.questions.findIndex(q => q === question);
          if (actualIndex === -1) return null;
          
          return (
            <Card key={`text-${questionIndex}`} variant="outlined" sx={{ mb: 2, p: 1 }}>
              <CardContent>
                <TextField
                  fullWidth
                  label={`Question ${questionIndex + 1}`}
                  value={question.question || ''}
                  onChange={(e) => handleQuestionChange(actualIndex, 'question', e.target.value)}
                  error={!!errors[`questions[${actualIndex}].question`]}
                  helperText={errors[`questions[${actualIndex}].question`]}
                  required
                  sx={{ mb: 1 }}
                />
              </CardContent>
            </Card>
          );
        })}
        
        <Typography variant="subtitle2" sx={{ mb: 1, mt: 3 }}>
          Image-based Questions:
        </Typography>
        
        {imageQuestions.map((question, questionIndex) => {
          const actualIndex = examTemplate.questions.findIndex(q => q === question);
          if (actualIndex === -1) return null;
          
          return (
            <Card key={`image-${questionIndex}`} variant="outlined" sx={{ mb: 2, p: 1 }}>
              <CardContent>
                <TextField
                  fullWidth
                  label={`Question ${questionIndex + 1}`}
                  value={question.question || ''}
                  onChange={(e) => handleQuestionChange(actualIndex, 'question', e.target.value)}
                  error={!!errors[`questions[${actualIndex}].question`]}
                  helperText={errors[`questions[${actualIndex}].question`]}
                  required
                  sx={{ mb: 2 }}
                />
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Image:
                  </Typography>
                  
                  <input
                    accept="image/*"
                    type="file"
                    id={`image-upload-${actualIndex}`}
                    style={{ display: 'none' }}
                    onChange={(e) => handleImageUpload(actualIndex, e)}
                  />
                  
                  <label htmlFor={`image-upload-${actualIndex}`}>
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<Image />}
                      size="small"
                    >
                      Upload Image
                    </Button>
                  </label>
                  
                  {errors[`questions[${actualIndex}].imageUrl`] && (
                    <FormHelperText error>
                      {errors[`questions[${actualIndex}].imageUrl`]}
                    </FormHelperText>
                  )}
                </Box>
                
                {question.imageUrl && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <img 
                      src={question.imageUrl} 
                      alt="Question" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '200px',
                        borderRadius: '4px'
                      }} 
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Box>
    );
  };
  
  const renderPart2Questions = () => {
    const part2Questions = examTemplate.questions.filter(q => q && q.part === 2);
    
    return (
      <Box>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Part 2 consists of 1 question with an image for description.
        </Typography>
        
        {part2Questions.map((question, questionIndex) => {
          const actualIndex = examTemplate.questions.findIndex(q => q === question);
          if (actualIndex === -1) return null;
          
          return (
            <Card key={`part2-${questionIndex}`} variant="outlined" sx={{ mb: 2, p: 1 }}>
              <CardContent>
                <TextField
                  fullWidth
                  label="Question"
                  value={question.question || ''}
                  onChange={(e) => handleQuestionChange(actualIndex, 'question', e.target.value)}
                  error={!!errors[`questions[${actualIndex}].question`]}
                  helperText={errors[`questions[${actualIndex}].question`]}
                  required
                  multiline
                  rows={3}
                  sx={{ mb: 2 }}
                />
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Image:
                  </Typography>
                  
                  <input
                    accept="image/*"
                    type="file"
                    id={`image-upload-${actualIndex}`}
                    style={{ display: 'none' }}
                    onChange={(e) => handleImageUpload(actualIndex, e)}
                  />
                  
                  <label htmlFor={`image-upload-${actualIndex}`}>
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<Image />}
                      size="small"
                    >
                      Upload Image
                    </Button>
                  </label>
                  
                  {errors[`questions[${actualIndex}].imageUrl`] && (
                    <FormHelperText error>
                      {errors[`questions[${actualIndex}].imageUrl`]}
                    </FormHelperText>
                  )}
                </Box>
                
                {question.imageUrl && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <img 
                      src={question.imageUrl} 
                      alt="Question" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '300px',
                        borderRadius: '4px'
                      }} 
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Box>
    );
  };
  
  const renderPart3Questions = () => {
    const part3Questions = examTemplate.questions.filter(q => q && q.part === 3);
    
    return (
      <Box>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Part 3 consists of 1 question with a table for discussion.
        </Typography>
        
        {part3Questions.map((question, questionIndex) => {
          const actualIndex = examTemplate.questions.findIndex(q => q === question);
          if (actualIndex === -1) return null;
          
          const tableData = question.tableData || { topic: '', columns: ['', ''], rows: [['', '']] };
          
          return (
            <Card key={`part3-${questionIndex}`} variant="outlined" sx={{ mb: 2, p: 1 }}>
              <CardContent>
                <TextField
                  fullWidth
                  label="Question"
                  value={question.question || ''}
                  onChange={(e) => handleQuestionChange(actualIndex, 'question', e.target.value)}
                  error={!!errors[`questions[${actualIndex}].question`]}
                  helperText={errors[`questions[${actualIndex}].question`]}
                  required
                  multiline
                  rows={3}
                  sx={{ mb: 3 }}
                />
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Table Data:
                  </Typography>
                  
                  <TextField
                    fullWidth
                    label="Table Topic"
                    value={tableData.topic || ''}
                    onChange={(e) => handleQuestionChange(actualIndex, 'tableData.topic', e.target.value)}
                    error={!!errors[`questions[${actualIndex}].tableData.topic`]}
                    helperText={errors[`questions[${actualIndex}].tableData.topic`]}
                    required
                    sx={{ mb: 2 }}
                  />
                  
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    {Array.isArray(tableData.columns) && tableData.columns.map((column, colIndex) => (
                      <Grid item xs={6} key={`col-${colIndex}`}>
                        <TextField
                          fullWidth
                          label={`Column ${colIndex + 1}`}
                          value={column || ''}
                          onChange={(e) => handleTableColumnChange(actualIndex, colIndex, e.target.value)}
                          error={!!errors[`questions[${actualIndex}].tableData.columns[${colIndex}]`]}
                          helperText={errors[`questions[${actualIndex}].tableData.columns[${colIndex}]`]}
                          required
                        />
                      </Grid>
                    ))}
                  </Grid>
                  
                  <Typography variant="body2" gutterBottom>
                    Rows:
                  </Typography>
                  
                  {Array.isArray(tableData.rows) && tableData.rows.map((row, rowIndex) => (
                    <Box key={`row-${rowIndex}`} sx={{ mb: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        {Array.isArray(row) && row.map((cell, cellIndex) => (
                          <Grid item xs={5} key={`cell-${rowIndex}-${cellIndex}`}>
                            <TextField
                              fullWidth
                              label={`Row ${rowIndex + 1}, Column ${cellIndex + 1}`}
                              value={cell || ''}
                              onChange={(e) => handleTableCellChange(actualIndex, rowIndex, cellIndex, e.target.value)}
                              error={!!errors[`questions[${actualIndex}].tableData.rows[${rowIndex}][${cellIndex}]`]}
                              helperText={errors[`questions[${actualIndex}].tableData.rows[${rowIndex}][${cellIndex}]`]}
                              required
                            />
                          </Grid>
                        ))}
                        <Grid item xs={2}>
                          <IconButton 
                            color="error" 
                            onClick={() => handleRemoveTableRow(actualIndex, rowIndex)}
                            disabled={!Array.isArray(tableData.rows) || tableData.rows.length <= 1}
                          >
                            <Delete />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                  
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => handleAddTableRow(actualIndex)}
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    Add Row
                  </Button>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    );
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {isNewExam ? 'Create New Exam' : 'Edit Exam'}
          </Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/admin/exams')}
              sx={{ mr: 2 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={saving ? null : <Save />}
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? <CircularProgress size={24} /> : 'Save Exam'}
            </Button>
          </Box>
        </Box>
        
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Exam Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Exam Title"
                  name="title"
                  value={examTemplate.title || ''}
                  onChange={handleTitleDescriptionChange}
                  error={!!errors.title}
                  helperText={errors.title}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={examTemplate.description || ''}
                  onChange={handleTitleDescriptionChange}
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Exam Questions
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              A complete CEFR speaking exam contains 3 parts: Part 1 (6 questions: 3 text-only and 3 with images), 
              Part 2 (1 question with image), and Part 3 (1 question with a table). The template below provides 
              the recommended structure.
            </Alert>
          </Box>
          
          {/* Part 1 Questions */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1" fontWeight="bold">Part 1 Questions (General + Image-based)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {renderPart1Questions()}
            </AccordionDetails>
          </Accordion>
          
          {/* Part 2 Question */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1" fontWeight="bold">Part 2 Question (Image Description)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {renderPart2Questions()}
            </AccordionDetails>
          </Accordion>
          
          {/* Part 3 Question */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1" fontWeight="bold">Part 3 Question (Table Discussion)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {renderPart3Questions()}
            </AccordionDetails>
          </Accordion>
        </Paper>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/admin/exams')}
            sx={{ mr: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={saving ? null : <Save />}
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : 'Save Exam'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default AdminExamEdit;
