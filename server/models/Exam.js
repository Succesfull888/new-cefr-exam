const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  questionType: {
    type: String,
    enum: ['text', 'image', 'table'],
    default: 'text'
  },
  imageUrl: String,
  tableData: {
    topic: String,
    columns: [String],
    rows: [[String]]
  },
  part: {
    type: Number,
    required: true,
    enum: [1, 2, 3]
  }
});

const ExamTemplateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  questions: [QuestionSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ResponseSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  audioUrl: {
    type: String,
    required: true
  }
});

const FeedbackSchema = new mongoose.Schema({
  part: {
    type: Number,
    required: true,
    enum: [1, 2, 3]
  },
  score: {
    type: Number,
    required: true
  },
  feedback: String
});

const ExamSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  examTemplate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExamTemplate',
    required: true
  },
  responses: [ResponseSchema],
  feedback: [FeedbackSchema],
  totalScore: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['submitted', 'evaluated'],
    default: 'submitted'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  evaluatedAt: Date
});

const ExamTemplate = mongoose.model('ExamTemplate', ExamTemplateSchema);
const Exam = mongoose.model('Exam', ExamSchema);

module.exports = { ExamTemplate, Exam };