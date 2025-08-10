import { gql } from '@apollo/client';

// Marks Queries
export const GET_ALL_MARKS = gql`
  query GetAllMarks {
    allMarks {
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
      createdAt
      updatedAt
      student {
        id
        name
        rollNumber
        className
        section
      }
      enteredBy {
        id
        name
        subject
      }
    }
  }
`;

export const GET_STUDENT_MARKS = gql`
  query GetStudentMarks($studentId: ID!) {
    studentMarks(studentId: $studentId) {
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
      createdAt
      updatedAt
      student {
        id
        name
        rollNumber
        className
        section
      }
      enteredBy {
        id
        name
        subject
      }
    }
  }
`;

export const GET_MARKS_BY_SUBJECT = gql`
  query GetMarksBySubject($subject: String!) {
    marksBySubject(subject: $subject) {
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
      student {
        id
        name
        rollNumber
        className
        section
      }
      enteredBy {
        id
        name
        subject
      }
    }
  }
`;

export const GET_MARKS_BY_EXAM_TYPE = gql`
  query GetMarksByExamType($examType: String!) {
    marksByExamType(examType: $examType) {
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
      student {
        id
        name
        rollNumber
        className
        section
      }
      enteredBy {
        id
        name
        subject
      }
    }
  }
`;

// Marks Mutations
export const ADD_MARKS_MUTATION = gql`
  mutation AddMarks($input: MarksInput!) {
    addMarks(input: $input) {
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
      createdAt
      updatedAt
      student {
        id
        name
        rollNumber
        className
        section
      }
      enteredBy {
        id
        name
        subject
      }
    }
  }
`;

export const UPDATE_MARKS_MUTATION = gql`
  mutation UpdateMarks($id: ID!, $input: UpdateMarksInput!) {
    updateMarks(id: $id, input: $input) {
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
      createdAt
      updatedAt
      student {
        id
        name
        rollNumber
        className
        section
      }
      enteredBy {
        id
        name
        subject
      }
    }
  }
`;

export const DELETE_MARKS_MUTATION = gql`
  mutation DeleteMarks($id: ID!) {
    deleteMarks(id: $id)
  }
`;
