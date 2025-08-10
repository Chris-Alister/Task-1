const Marks = require('../models/Marks');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const ExcelJS = require('exceljs');

// Get all students for teacher
const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find({ isActive: true })
      .select('name rollNumber className section email')
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

// Add marks for a student
const addMarks = async (req, res) => {
  try {
    const {
      studentId,
      subject,
      examType,
      marks,
      totalMarks,
      academicYear,
      semester,
      remarks
    } = req.body;

    // Validate required fields
    if (!studentId || !subject || !marks || !totalMarks) {
      return res.status(400).json({
        success: false,
        message: 'Please provide studentId, subject, marks, and totalMarks'
      });
    }

    // Validate ObjectId
    if (!studentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format'
      });
    }

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student || !student.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if marks already exist for this student, subject, and exam type
    const existingMarks = await Marks.findOne({
      student: studentId,
      subject,
      examType: examType || 'Midterm',
      academicYear: academicYear || new Date().getFullYear().toString()
    });

    if (existingMarks) {
      return res.status(400).json({
        success: false,
        message: 'Marks already exist for this student, subject, and exam type'
      });
    }

    // Create new marks entry
    const marksEntry = new Marks({
      student: studentId,
      subject,
      examType: examType || 'Midterm',
      marks,
      totalMarks,
      academicYear: academicYear || new Date().getFullYear().toString(),
      semester: semester || '1st',
      remarks,
      enteredBy: req.user ? req.user._id : null // Set teacher reference
    });

    const savedMarks = await marksEntry.save();

    res.status(201).json({
      success: true,
      message: 'Marks added successfully',
      data: savedMarks
    });
  } catch (error) {
    console.error('Error adding marks:', error);
    
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
      message: 'Error adding marks',
      error: error.message
    });
  }
};

// Update marks for a student
const updateMarks = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid marks ID format'
      });
    }

    const marks = await Marks.findById(id);
    if (!marks) {
      return res.status(404).json({
        success: false,
        message: 'Marks not found'
      });
    }

    // Update marks
    const updatedMarks = await Marks.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('student', 'name rollNumber className section');

    res.status(200).json({
      success: true,
      message: 'Marks updated successfully',
      data: updatedMarks
    });
  } catch (error) {
    console.error('Error updating marks:', error);
    
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
      message: 'Error updating marks',
      error: error.message
    });
  }
};

// Delete marks
const deleteMarks = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid marks ID format'
      });
    }

    const marks = await Marks.findById(id);
    if (!marks) {
      return res.status(404).json({
        success: false,
        message: 'Marks not found'
      });
    }

    await Marks.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Marks deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting marks:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting marks',
      error: error.message
    });
  }
};

// Get marks for a specific student
const getStudentMarks = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Validate ObjectId
    if (!studentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format'
      });
    }

    const student = await Student.findById(studentId);
    if (!student || !student.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const marks = await Marks.find({ student: studentId })
      .populate('student', 'name rollNumber className section')
      .sort({ examDate: -1 });

    res.status(200).json({
      success: true,
      student: {
        name: student.name,
        rollNumber: student.rollNumber,
        className: student.className,
        section: student.section
      },
      count: marks.length,
      data: marks
    });
  } catch (error) {
    console.error('Error fetching student marks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student marks',
      error: error.message
    });
  }
};

// Download student marks as Excel
const downloadStudentMarks = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Validate ObjectId
    if (!studentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format'
      });
    }

    const student = await Student.findById(studentId);
    if (!student || !student.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const marks = await Marks.find({ student: studentId })
      .populate('student', 'name rollNumber className section')
      .sort({ examDate: -1 });

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Student Marks');

    // Add headers
    worksheet.columns = [
      { header: 'Subject', key: 'subject', width: 15 },
      { header: 'Exam Type', key: 'examType', width: 15 },
      { header: 'Marks Obtained', key: 'marks', width: 15 },
      { header: 'Total Marks', key: 'totalMarks', width: 15 },
      { header: 'Percentage', key: 'percentage', width: 15 },
      { header: 'Grade', key: 'grade', width: 10 },
      { header: 'Exam Date', key: 'examDate', width: 15 },
      { header: 'Academic Year', key: 'academicYear', width: 15 },
      { header: 'Semester', key: 'semester', width: 10 },
      { header: 'Remarks', key: 'remarks', width: 20 }
    ];

    // Add student info at the top
    worksheet.insertRow(1, ['Student Information']);
    worksheet.insertRow(2, ['Name:', student.name]);
    worksheet.insertRow(3, ['Roll Number:', student.rollNumber]);
    worksheet.insertRow(4, ['Class:', student.className]);
    worksheet.insertRow(5, ['Section:', student.section]);
    worksheet.insertRow(6, []); // Empty row

    // Add marks data
    marks.forEach(mark => {
      // Calculate percentage if not already calculated
      const percentage = mark.percentage || (mark.marks && mark.totalMarks ? (mark.marks / mark.totalMarks) * 100 : 0);
      
      worksheet.addRow({
        subject: mark.subject,
        examType: mark.examType,
        marks: mark.marks,
        totalMarks: mark.totalMarks,
        percentage: `${percentage.toFixed(2)}%`,
        grade: mark.grade,
        examDate: mark.examDate ? mark.examDate.toLocaleDateString() : 'N/A',
        academicYear: mark.academicYear,
        semester: mark.semester,
        remarks: mark.remarks || ''
      });
    });

    // Style the header row
    const headerRow = worksheet.getRow(8);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${student.name.replace(/\s+/g, '_')}_marks.xlsx`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error downloading marks:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading marks',
      error: error.message
    });
  }
};

// Get all marks (for teacher dashboard)
const getAllMarks = async (req, res) => {
  try {
    const { subject, examType, academicYear } = req.query;
    
    let query = {};
    
    if (subject) query.subject = subject;
    if (examType) query.examType = examType;
    if (academicYear) query.academicYear = academicYear;

    const marks = await Marks.find(query)
      .populate('student', 'name rollNumber className section')
      .sort({ examDate: -1 });

    res.status(200).json({
      success: true,
      count: marks.length,
      data: marks
    });
  } catch (error) {
    console.error('Error fetching marks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching marks',
      error: error.message
    });
  }
};

// Download all marks in one Excel file
const downloadAllMarks = async (req, res) => {
  try {
    const { subject, examType, academicYear } = req.query;
    
    let query = {};
    
    if (subject) query.subject = subject;
    if (examType) query.examType = examType;
    if (academicYear) query.academicYear = academicYear;

    const marks = await Marks.find(query)
      .populate('student', 'name rollNumber className section')
      .sort({ 'student.name': 1, examDate: -1 });

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('All Students Marks');

    // Add headers
    worksheet.columns = [
      { header: 'Student Name', key: 'studentName', width: 20 },
      { header: 'Roll Number', key: 'rollNumber', width: 15 },
      { header: 'Class', key: 'className', width: 10 },
      { header: 'Section', key: 'section', width: 10 },
      { header: 'Subject', key: 'subject', width: 15 },
      { header: 'Exam Type', key: 'examType', width: 15 },
      { header: 'Marks Obtained', key: 'marks', width: 15 },
      { header: 'Total Marks', key: 'totalMarks', width: 15 },
      { header: 'Percentage', key: 'percentage', width: 15 },
      { header: 'Grade', key: 'grade', width: 10 },
      { header: 'Exam Date', key: 'examDate', width: 15 },
      { header: 'Academic Year', key: 'academicYear', width: 15 },
      { header: 'Semester', key: 'semester', width: 10 },
      { header: 'Remarks', key: 'remarks', width: 20 }
    ];

    // Add marks data
    marks.forEach(mark => {
      // Calculate percentage if not already calculated
      const percentage = mark.percentage || (mark.marks && mark.totalMarks ? (mark.marks / mark.totalMarks) * 100 : 0);
      
      worksheet.addRow({
        studentName: mark.student ? mark.student.name : 'Unknown Student',
        rollNumber: mark.student ? mark.student.rollNumber : 'N/A',
        className: mark.student ? mark.student.className : 'N/A',
        section: mark.student ? mark.student.section : 'N/A',
        subject: mark.subject,
        examType: mark.examType,
        marks: mark.marks,
        totalMarks: mark.totalMarks,
        percentage: `${percentage.toFixed(2)}%`,
        grade: mark.grade,
        examDate: mark.examDate ? mark.examDate.toLocaleDateString() : 'N/A',
        academicYear: mark.academicYear,
        semester: mark.semester,
        remarks: mark.remarks || ''
      });
    });

    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=all_students_marks.xlsx');

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error downloading all marks:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading all marks',
      error: error.message
    });
  }
};

module.exports = {
  getAllStudents,
  addMarks,
  updateMarks,
  deleteMarks,
  getStudentMarks,
  downloadStudentMarks,
  getAllMarks,
  downloadAllMarks
}; 