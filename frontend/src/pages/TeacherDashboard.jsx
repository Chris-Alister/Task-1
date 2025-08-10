import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import toast from 'react-hot-toast';
import { Plus, BarChart3, Download, Edit, Trash2, Eye } from 'lucide-react';
import * as XLSX from 'xlsx';
import AddMarksModal from '../components/AddMarksModal';
import EditMarksModal from '../components/EditMarksModal';
import MarksDetailsModal from '../components/MarksDetailsModal';
import { GET_ALL_STUDENTS } from '../graphql/students';
import { GET_ALL_MARKS, ADD_MARKS_MUTATION, UPDATE_MARKS_MUTATION, DELETE_MARKS_MUTATION } from '../graphql/marks';

const TeacherDashboard = () => {
  const [allStudents, setAllStudents] = useState([]);
  const [allMarks, setAllMarks] = useState([]);
  const [filteredMarks, setFilteredMarks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMarks, setSelectedMarks] = useState(null);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadingCombined, setDownloadingCombined] = useState(false);
  const [filters, setFilters] = useState({
    subject: '',
    examType: '',
    academicYear: '' // Show all years by default
  });

  // GraphQL queries
  const { data: studentsData, loading: studentsLoading, error: studentsError } = useQuery(GET_ALL_STUDENTS, {
    onCompleted: (data) => {
      setAllStudents(data.students);
    },
    onError: (error) => {
      toast.error('Failed to fetch students');
      console.error('Error fetching students:', error);
    }
  });

  const { data: marksData, loading: marksLoading, error: marksError, refetch: refetchMarks } = useQuery(GET_ALL_MARKS, {
    onCompleted: (data) => {
      setAllMarks(data.allMarks);
      setFilteredMarks(data.allMarks);
    },
    onError: (error) => {
      toast.error('Failed to fetch marks');
      console.error('Error fetching marks:', error);
    }
  });

  // GraphQL mutations
  const [addMarks] = useMutation(ADD_MARKS_MUTATION, {
    update: (cache, { data }) => {
      if (data?.addMarks) {
        try {
          // Update the cache immediately
          const existingMarks = cache.readQuery({ query: GET_ALL_MARKS });
          if (existingMarks) {
            cache.writeQuery({
              query: GET_ALL_MARKS,
              data: {
                allMarks: [...existingMarks.allMarks, data.addMarks]
              }
            });
          }
        } catch (error) {
          console.log('Cache update error (will refetch):', error);
        }
      }
    },
    refetchQueries: [{ query: GET_ALL_MARKS }],
    onCompleted: (data) => {
      if (data?.addMarks) {
        // Update local state immediately
        setAllMarks(prev => [...prev, data.addMarks]);
        setFilteredMarks(prev => {
          const newMarks = [...prev, data.addMarks];
          // Apply current filters to the new marks array
          let filtered = newMarks;
          
          if (filters.subject && filters.subject !== '') {
            filtered = filtered.filter(mark => mark.subject.toLowerCase().includes(filters.subject.toLowerCase()));
          }
          
          if (filters.examType && filters.examType !== 'All Types') {
            filtered = filtered.filter(mark => mark.examType === filters.examType);
          }
          
          if (filters.academicYear && filters.academicYear !== '') {
            filtered = filtered.filter(mark => mark.academicYear === filters.academicYear);
          }
          
          return filtered;
        });
      }
      toast.success('Marks added successfully');
      setShowAddModal(false);
    },
    onError: (error) => {
      toast.error('Failed to add marks');
      console.error('Error adding marks:', error);
    }
  });

  const [updateMarks] = useMutation(UPDATE_MARKS_MUTATION, {
    update: (cache, { data }) => {
      if (data?.updateMarks) {
        // Update the cache immediately
        const existingMarks = cache.readQuery({ query: GET_ALL_MARKS });
        if (existingMarks) {
          const updatedMarks = existingMarks.allMarks.map(mark => 
            mark.id === data.updateMarks.id ? data.updateMarks : mark
          );
          cache.writeQuery({
            query: GET_ALL_MARKS,
            data: {
              allMarks: updatedMarks
            }
          });
        }
      }
    },
    onCompleted: (data) => {
      if (data?.updateMarks) {
        // Update local state immediately
        setAllMarks(prev => prev.map(mark => 
          mark.id === data.updateMarks.id ? data.updateMarks : mark
        ));
        setFilteredMarks(prev => {
          const updatedMarks = prev.map(mark => 
            mark.id === data.updateMarks.id ? data.updateMarks : mark
          );
          // Apply current filters to ensure consistency
          let filtered = updatedMarks;
          
          if (filters.subject && filters.subject !== '') {
            filtered = filtered.filter(mark => mark.subject.toLowerCase().includes(filters.subject.toLowerCase()));
          }
          
          if (filters.examType && filters.examType !== 'All Types') {
            filtered = filtered.filter(mark => mark.examType === filters.examType);
          }
          
          if (filters.academicYear && filters.academicYear !== '') {
            filtered = filtered.filter(mark => mark.academicYear === filters.academicYear);
          }
          
          return filtered;
        });
      }
      toast.success('Marks updated successfully');
      setShowEditModal(false);
      setSelectedMarks(null);
    },
    onError: (error) => {
      toast.error('Failed to update marks');
      console.error('Error updating marks:', error);
      console.error('Error details:', error.graphQLErrors);
      console.error('Network error:', error.networkError);
    }
  });

  const [deleteMarks] = useMutation(DELETE_MARKS_MUTATION, {
    update: (cache, { data }, { variables }) => {
      if (data && variables?.id) {
        // Update the cache immediately
        const existingMarks = cache.readQuery({ query: GET_ALL_MARKS });
        if (existingMarks) {
          const filteredMarks = existingMarks.allMarks.filter(mark => mark.id !== variables.id);
          cache.writeQuery({
            query: GET_ALL_MARKS,
            data: {
              allMarks: filteredMarks
            }
          });
        }
      }
    },
    onCompleted: (data, { variables }) => {
      if (data && variables?.id) {
        // Update local state immediately
        setAllMarks(prev => prev.filter(mark => mark.id !== variables.id));
        setFilteredMarks(prev => prev.filter(mark => mark.id !== variables.id));
      }
      toast.success('Marks deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete marks');
      console.error('Error deleting marks:', error);
    }
  });

  const loading = studentsLoading || marksLoading;

  // Filter marks based on filters
  useEffect(() => {
    let filtered = allMarks;
    
    if (filters.subject && filters.subject !== '') {
      filtered = filtered.filter(mark => mark.subject.toLowerCase().includes(filters.subject.toLowerCase()));
    }
    
    if (filters.examType && filters.examType !== 'All Types') {
      filtered = filtered.filter(mark => mark.examType === filters.examType);
    }
    
    if (filters.academicYear && filters.academicYear !== '') {
      filtered = filtered.filter(mark => mark.academicYear === filters.academicYear);
    }
    
    setFilteredMarks(filtered);
  }, [allMarks, filters]);

  const handleAddMarks = async (marksData) => {
    try {
      await addMarks({
        variables: { input: marksData }
      });
    } catch (error) {
      // Error is handled in the mutation onError callback
    }
  };

  const handleEditMarks = async (marksData) => {
    try {
      // Filter out fields that shouldn't be in UpdateMarksInput
      const { studentId, ...updateInput } = marksData;
      
      await updateMarks({
        variables: { 
          id: selectedMarks.id,
          input: updateInput 
        }
      });
    } catch (error) {
      // Error is handled in the mutation onError callback
    }
  };

  const handleDeleteMarks = async (marksId) => {
    if (!window.confirm('Are you sure you want to delete these marks?')) {
      return;
    }

    try {
      await deleteMarks({
        variables: { id: marksId }
      });
    } catch (error) {
      // Error is handled in the mutation onError callback
    }
  };

  const handleDownloadMarks = async (studentId, studentName) => {
    try {
      // Filter marks for this specific student
      const studentMarks = allMarks.filter(mark => mark.student.id === studentId);
      
      if (studentMarks.length === 0) {
        toast.error(`No marks found for ${studentName}`);
        return;
      }

      // Prepare data for Excel
      const excelData = studentMarks.map(mark => ({
        'Student Name': mark.student.name,
        'Roll Number': mark.student.rollNumber,
        'Class': mark.student.className,
        'Section': mark.student.section,
        'Subject': mark.subject,
        'Exam Type': mark.examType,
        'Marks Obtained': mark.marks,
        'Total Marks': mark.totalMarks,
        'Percentage': mark.percentage,
        'Grade': mark.grade,
        'Academic Year': mark.academicYear,
        'Semester': mark.semester,
        'Exam Date': mark.examDate ? new Date(mark.examDate).toLocaleDateString() : '',
        'Entered By': mark.enteredBy?.name || '',
        'Remarks': mark.remarks || ''
      }));

      // Create a new workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Auto-size columns
      const columnWidths = Object.keys(excelData[0]).map(key => ({
        wch: Math.max(key.length, ...excelData.map(row => String(row[key]).length)) + 2
      }));
      worksheet['!cols'] = columnWidths;

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, `${studentName}_Marks`);

      // Generate file name
      const fileName = `${studentName.replace(/\s+/g, '_')}_marks_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Download the file
      XLSX.writeFile(workbook, fileName);

      toast.success(`${studentName}'s marks downloaded successfully`);
    } catch (error) {
      console.error('Error downloading marks:', error);
      toast.error(`Failed to download ${studentName}'s marks`);
      throw error;
    }
  };

  const openEditModal = (marks) => {
    setSelectedMarks(marks);
    setShowEditModal(true);
  };

  const openDetailsModal = (marks) => {
    setSelectedMarks(marks);
    setShowDetailsModal(true);
  };

  // Fix: get student name from populated object
  const getStudentName = (studentObj) => {
    if (!studentObj) return 'Unknown Student';
    if (typeof studentObj === 'string') {
      // fallback for legacy data
      const student = allStudents.find(s => s.id === studentObj);
      return student ? student.name : 'Unknown Student';
    }
    return studentObj.name || 'Unknown Student';
  };

  // Download all marks for each unique student
  const handleDownloadAll = async () => {
    if (allMarks.length === 0) {
      toast.error('No marks data available to download');
      return;
    }

    setDownloadingAll(true);
    try {
      // Get unique students from marks
      const uniqueStudents = Array.from(
        allMarks.reduce((map, mark) => {
          if (mark.student && mark.student.id) {
            map.set(mark.student.id, mark.student);
          }
          return map;
        }, new Map()).values()
      );

      let successCount = 0;
      let failedCount = 0;

      for (const student of uniqueStudents) {
        try {
          await handleDownloadMarks(student.id, student.name);
          successCount++;
          // Add a small delay between downloads to prevent browser limitations
          await new Promise(resolve => setTimeout(resolve, 800));
        } catch (error) {
          console.error(`Failed to download marks for ${student.name}:`, error);
          failedCount++;
        }
      }

      if (failedCount === 0) {
        toast.success(`All ${successCount} student mark sheets downloaded successfully`);
      } else {
        toast.error(`${successCount} downloaded successfully, ${failedCount} failed`);
      }
    } catch (error) {
      console.error('Error in handleDownloadAll:', error);
      toast.error('Failed to download all marks');
    } finally {
      setDownloadingAll(false);
    }
  };

  // Download all marks in one combined Excel file
  const handleDownloadAllInOne = async () => {
    if (allMarks.length === 0) {
      toast.error('No marks data available to download');
      return;
    }

    setDownloadingCombined(true);
    try {
      // Prepare data for Excel - all marks in one sheet
      const excelData = allMarks.map(mark => ({
        'Student Name': mark.student.name,
        'Roll Number': mark.student.rollNumber,
        'Class': mark.student.className,
        'Section': mark.student.section,
        'Subject': mark.subject,
        'Exam Type': mark.examType,
        'Marks Obtained': mark.marks,
        'Total Marks': mark.totalMarks,
        'Percentage': mark.percentage,
        'Grade': mark.grade,
        'Academic Year': mark.academicYear,
        'Semester': mark.semester,
        'Exam Date': mark.examDate ? new Date(mark.examDate).toLocaleDateString() : '',
        'Entered By': mark.enteredBy?.name || '',
        'Remarks': mark.remarks || ''
      }));

      // Sort by student name, then by subject
      excelData.sort((a, b) => {
        if (a['Student Name'] !== b['Student Name']) {
          return a['Student Name'].localeCompare(b['Student Name']);
        }
        return a['Subject'].localeCompare(b['Subject']);
      });

      // Create a new workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Auto-size columns
      const columnWidths = Object.keys(excelData[0]).map(key => ({
        wch: Math.max(key.length, ...excelData.map(row => String(row[key]).length)) + 2
      }));
      worksheet['!cols'] = columnWidths;

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'All Student Marks');

      // Generate file name
      const fileName = `all_students_marks_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Download the file
      XLSX.writeFile(workbook, fileName);

      toast.success('All students marks downloaded successfully');
    } catch (error) {
      console.error('Error downloading all marks:', error);
      toast.error('Failed to download all marks');
    } finally {
      setDownloadingCombined(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold">Marks Management</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDownloadAll}
              disabled={downloadingAll || downloadingCombined}
              className="bg-white text-green-600 hover:bg-gray-100 font-medium px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-5 w-5" />
              <span>{downloadingAll ? 'Downloading...' : 'Download All'}</span>
            </button>
            <button
              onClick={handleDownloadAllInOne}
              disabled={downloadingAll || downloadingCombined}
              className="bg-white text-purple-600 hover:bg-gray-100 font-medium px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-5 w-5" />
              <span>{downloadingCombined ? 'Downloading...' : 'Download Combined'}</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white text-blue-600 hover:bg-gray-100 font-medium px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Add Marks</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <BarChart3 className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <p className="text-green-100 text-sm font-medium">Total Marks</p>
              <p className="text-3xl font-bold">{filteredMarks.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <BarChart3 className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <p className="text-blue-100 text-sm font-medium">Students</p>
              <p className="text-3xl font-bold">{allStudents.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Filter Marks</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={filters.subject}
              onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
              placeholder="Enter subject name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exam Type
            </label>
            <select
              value={filters.examType}
              onChange={(e) => setFilters({ ...filters, examType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
            >
              <option value="">All Types</option>
              <option value="Midterm">Midterm</option>
              <option value="Final">Final</option>
              <option value="Quiz">Quiz</option>
              <option value="Assignment">Assignment</option>
              <option value="Project">Project</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Academic Year
            </label>
            <input
              type="text"
              value={filters.academicYear}
              onChange={(e) => setFilters({ ...filters, academicYear: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
              placeholder="e.g., 2024"
            />
          </div>
        </div>
      </div>

      {/* Marks Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Student Marks</h2>
          <p className="text-gray-600 text-sm">View, edit, and manage all student marks</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMarks.map((mark) => (
                <tr key={mark.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{getStudentName(mark.student)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {mark.subject}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                      {mark.examType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">{mark.marks}/{mark.totalMarks}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">{mark.percentage?.toFixed(1)}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      mark.grade === 'A+' || mark.grade === 'A' || mark.grade === 'A-' ? 'bg-green-100 text-green-800' :
                      mark.grade === 'B+' || mark.grade === 'B' || mark.grade === 'B-' ? 'bg-blue-100 text-blue-800' :
                      mark.grade === 'C+' || mark.grade === 'C' || mark.grade === 'C-' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {mark.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openDetailsModal(mark)}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-2 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(mark)}
                        className="bg-green-100 hover:bg-green-200 text-green-600 p-2 rounded-lg transition-colors"
                        title="Edit Marks"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMarks(mark.id)}
                        className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-colors"
                        title="Delete Marks"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadMarks(mark.student?.id, mark.student?.name || 'Unknown Student')}
                        className="bg-purple-100 hover:bg-purple-200 text-purple-600 p-2 rounded-lg transition-colors"
                        title="Download Marks"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredMarks.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No marks found</h3>
              <p className="text-gray-500 mb-4">Start by adding marks for your students</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Add First Marks
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddMarksModal
          students={allStudents}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddMarks}
        />
      )}

      {showEditModal && selectedMarks && (
        <EditMarksModal
          marks={selectedMarks}
          students={allStudents}
          onClose={() => {
            setShowEditModal(false);
            setSelectedMarks(null);
          }}
          onSubmit={handleEditMarks}
        />
      )}

      {showDetailsModal && selectedMarks && (
        <MarksDetailsModal
          marks={selectedMarks}
          studentName={getStudentName(selectedMarks.student)}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedMarks(null);
          }}
        />
      )}
    </div>
  );
};

export default TeacherDashboard; 