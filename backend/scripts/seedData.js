const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Marks = require('../models/Marks');

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-mark-system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await Teacher.deleteMany({});
    await Student.deleteMany({});
    await Marks.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('password123', 10);
    const admin = new Teacher({
      name: 'Admin User',
      email: 'admin@school.com',
      password: adminPassword,
      subject: 'Administration',
      phone: '+1234567890',
      role: 'admin',
      isActive: true
    });
    await admin.save();
    console.log('✅ Admin user created');

    // Create teacher user
    const teacherPassword = await bcrypt.hash('password123', 10);
    const teacher = new Teacher({
      name: 'John Smith',
      email: 'teacher@school.com',
      password: teacherPassword,
      subject: 'Mathematics',
      phone: '+1234567891',
      role: 'teacher',
      isActive: true
    });
    await teacher.save();
    console.log('✅ Teacher user created');

    // Create sample students
    const students = [
      {
        name: 'Alice Johnson',
        rollNumber: '2024001',
        className: '10th',
        section: 'A',
        email: 'alice.johnson@student.com',
        phone: '+1234567892',
        address: '123 Main St, City, State',
        dateOfBirth: new Date('2006-05-15'),
        gender: 'Female'
      },
      {
        name: 'Bob Wilson',
        rollNumber: '2024002',
        className: '10th',
        section: 'A',
        email: 'bob.wilson@student.com',
        phone: '+1234567893',
        address: '456 Oak Ave, City, State',
        dateOfBirth: new Date('2006-08-22'),
        gender: 'Male'
      },
      {
        name: 'Carol Davis',
        rollNumber: '2024003',
        className: '10th',
        section: 'B',
        email: 'carol.davis@student.com',
        phone: '+1234567894',
        address: '789 Pine Rd, City, State',
        dateOfBirth: new Date('2006-03-10'),
        gender: 'Female'
      },
      {
        name: 'David Brown',
        rollNumber: '2024004',
        className: '10th',
        section: 'B',
        email: 'david.brown@student.com',
        phone: '+1234567895',
        address: '321 Elm St, City, State',
        dateOfBirth: new Date('2006-11-05'),
        gender: 'Male'
      },
      {
        name: 'Eva Garcia',
        rollNumber: '2024005',
        className: '11th',
        section: 'A',
        email: 'eva.garcia@student.com',
        phone: '+1234567896',
        address: '654 Maple Dr, City, State',
        dateOfBirth: new Date('2005-07-18'),
        gender: 'Female'
      }
    ];

    for (const studentData of students) {
      const student = new Student(studentData);
      await student.save();
    }
    console.log(`✅ ${students.length} sample students created`);

    // Create sample marks data
    const savedStudents = await Student.find();
    const savedTeacher = await Teacher.findOne({ role: 'teacher' });

    const marksData = [
      // Alice Johnson marks
      {
        student: savedStudents[0]._id,
        subject: 'Mathematics',
        examType: 'Midterm',
        marks: 85,
        totalMarks: 100,
        examDate: new Date('2024-03-15'),
        academicYear: '2024',
        semester: '1st',
        remarks: 'Good performance',
        enteredBy: savedTeacher._id
      },
      {
        student: savedStudents[0]._id,
        subject: 'Physics',
        examType: 'Midterm',
        marks: 78,
        totalMarks: 100,
        examDate: new Date('2024-03-20'),
        academicYear: '2024',
        semester: '1st',
        remarks: 'Needs improvement in problem solving',
        enteredBy: savedTeacher._id
      },
      // Bob Wilson marks
      {
        student: savedStudents[1]._id,
        subject: 'Mathematics',
        examType: 'Midterm',
        marks: 92,
        totalMarks: 100,
        examDate: new Date('2024-03-15'),
        academicYear: '2024',
        semester: '1st',
        remarks: 'Excellent work',
        enteredBy: savedTeacher._id
      },
      {
        student: savedStudents[1]._id,
        subject: 'Physics',
        examType: 'Final',
        marks: 88,
        totalMarks: 100,
        examDate: new Date('2024-05-20'),
        academicYear: '2024',
        semester: '1st',
        remarks: 'Very good understanding',
        enteredBy: savedTeacher._id
      },
      // Carol Davis marks
      {
        student: savedStudents[2]._id,
        subject: 'Mathematics',
        examType: 'Quiz',
        marks: 75,
        totalMarks: 100,
        examDate: new Date('2024-02-10'),
        academicYear: '2024',
        semester: '1st',
        remarks: 'Average performance',
        enteredBy: savedTeacher._id
      },
      // David Brown marks
      {
        student: savedStudents[3]._id,
        subject: 'Mathematics',
        examType: 'Midterm',
        marks: 95,
        totalMarks: 100,
        examDate: new Date('2024-03-15'),
        academicYear: '2024',
        semester: '1st',
        remarks: 'Outstanding performance',
        enteredBy: savedTeacher._id
      },
      // Eva Garcia marks
      {
        student: savedStudents[4]._id,
        subject: 'Chemistry',
        examType: 'Final',
        marks: 82,
        totalMarks: 100,
        examDate: new Date('2024-05-25'),
        academicYear: '2024',
        semester: '1st',
        remarks: 'Good lab work',
        enteredBy: savedTeacher._id
      }
    ];

    for (const markData of marksData) {
      const mark = new Marks(markData);
      await mark.save();
    }
    console.log(`✅ ${marksData.length} sample marks created`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Admin: admin@school.com / password123');
    console.log('Teacher: teacher@school.com / password123');
    console.log('\n👥 Sample Students:');
    students.forEach(student => {
      console.log(`- ${student.name} (${student.rollNumber}) - ${student.className}-${student.section}`);
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the seeding
seedData(); 