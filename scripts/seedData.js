const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

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