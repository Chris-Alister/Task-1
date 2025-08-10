const express = require('express');
const router = express.Router();
const {
  getAllStudents,
  addStudent,
  deleteStudent,
  getStudentById,
  updateStudent
} = require('../controllers/adminController');

// GET /api/admin/students - Get all students
router.get('/students', getAllStudents);

// GET /api/admin/students/:id - Get student by ID
router.get('/students/:id', getStudentById);

// POST /api/admin/add-student - Add a new student
router.post('/add-student', addStudent);

// PUT /api/admin/students/:id - Update a student
router.put('/students/:id', updateStudent);

// DELETE /api/admin/delete-student/:id - Delete a student
router.delete('/delete-student/:id', deleteStudent);

module.exports = router; 