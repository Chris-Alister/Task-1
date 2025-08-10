import { gql } from '@apollo/client';

// Authentication Queries & Mutations
export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        name
        email
        subject
        role
      }
    }
  }
`;

export const REGISTER_TEACHER_MUTATION = gql`
  mutation RegisterTeacher($input: TeacherInput!) {
    registerTeacher(input: $input) {
      token
      user {
        id
        name
        email
        subject
        role
      }
    }
  }
`;

export const GET_ME_QUERY = gql`
  query GetMe {
    me {
      id
      name
      email
      subject
      phone
      role
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($input: UpdateTeacherInput!) {
    updateProfile(input: $input) {
      id
      name
      email
      subject
      phone
      role
    }
  }
`;
