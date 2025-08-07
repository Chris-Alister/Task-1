const express = require('express');
const router = express.Router();
const {
  getAllStudents,
  addMarks,
  updateMarks,
  deleteMarks,
  getStudentMarks,
  downloadStudentMarks,
  getAllMarks
} = require('../controllers/teacherController');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/teacher/students - Get all students
router.get('/students', authMiddleware, getAllStudents);

// GET /api/teacher/marks - Get all marks (with optional filters)
router.get('/marks', authMiddleware, getAllMarks);

// GET /api/teacher/students/:studentId/marks - Get marks for a specific student
router.get('/students/:studentId/marks', authMiddleware, getStudentMarks);

// POST /api/teacher/add-marks - Add marks for a student
router.post('/add-marks', authMiddleware, addMarks);

// PUT /api/teacher/marks/:id - Update marks
router.put('/marks/:id', authMiddleware, updateMarks);

// DELETE /api/teacher/marks/:id - Delete marks
router.delete('/marks/:id', authMiddleware, deleteMarks);

// GET /api/teacher/students/:studentId/download-marks - Download student marks as Excel
router.get('/students/:studentId/download-marks', authMiddleware, downloadStudentMarks);

module.exports = router; 