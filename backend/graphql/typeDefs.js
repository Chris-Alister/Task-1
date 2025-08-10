const typeDefs = `
  scalar Date

  type Student {
    id: ID!
    name: String!
    rollNumber: String!
    className: String!
    section: String!
    email: String!
    phone: String
    address: String
    dateOfBirth: Date
    gender: String!
    admissionDate: Date!
    isActive: Boolean!
    createdAt: Date!
    updatedAt: Date!
    marks: [Marks!]
  }

  type Teacher {
    id: ID!
    name: String!
    email: String!
    subject: String!
    phone: String
    isActive: Boolean!
    role: String!
    createdAt: Date!
    updatedAt: Date!
  }

  type Marks {
    id: ID!
    student: Student!
    subject: String!
    examType: String!
    marks: Float!
    totalMarks: Float!
    percentage: Float
    grade: String
    examDate: Date!
    academicYear: String!
    semester: String!
    remarks: String
    enteredBy: Teacher!
    createdAt: Date!
    updatedAt: Date!
  }

  type AuthPayload {
    token: String!
    user: Teacher!
  }

  input StudentInput {
    name: String!
    rollNumber: String!
    className: String!
    section: String!
    email: String!
    phone: String
    address: String
    dateOfBirth: Date
    gender: String!
  }

  input UpdateStudentInput {
    name: String
    rollNumber: String
    className: String
    section: String
    email: String
    phone: String
    address: String
    dateOfBirth: Date
    gender: String
    isActive: Boolean
  }

  input MarksInput {
    studentId: ID!
    subject: String!
    examType: String!
    marks: Float!
    totalMarks: Float!
    examDate: Date
    academicYear: String!
    semester: String!
    remarks: String
  }

  input UpdateMarksInput {
    subject: String
    examType: String
    marks: Float
    totalMarks: Float
    examDate: Date
    academicYear: String
    semester: String
    remarks: String
  }

  input TeacherInput {
    name: String!
    email: String!
    password: String!
    subject: String!
    phone: String
    role: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type Query {
    # Student Queries
    students: [Student!]!
    student(id: ID!): Student
    studentByRollNumber(rollNumber: String!): Student

    # Marks Queries
    allMarks: [Marks!]!
    studentMarks(studentId: ID!): [Marks!]!
    marksBySubject(subject: String!): [Marks!]!
    marksByExamType(examType: String!): [Marks!]!

    # Teacher Queries
    teachers: [Teacher!]!
    teacher(id: ID!): Teacher
    me: Teacher

    # Analytics
    classAnalytics(className: String!): ClassAnalytics
  }

  type Mutation {
    # Authentication
    login(input: LoginInput!): AuthPayload!
    registerTeacher(input: TeacherInput!): AuthPayload!

    # Student Mutations
    addStudent(input: StudentInput!): Student!
    updateStudent(id: ID!, input: UpdateStudentInput!): Student!
    deleteStudent(id: ID!): Boolean!

    # Marks Mutations
    addMarks(input: MarksInput!): Marks!
    updateMarks(id: ID!, input: UpdateMarksInput!): Marks!
    deleteMarks(id: ID!): Boolean!

    # Teacher Mutations
    updateProfile(input: UpdateTeacherInput!): Teacher!
  }

  input UpdateTeacherInput {
    name: String
    email: String
    subject: String
    phone: String
  }

  type ClassAnalytics {
    totalStudents: Int!
    averageMarks: Float
    highestMarks: Float
    lowestMarks: Float
    passRate: Float
  }
`;

module.exports = typeDefs;
