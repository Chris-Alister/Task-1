const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student reference is required']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  examType: {
    type: String,
    required: [true, 'Exam type is required'],
    enum: ['Midterm', 'Final', 'Quiz', 'Assignment', 'Project'],
    default: 'Midterm'
  },
  marks: {
    type: Number,
    required: [true, 'Marks are required'],
    min: [0, 'Marks cannot be negative'],
    max: [100, 'Marks cannot exceed 100']
  },
  totalMarks: {
    type: Number,
    required: [true, 'Total marks are required'],
    default: 100
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'],
    default: 'F'
  },
  examDate: {
    type: Date,
    default: Date.now
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    default: new Date().getFullYear().toString()
  },
  semester: {
    type: String,
    enum: ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'],
    default: '1st'
  },
  remarks: {
    type: String,
    trim: true
  },
  enteredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: [true, 'Teacher reference is required']
  }
}, {
  timestamps: true
});

// Calculate percentage and grade before saving
marksSchema.pre('save', function(next) {
  if (this.marks && this.totalMarks) {
    this.percentage = (this.marks / this.totalMarks) * 100;
    
    // Calculate grade based on percentage
    if (this.percentage >= 90) this.grade = 'A+';
    else if (this.percentage >= 85) this.grade = 'A';
    else if (this.percentage >= 80) this.grade = 'A-';
    else if (this.percentage >= 75) this.grade = 'B+';
    else if (this.percentage >= 70) this.grade = 'B';
    else if (this.percentage >= 65) this.grade = 'B-';
    else if (this.percentage >= 60) this.grade = 'C+';
    else if (this.percentage >= 55) this.grade = 'C';
    else if (this.percentage >= 50) this.grade = 'C-';
    else if (this.percentage >= 45) this.grade = 'D+';
    else if (this.percentage >= 40) this.grade = 'D';
    else this.grade = 'F';
  }
  next();
});

// Index for better query performance
marksSchema.index({ student: 1, subject: 1, examType: 1, academicYear: 1 });

module.exports = mongoose.model('Marks', marksSchema); 