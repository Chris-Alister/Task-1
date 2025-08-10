import { gql } from '@apollo/client';

// Student Queries
export const GET_ALL_STUDENTS = gql`
  query GetAllStudents {
    students {
      id
      name
      rollNumber
      className
      section
      email
      phone
      address
      dateOfBirth
      gender
      admissionDate
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_STUDENT_BY_ID = gql`
  query GetStudentById($id: ID!) {
    student(id: $id) {
      id
      name
      rollNumber
      className
      section
      email
      phone
      address
      dateOfBirth
      gender
      admissionDate
      isActive
      createdAt
      updatedAt
      marks {
        id
        subject
        examType
        marks
        totalMarks
        percentage
        grade
        examDate
        academicYear
        semester
        remarks
        enteredBy {
          id
          name
        }
      }
    }
  }
`;

export const GET_STUDENT_BY_ROLL_NUMBER = gql`
  query GetStudentByRollNumber($rollNumber: String!) {
    studentByRollNumber(rollNumber: $rollNumber) {
      id
      name
      rollNumber
      className
      section
      email
      phone
      address
      dateOfBirth
      gender
      admissionDate
      isActive
    }
  }
`;

// Student Mutations
export const ADD_STUDENT_MUTATION = gql`
  mutation AddStudent($input: StudentInput!) {
    addStudent(input: $input) {
      id
      name
      rollNumber
      className
      section
      email
      phone
      address
      dateOfBirth
      gender
      admissionDate
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_STUDENT_MUTATION = gql`
  mutation UpdateStudent($id: ID!, $input: UpdateStudentInput!) {
    updateStudent(id: $id, input: $input) {
      id
      name
      rollNumber
      className
      section
      email
      phone
      address
      dateOfBirth
      gender
      admissionDate
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_STUDENT_MUTATION = gql`
  mutation DeleteStudent($id: ID!) {
    deleteStudent(id: $id)
  }
`;
