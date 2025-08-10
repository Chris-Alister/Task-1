const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Marks = require('../models/Marks');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const DateType = require('./dateScalar');
const { GraphQLError } = require('graphql');

// Custom error classes for Apollo Server v4
class AuthenticationError extends GraphQLError {
  constructor(message) {
    super(message, {
      extensions: { code: 'UNAUTHENTICATED' }
    });
  }
}

class ForbiddenError extends GraphQLError {
  constructor(message) {
    super(message, {
      extensions: { code: 'FORBIDDEN' }
    });
  }
}

class UserInputError extends GraphQLError {
  constructor(message) {
    super(message, {
      extensions: { code: 'BAD_USER_INPUT' }
    });
  }
}

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
};

// Helper function to require authentication
const requireAuth = (user) => {
  if (!user) {
    throw new AuthenticationError('You must be logged in to perform this action');
  }
  return user;
};

// Helper function to require admin role
const requireAdmin = (user) => {
  requireAuth(user);
  if (user.role !== 'admin') {
    throw new ForbiddenError('You must be an admin to perform this action');
  }
  return user;
};

const resolvers = {
  Date: DateType,
  
  Query: {
    // Student Queries
    students: async () => {
      try {
        return await Student.find({ isActive: true }).sort({ name: 1 });
      } catch (error) {
        throw new Error(`Error fetching students: ${error.message}`);
      }
    },

    student: async (_, { id }) => {
      try {
        const student = await Student.findById(id);
        if (!student) {
          throw new UserInputError('Student not found');
        }
        return student;
      } catch (error) {
        throw new Error(`Error fetching student: ${error.message}`);
      }
    },

    studentByRollNumber: async (_, { rollNumber }) => {
      try {
        const student = await Student.findOne({ rollNumber, isActive: true });
        if (!student) {
          throw new UserInputError('Student not found');
        }
        return student;
      } catch (error) {
        throw new Error(`Error fetching student: ${error.message}`);
      }
    },

    // Marks Queries
    allMarks: async () => {
      try {
        return await Marks.find()
          .populate('student')
          .populate('enteredBy')
          .sort({ examDate: -1 });
      } catch (error) {
        throw new Error(`Error fetching marks: ${error.message}`);
      }
    },

    studentMarks: async (_, { studentId }) => {
      try {
        return await Marks.find({ student: studentId })
          .populate('student')
          .populate('enteredBy')
          .sort({ examDate: -1 });
      } catch (error) {
        throw new Error(`Error fetching student marks: ${error.message}`);
      }
    },

    marksBySubject: async (_, { subject }) => {
      try {
        return await Marks.find({ subject })
          .populate('student')
          .populate('enteredBy')
          .sort({ examDate: -1 });
      } catch (error) {
        throw new Error(`Error fetching marks by subject: ${error.message}`);
      }
    },

    marksByExamType: async (_, { examType }) => {
      try {
        return await Marks.find({ examType })
          .populate('student')
          .populate('enteredBy')
          .sort({ examDate: -1 });
      } catch (error) {
        throw new Error(`Error fetching marks by exam type: ${error.message}`);
      }
    },

    // Teacher Queries
    teachers: async (_, __, { user }) => {
      requireAdmin(user);
      try {
        return await Teacher.find({ isActive: true }).sort({ name: 1 });
      } catch (error) {
        throw new Error(`Error fetching teachers: ${error.message}`);
      }
    },

    teacher: async (_, { id }, { user }) => {
      requireAuth(user);
      try {
        const teacher = await Teacher.findById(id);
        if (!teacher) {
          throw new UserInputError('Teacher not found');
        }
        return teacher;
      } catch (error) {
        throw new Error(`Error fetching teacher: ${error.message}`);
      }
    },

    me: async (_, __, { user }) => {
      requireAuth(user);
      return user;
    },

    // Analytics
    classAnalytics: async (_, { className }) => {
      try {
        const students = await Student.find({ className, isActive: true });
        const studentIds = students.map(s => s._id);
        const marks = await Marks.find({ student: { $in: studentIds } });

        const totalStudents = students.length;
        const averageMarks = marks.length > 0 ? marks.reduce((sum, mark) => sum + mark.percentage, 0) / marks.length : 0;
        const markPercentages = marks.map(mark => mark.percentage);
        const highestMarks = markPercentages.length > 0 ? Math.max(...markPercentages) : 0;
        const lowestMarks = markPercentages.length > 0 ? Math.min(...markPercentages) : 0;
        const passRate = marks.length > 0 ? (marks.filter(mark => mark.percentage >= 40).length / marks.length) * 100 : 0;

        return {
          totalStudents,
          averageMarks,
          highestMarks,
          lowestMarks,
          passRate
        };
      } catch (error) {
        throw new Error(`Error fetching class analytics: ${error.message}`);
      }
    }
  },

  Mutation: {
    // Authentication
    login: async (_, { input }) => {
      try {
        const { email, password } = input;
        const user = await Teacher.findOne({ email, isActive: true });

        if (!user) {
          throw new AuthenticationError('Invalid email or password');
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          throw new AuthenticationError('Invalid email or password');
        }

        const token = generateToken(user._id);

        return {
          token,
          user
        };
      } catch (error) {
        throw new Error(`Login error: ${error.message}`);
      }
    },

    registerTeacher: async (_, { input }, { user }) => {
      requireAdmin(user);
      try {
        const { name, email, password, subject, phone, role } = input;

        // Check if teacher already exists
        const existingTeacher = await Teacher.findOne({ email });
        if (existingTeacher) {
          throw new UserInputError('Teacher with this email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create new teacher
        const newTeacher = new Teacher({
          name,
          email,
          password: hashedPassword,
          subject,
          phone,
          role: role || 'teacher'
        });

        await newTeacher.save();

        const token = generateToken(newTeacher._id);

        return {
          token,
          user: newTeacher
        };
      } catch (error) {
        throw new Error(`Registration error: ${error.message}`);
      }
    },

    // Student Mutations
    addStudent: async (_, { input }, { user }) => {
      requireAuth(user);
      try {
        // Check if student with same roll number exists
        const existingStudent = await Student.findOne({ rollNumber: input.rollNumber });
        if (existingStudent) {
          throw new UserInputError('Student with this roll number already exists');
        }

        // Check if student with same email exists
        const existingEmail = await Student.findOne({ email: input.email });
        if (existingEmail) {
          throw new UserInputError('Student with this email already exists');
        }

        const newStudent = new Student(input);
        await newStudent.save();
        return newStudent;
      } catch (error) {
        throw new Error(`Error adding student: ${error.message}`);
      }
    },

    updateStudent: async (_, { id, input }, { user }) => {
      requireAuth(user);
      try {
        const student = await Student.findById(id);
        if (!student) {
          throw new UserInputError('Student not found');
        }

        // Check for duplicate roll number if updating
        if (input.rollNumber && input.rollNumber !== student.rollNumber) {
          const existingStudent = await Student.findOne({ rollNumber: input.rollNumber });
          if (existingStudent) {
            throw new UserInputError('Student with this roll number already exists');
          }
        }

        // Check for duplicate email if updating
        if (input.email && input.email !== student.email) {
          const existingEmail = await Student.findOne({ email: input.email });
          if (existingEmail) {
            throw new UserInputError('Student with this email already exists');
          }
        }

        const updatedStudent = await Student.findByIdAndUpdate(id, input, { new: true });
        return updatedStudent;
      } catch (error) {
        throw new Error(`Error updating student: ${error.message}`);
      }
    },

    deleteStudent: async (_, { id }, { user }) => {
      requireAdmin(user);
      try {
        const student = await Student.findById(id);
        if (!student) {
          throw new UserInputError('Student not found');
        }

        // Soft delete - set isActive to false
        await Student.findByIdAndUpdate(id, { isActive: false });
        
        return true;
      } catch (error) {
        throw new Error(`Error deleting student: ${error.message}`);
      }
    },

    // Marks Mutations
    addMarks: async (_, { input }, { user }) => {
      requireAuth(user);
      try {
        const student = await Student.findById(input.studentId);
        if (!student) {
          throw new UserInputError('Student not found');
        }

        const newMarks = new Marks({
          ...input,
          student: input.studentId,
          enteredBy: user._id
        });

        await newMarks.save();
        return await Marks.findById(newMarks._id)
          .populate('student')
          .populate('enteredBy');
      } catch (error) {
        throw new Error(`Error adding marks: ${error.message}`);
      }
    },

    updateMarks: async (_, { id, input }, { user }) => {
      requireAuth(user);
      try {
        const marks = await Marks.findById(id);
        if (!marks) {
          throw new UserInputError('Marks not found');
        }

        // Teachers can only update their own entries, admins can update any
        if (user.role !== 'admin' && marks.enteredBy.toString() !== user._id.toString()) {
          throw new ForbiddenError('You can only update marks you entered');
        }

        const updatedMarks = await Marks.findByIdAndUpdate(id, input, { new: true })
          .populate('student')
          .populate('enteredBy');

        return updatedMarks;
      } catch (error) {
        throw new Error(`Error updating marks: ${error.message}`);
      }
    },

    deleteMarks: async (_, { id }, { user }) => {
      requireAuth(user);
      try {
        const marks = await Marks.findById(id);
        if (!marks) {
          throw new UserInputError('Marks not found');
        }

        // Teachers can only delete their own entries, admins can delete any
        if (user.role !== 'admin' && marks.enteredBy.toString() !== user._id.toString()) {
          throw new ForbiddenError('You can only delete marks you entered');
        }

        await Marks.findByIdAndDelete(id);
        return true;
      } catch (error) {
        throw new Error(`Error deleting marks: ${error.message}`);
      }
    },

    // Teacher Mutations
    updateProfile: async (_, { input }, { user }) => {
      requireAuth(user);
      try {
        // Check for duplicate email if updating
        if (input.email && input.email !== user.email) {
          const existingTeacher = await Teacher.findOne({ email: input.email });
          if (existingTeacher) {
            throw new UserInputError('Teacher with this email already exists');
          }
        }

        const updatedTeacher = await Teacher.findByIdAndUpdate(user._id, input, { new: true });
        return updatedTeacher;
      } catch (error) {
        throw new Error(`Error updating profile: ${error.message}`);
      }
    }
  },

  // Field Resolvers
  Student: {
    marks: async (parent) => {
      return await Marks.find({ student: parent._id })
        .populate('enteredBy')
        .sort({ examDate: -1 });
    }
  }
};

module.exports = resolvers;
