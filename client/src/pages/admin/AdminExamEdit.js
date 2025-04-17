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
  
  useEffect(() => {
    const fetchExamTemplate = async () => {
      if (isNewExam) return;
      
      try {
        const res = await api.get(`/api/exams/templates/${id}`);
        setExamTemplate(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Fetch exam template error:', err);
        enqueueSnackbar('Failed to load exam template', { variant: 'error' });
        navigate('/admin/exams');
      }
    };
    
    fetchExamTemplate();
  }, [id, isNewExam, navigate, enqueueSnackbar]);
  
  const handleTitleDescriptionChange = (e) => {
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
    const updatedQuestions = [...examTemplate.questions];
    const question = updatedQuestions[questionIndex];
    
    question.tableData.rows.push(['', '']);
    
    setExamTemplate({
      ...examTemplate,
      questions: updatedQuestions
    });
  };
  
  const handleRemoveTableRow = (questionIndex, rowIndex) => {
    const updatedQuestions = [...examTemplate.questions];
    const question = updatedQuestions[questionIndex];
    
    if (question.tableData.rows.length > 1) {
      question.tableData.rows.splice(rowIndex, 1);
      
      setExamTemplate({
        ...examTemplate,
        questions: updatedQuestions
      });
    }
  };
  
  const handleTableCellChange = (questionIndex, rowIndex, colIndex, value) => {
    const updatedQuestions = [...examTemplate.questions];
    const question = updatedQuestions[questionIndex];
    
    question.tableData.rows[rowIndex][colIndex] = value;
    
    setExamTemplate({
      ...examTemplate,
      questions: updatedQuestions
    });
  };
  
  const handleTableColumnChange = (questionIndex, colIndex, value) => {
    const updatedQuestions = [...examTemplate.questions];
    const question = updatedQuestions[questionIndex];
    
    question.tableData.columns[colIndex] = value;
    
    setExamTemplate({
      ...examTemplate,
      questions: updatedQuestions
    });
  };
  
  const handleImageUpload = async (questionIndex, e) => {
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
    
    if (!examTemplate.title.trim()) {
      newErrors.title = 'Exam title is required';
    }
    
    examTemplate.questions.forEach((question, index) => {
      if (!question.question.trim()) {
        newErrors[`questions[${index}].question`] = 'Question text is required';
      }
      
      if (question.questionType === 'image' && !question.imageUrl) {
        newErrors[`questions[${index}].imageUrl`] = 'Please upload an image';
      }
      
      if (question.questionType === 'table') {
        if (!question.tableData.topic.trim()) {
          newErrors[`questions[${index}].tableData.topic`] = 'Table topic is required';
        }
        
        question.tableData.columns.forEach((col, colIndex) => {
          if (!col.trim()) {
            newErrors[`questions[${index}].tableData.columns[${colIndex}]`] = 'Column name is required';
          }
        });
        
        question.tableData.rows.forEach((row, rowIndex) => {
          row.forEach((cell, cellIndex) => {
            if (!cell.trim()) {
              newErrors[`questions[${index}].tableData.rows[${rowIndex}][${cellIndex}]`] = 'Cell content is required';
            }
          });
        });
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
              startIcon={<Save />}
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
                  value={examTemplate.title}
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
                  value={examTemplate.description}
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
              <Box>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Part 1 consists of 6 questions: 3 general text questions and 3 questions with images.
                </Typography>
                
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  General Questions:
                </Typography>
                
                {examTemplate.questions
                  .filter(q => q.part === 1 && q.questionType === 'text')
                  .map((question, questionIndex) => {
                    const actualIndex = examTemplate.questions.findIndex(q => q === question);
                    return (
                      <Card key={questionIndex} variant="outlined" sx={{ mb: 2, p: 1 }}>
                        <CardContent>
                          <TextField
                            fullWidth
                            label={`Question ${questionIndex + 1}`}
                            value={question.question}
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
                
                {examTemplate.questions
                  .filter(q => q.part === 1 && q.questionType === 'image')
                  .map((question, questionIndex) => {
                    const actualIndex = examTemplate.questions.findIndex(q => q === question);
                    return (
                      <Card key={questionIndex} variant="outlined" sx={{ mb: 2, p: 1 }}>
                        <CardContent>
                          <TextField
                            fullWidth
                            label={`Question ${questionIndex + 1}`}
                            value={question.question}
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
            </AccordionDetails>
          </Accordion>
          
          {/* Part 2 Question */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1" fontWeight="bold">Part 2 Question (Image Description)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Part 2 consists of 1 question with an image for description.
                </Typography>
                
                {examTemplate.questions
                  .filter(q => q.part === 2)
                  .map((question, questionIndex) => {
                    const actualIndex = examTemplate.questions.findIndex(q => q === question);
                    return (
                      <Card key={questionIndex} variant="outlined" sx={{ mb: 2, p: 1 }}>
                        <CardContent>
                          <TextField
                            fullWidth
                            label="Question"
                            value={question.question}
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
            </AccordionDetails>
          </Accordion>
          
          {/* Part 3 Question */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1" fontWeight="bold">Part 3 Question (Table Discussion)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Part 3 consists of 1 question with a table for discussion.
                </Typography>
                
                {examTemplate.questions
                  .filter(q => q.part === 3)
                  .map((question, questionIndex) => {
                    const actualIndex = examTemplate.questions.findIndex(q => q === question);
                    return (
                      <Card key={questionIndex} variant="outlined" sx={{ mb: 2, p: 1 }}>
                        <CardContent>
                          <TextField
                            fullWidth
                            label="Question"
                            value={question.question}
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
                              value={question.tableData.topic}
                              onChange={(e) => handleQuestionChange(actualIndex, 'tableData.topic', e.target.value)}
                              error={!!errors[`questions[${actualIndex}].tableData.topic`]}
                              helperText={errors[`questions[${actualIndex}].tableData.topic`]}
                              required
                              sx={{ mb: 2 }}
                            />
                            
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                              {question.tableData.columns.map((column, colIndex) => (
                                <Grid item xs={6} key={colIndex}>
                                  <TextField
                                    fullWidth
                                    label={`Column ${colIndex + 1}`}
                                    value={column}
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
                            
                            {question.tableData.rows.map((row, rowIndex) => (
                              <Box key={rowIndex} sx={{ mb: 2 }}>
                                <Grid container spacing={2} alignItems="center">
                                  {row.map((cell, cellIndex) => (
                                    <Grid item xs={5} key={cellIndex}>
                                      <TextField
                                        fullWidth
                                        label={`Row ${rowIndex + 1}, Column ${cellIndex + 1}`}
                                        value={cell}
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
                                      disabled={question.tableData.rows.length <= 1}
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
            startIcon={<Save />}
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