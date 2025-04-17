import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, List, ListItem, ListItemIcon, ListItemText, Divider, Typography } from '@mui/material';
import { LooksOne, LooksTwo, Looks3, Timer, Mic, Info } from '@mui/icons-material';

const InstructionsModal = ({ open, onClose }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        CEFR Speaking Exam Instructions
      </DialogTitle>
      <DialogContent>
        <DialogContentText component="div" sx={{ my: 2 }}>
          <Typography variant="h6" gutterBottom>
            Please read these instructions carefully before starting the exam:
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Exam Structure:
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <LooksOne color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Part 1" 
                secondary="6 questions (3 general questions and 3 based on images). You will have 5 seconds to read each question, and 30 seconds to speak." 
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <LooksTwo color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Part 2" 
                secondary="Description task with images. You will have 5 seconds to read the question, 1 minute to prepare, and 2 minutes to speak." 
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <Looks3 color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Part 3" 
                secondary="Discussion task based on a table. You will have 5 seconds to read the question, 1 minute to prepare, and 2 minutes to speak." 
              />
            </ListItem>
          </List>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Important Information:
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <Mic color="error" />
              </ListItemIcon>
              <ListItemText 
                primary="Audio Recording" 
                secondary="Your responses will be recorded for evaluation. Make sure your microphone is working properly." 
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <Timer color="warning" />
              </ListItemIcon>
              <ListItemText 
                primary="Time Limits" 
                secondary="You will hear a sound notification when the time is almost over. Recording will stop automatically when the time limit is reached." 
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <Info color="info" />
              </ListItemIcon>
              <ListItemText 
                primary="Evaluation" 
                secondary="Your responses will be evaluated based on fluency, vocabulary, grammar, pronunciation, and content." 
              />
            </ListItem>
          </List>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          I understand, start the exam
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InstructionsModal;