import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import toast from 'react-hot-toast';
import { Plus, Users, Trash2, Edit, Eye } from 'lucide-react';
import AddStudentModal from '../components/AddStudentModal';
import EditStudentModal from '../components/EditStudentModal';
import StudentDetailsModal from '../components/StudentDetailsModal';
import { GET_ALL_STUDENTS, DELETE_STUDENT_MUTATION, ADD_STUDENT_MUTATION, UPDATE_STUDENT_MUTATION } from '../graphql/students';

const AdminDashboard = () => {
  const [allStudents, setAllStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filters, setFilters] = useState({
    className: '',
    section: ''
  });

  // GraphQL queries and mutations
  const { data, loading, error, refetch } = useQuery(GET_ALL_STUDENTS, {
    onCompleted: (data) => {
      setAllStudents(data.students);
      setFilteredStudents(data.students);
    },
    onError: (error) => {
      toast.error('Failed to fetch students');
      console.error('Error fetching students:', error);
    }
  });

  const [deleteStudent] = useMutation(DELETE_STUDENT_MUTATION, {
    update(cache, { data: { deleteStudent: success } }, { variables: { id } }) {
      if (success) {
        try {
          const existingStudents = cache.readQuery({ query: GET_ALL_STUDENTS });
          cache.writeQuery({
            query: GET_ALL_STUDENTS,
            data: {
              students: existingStudents.students.filter(student => student.id !== id)
            }
          });
          // Also update local state
          setAllStudents(prev => prev.filter(student => student.id !== id));
          setFilteredStudents(prev => prev.filter(student => student.id !== id));
        } catch (error) {
          console.error('Error updating cache after deleting student:', error);
        }
      }
    },
    onCompleted: () => {
      toast.success('Student deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete student');
      console.error('Error deleting student:', error);
    }
  });

  const [addStudent] = useMutation(ADD_STUDENT_MUTATION, {
    update(cache, { data: { addStudent } }) {
      try {
        const existingStudents = cache.readQuery({ query: GET_ALL_STUDENTS });
        cache.writeQuery({
          query: GET_ALL_STUDENTS,
          data: {
            students: [...existingStudents.students, addStudent]
          }
        });
        // Also update local state
        setAllStudents(prev => [...prev, addStudent]);
        setFilteredStudents(prev => {
          const newList = [...prev, addStudent];
          // Apply current filters
          let filtered = newList;
          if (filters.className && filters.className !== 'All Classes') {
            filtered = filtered.filter(student => student.className === filters.className);
          }
          if (filters.section && filters.section !== 'All Sections') {
            filtered = filtered.filter(student => student.section === filters.section);
          }
          return filtered;
        });
      } catch (error) {
        console.error('Error updating cache after adding student:', error);
      }
    },
    onCompleted: () => {
      toast.success('Student added successfully');
      setShowAddModal(false);
    },
    onError: (error) => {
      toast.error('Failed to add student');
      console.error('Error adding student:', error);
    }
  });

  const [updateStudent] = useMutation(UPDATE_STUDENT_MUTATION, {
    update(cache, { data: { updateStudent } }) {
      try {
        const existingStudents = cache.readQuery({ query: GET_ALL_STUDENTS });
        cache.writeQuery({
          query: GET_ALL_STUDENTS,
          data: {
            students: existingStudents.students.map(student =>
              student.id === updateStudent.id ? updateStudent : student
            )
          }
        });
        // Also update local state
        setAllStudents(prev => prev.map(student =>
          student.id === updateStudent.id ? updateStudent : student
        ));
        setFilteredStudents(prev => {
          const updated = prev.map(student =>
            student.id === updateStudent.id ? updateStudent : student
          );
          // Apply current filters
          let filtered = updated;
          if (filters.className && filters.className !== 'All Classes') {
            filtered = filtered.filter(student => student.className === filters.className);
          }
          if (filters.section && filters.section !== 'All Sections') {
            filtered = filtered.filter(student => student.section === filters.section);
          }
          return filtered;
        });
      } catch (error) {
        console.error('Error updating cache after updating student:', error);
      }
    },
    onCompleted: () => {
      toast.success('Student updated successfully');
      setShowEditModal(false);
      setSelectedStudent(null);
    },
    onError: (error) => {
      toast.error('Failed to update student');
      console.error('Error updating student:', error);
    }
  });

  // Filter students based on filters
  useEffect(() => {
    let filtered = allStudents;
    
    if (filters.className && filters.className !== 'All Classes') {
      filtered = filtered.filter(student => student.className === filters.className);
    }
    
    if (filters.section && filters.section !== 'All Sections') {
      filtered = filtered.filter(student => student.section === filters.section);
    }
    
    setFilteredStudents(filtered);
  }, [allStudents, filters]);

  const handleAddStudent = async (studentData) => {
    try {
      await addStudent({
        variables: { input: studentData }
      });
    } catch (error) {
      // Error is handled in the mutation onError callback
    }
  };

  const handleEditStudent = async (studentData) => {
    try {
      await updateStudent({
        variables: { 
          id: selectedStudent.id,
          input: studentData 
        }
      });
    } catch (error) {
      // Error is handled in the mutation onError callback
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student?')) {
      return;
    }

    try {
      await deleteStudent({
        variables: { id: studentId }
      });
    } catch (error) {
      // Error is handled in the mutation onError callback
    }
  };

  const openEditModal = (student) => {
    setSelectedStudent(student);
    setShowEditModal(true);
  };

  const openDetailsModal = (student) => {
    setSelectedStudent(student);
    setShowDetailsModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold">Student Management</h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-white text-blue-600 hover:bg-gray-100 font-medium px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <Users className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <p className="text-blue-100 text-sm font-medium">Total Students</p>
              <p className="text-3xl font-bold">{filteredStudents.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <Users className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <p className="text-purple-100 text-sm font-medium">Classes</p>
              <p className="text-3xl font-bold">{[...new Set(filteredStudents.map(s => s.className))].length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Filter Students</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class
            </label>
            <select
              value={filters.className}
              onChange={(e) => setFilters({ ...filters, className: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            >
              <option value="">All Classes</option>
              {[...new Set(allStudents.map(s => s.className).filter(Boolean))].sort().map(className => (
                <option key={className} value={className}>{className}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section
            </label>
            <select
              value={filters.section}
              onChange={(e) => setFilters({ ...filters, section: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            >
              <option value="">All Sections</option>
              {[...new Set(allStudents.map(s => s.section).filter(Boolean))].sort().map(section => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setFilters({ className: '', section: '' })}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">All Students</h2>
          <p className="text-gray-600 text-sm">Click on actions to view, edit, or delete students</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{student.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.rollNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {student.className}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {student.section}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => openDetailsModal(student)}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-2 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(student)}
                        className="bg-green-100 hover:bg-green-200 text-green-600 p-2 rounded-lg transition-colors"
                        title="Edit Student"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student.id)}
                        className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-colors"
                        title="Delete Student"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
              <p className="text-gray-500 mb-4">Get started by adding your first student to the system</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Add First Student
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddStudentModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddStudent}
        />
      )}

      {showEditModal && selectedStudent && (
        <EditStudentModal
          student={selectedStudent}
          onClose={() => {
            setShowEditModal(false);
            setSelectedStudent(null);
          }}
          onSubmit={handleEditStudent}
        />
      )}

      {showDetailsModal && selectedStudent && (
        <StudentDetailsModal
          student={selectedStudent}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedStudent(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard; 