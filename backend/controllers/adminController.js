const Student = require('../models/Student');

// Get all students
const getAllStudents = async (req, res) => {
  try {
    const { className, section } = req.query;
    
    let query = { isActive: true };
    
    // Add filters if provided
    if (className) query.className = className;
    if (section) query.section = section;
    
    const students = await Student.find(query)
      .select('-__v')
      .sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error.message
    });
  }
};

// Add a new student
const addStudent = async (req, res) => {
  try {
    const {
      name,
      rollNumber,
      className,
      section,
      email,
      phone,
      address,
      dateOfBirth,
      gender
    } = req.body;

    // Validate required fields
    if (!name || !rollNumber || !className || !section || !email || !gender) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, rollNumber, className, section, email, gender'
      });
    }

    // Check if student with same roll number already exists
    const existingStudent = await Student.findOne({ rollNumber });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student with this roll number already exists'
      });
    }

    // Check if student with same email already exists
    const existingEmail = await Student.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Student with this email already exists'
      });
    }

    // Create new student
    const student = new Student({
      name,
      rollNumber,
      className,
      section,
      email,
      phone,
      address,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender
    });

    const savedStudent = await student.save();

    res.status(201).json({
      success: true,
      message: 'Student added successfully',
      data: savedStudent
    });
  } catch (error) {
    console.error('Error adding student:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error adding student',
      error: error.message
    });
  }
};

// Delete a student by ID
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format'
      });
    }

    const student = await Student.findById(id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Soft delete by setting isActive to false
    student.isActive = false;
    await student.save();

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting student',
      error: error.message
    });
  }
};

// Get student by ID
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format'
      });
    }

    const student = await Student.findById(id).select('-__v');
    
    if (!student || !student.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student',
      error: error.message
    });
  }
};

// Update student
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format'
      });
    }

    const student = await Student.findById(id);
    
    if (!student || !student.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check for duplicate roll number if being updated
    if (updateData.rollNumber && updateData.rollNumber !== student.rollNumber) {
      const existingStudent = await Student.findOne({ rollNumber: updateData.rollNumber });
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: 'Student with this roll number already exists'
        });
      }
    }

    // Check for duplicate email if being updated
    if (updateData.email && updateData.email !== student.email) {
      const existingEmail = await Student.findOne({ email: updateData.email });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Student with this email already exists'
        });
      }
    }

    // Update student
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent
    });
  } catch (error) {
    console.error('Error updating student:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating student',
      error: error.message
    });
  }
};

module.exports = {
  getAllStudents,
  addStudent,
  deleteStudent,
  getStudentById,
  updateStudent
}; 