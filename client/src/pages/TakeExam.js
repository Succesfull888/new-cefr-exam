import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Button, Paper, Grid, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, CircularProgress, LinearProgress } from '@mui/material';
import { PlayArrow, Pause, Mic, Stop, ArrowForward, CheckCircle } from '@mui/icons-material';
import api from '../utils/api';
import useMediaRecorder from '../hooks/useMediaRecorder';
import Timer from '../components/exam/Timer';
import QuestionDisplay from '../components/exam/QuestionDisplay';
import InstructionsModal from '../components/exam/InstructionsModal';
import { useSnackbar } from 'notistack';

const TakeExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  const [examTemplate, setExamTemplate] = useState(null);
  const [currentPart, setCurrentPart] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [examState, setExamState] = useState('preparing'); // preparing, reading, preparing-speech, speaking, completed
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const timerRef = useRef(null);
  const countdownSound = useRef(new Audio('/sounds/countdown.mp3'));
  const endSound = useRef(new Audio('/sounds/end.mp3'));
  
  const { 
    recording, 
    mediaBlob, 
    startRecording, 
    stopRecording,
    resetRecording,
    recordingTime
  } = useMediaRecorder();
  
  // Fetch exam template
  useEffect(() => {
    const fetchExamTemplate = async () => {
      try {
        const res = await api.get(`/api/exams/templates/${id}`);
        setExamTemplate(res.data);
        setLoading(false);
      } catch (err) {
        enqueueSnackbar('Failed to load exam', { variant: 'error' });
        navigate('/dashboard');
      }
    };
    
    fetchExamTemplate();
  }, [id, navigate, enqueueSnackbar]);
  
  // Get current question
  const getCurrentQuestion = () => {
    if (!examTemplate) return null;
    
    const partQuestions = examTemplate.questions.filter(q => q.part === currentPart);
    return partQuestions[currentQuestionIndex];
  };
  
  // Play sound for countdown
  useEffect(() => {
    const playCountdownSound = () => {
      if (examState === 'speaking' && recordingTime >= 25 && recordingTime <= 30) {
        countdownSound.current.play().catch(err => console.error('Could not play sound:', err));
      }
    };
    
    playCountdownSound();
  }, [examState, recordingTime]);
  
  // Handle state transitions
  const handleStateTransition = (newState) => {
    setExamState(newState);
    
    if (newState === 'reading') {
      // Start 5-second reading time
      setTimeout(() => {
        handleStateTransition('preparing-speech');
      }, 5000);
    } else if (newState === 'preparing-speech') {
      // Start preparation time (1 minute for parts 2 and 3, none for part 1)
      if (currentPart === 1) {
        // Part 1 has no preparation time
        handleStateTransition('speaking');
      } else {
        // Parts 2 and 3 have 1 minute preparation time
        setTimeout(() => {
          handleStateTransition('speaking');
        }, 60000); // 1 minute
      }
    } else if (newState === 'speaking') {
      // Start recording
      startRecording();
      
      // Set max speaking time based on part
      let maxTime;
      if (currentPart === 1) {
        maxTime = 30000; // 30 seconds
      } else {
        maxTime = 120000; // 2 minutes
      }
      
      // End speaking time after max time
      setTimeout(() => {
        if (examState === 'speaking') {
          endSound.current.play().catch(err => console.error('Could not play sound:', err));
          handleEndSpeaking();
        }
      }, maxTime);
    }
  };
  
  // Handle end speaking
  const handleEndSpeaking = async () => {
    await stopRecording();
    setExamState('completed');
  };
  
  // Move to next question
  const handleNextQuestion = () => {
    const currentQuestion = getCurrentQuestion();
    
    if (mediaBlob) {
      setResponses([
        ...responses,
        {
          questionId: currentQuestion._id,
          audioBlob: mediaBlob
        }
      ]);
    }
    
    resetRecording();
    
    const partQuestions = examTemplate.questions.filter(q => q.part === currentPart);
    
    if (currentQuestionIndex < partQuestions.length - 1) {
      // Move to next question in current part
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setExamState('preparing');
    } else if (currentPart < 3) {
      // Move to next part
      setCurrentPart(currentPart + 1);
      setCurrentQuestionIndex(0);
      setExamState('preparing');
    } else {
      // End of exam
      handleSubmitExam();
    }
  };
  
  // Submit exam
  const handleSubmitExam = async () => {
    try {
      setSubmitting(true);
      
      await api.post('/api/exams/submit', {
        examTemplateId: examTemplate._id,
        responses
      });
      
      enqueueSnackbar('Exam submitted successfully!', { variant: 'success' });
      navigate('/my-exams');
    } catch (err) {
      enqueueSnackbar('Failed to submit exam', { variant: 'error' });
      setSubmitting(false);
    }
  };
  
  // Start exam after closing instructions
  const handleCloseInstructions = () => {
    setShowInstructions(false);
    setExamState('preparing');
  };
  
  // Start question
  const handleStartQuestion = () => {
    handleStateTransition('reading');
  };
  
  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <CircularProgress />
    </Box>;
  }
  
  const currentQuestion = getCurrentQuestion();
  
  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 3, my: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {examTemplate.title}
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={((currentPart - 1) * examTemplate.questions.filter(q => q.part === 1).length + currentQuestionIndex) * 100 / 
              (examTemplate.questions.filter(q => q.part === 1).length + 
               examTemplate.questions.filter(q => q.part === 2).length + 
               examTemplate.questions.filter(q => q.part === 3).length)} 
            sx={{ height: 10, borderRadius: 5 }}
          />
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Part {currentPart}
          </Typography>
          
          {currentQuestion && (
            <QuestionDisplay 
              question={currentQuestion} 
              examState={examState}
            />
          )}
        </Box>
        
        <Box sx={{ mb: 3 }}>
          {examState === 'preparing' && (
            <Button 
              variant="contained" 
              color="primary" 
              size="large" 
              startIcon={<PlayArrow />}
              onClick={handleStartQuestion}
              fullWidth
            >
              Start Question
            </Button>
          )}
          
          {examState === 'reading' && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6">Reading question...</Typography>
              <Box sx={{ my: 2 }}>
                <Timer seconds={5} onComplete={() => {}} />
              </Box>
            </Box>
          )}
          
          {examState === 'preparing-speech' && currentPart > 1 && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6">Preparation time</Typography>
              <Box sx={{ my: 2 }}>
                <Timer seconds={60} onComplete={() => {}} />
              </Box>
            </Box>
          )}
          
          {examState === 'speaking' && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="error">Recording...</Typography>
              <Typography variant="body1">Time: {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</Typography>
              <Button 
                variant="contained" 
                color="error" 
                startIcon={<Stop />}
                onClick={handleEndSpeaking}
                sx={{ mt: 2 }}
              >
                Stop Recording
              </Button>
            </Box>
          )}
          
          {examState === 'completed' && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="success.main">Response recorded!</Typography>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<ArrowForward />}
                onClick={handleNextQuestion}
                sx={{ mt: 2 }}
              >
                {currentPart === 3 && currentQuestionIndex === examTemplate.questions.filter(q => q.part === 3).length - 1 
                  ? 'Submit Exam' 
                  : 'Next Question'}
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
      
      <InstructionsModal
        open={showInstructions}
        onClose={handleCloseInstructions}
      />
      
      <Dialog open={submitting}>
        <DialogTitle>Submitting Exam</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your exam is being submitted. Please wait...
          </DialogContentText>
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default TakeExam;