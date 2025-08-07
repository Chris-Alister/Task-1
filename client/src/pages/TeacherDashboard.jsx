import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, BarChart3, Download, Edit, Trash2, Eye } from 'lucide-react';
import AddMarksModal from '../components/AddMarksModal';
import EditMarksModal from '../components/EditMarksModal';
import MarksDetailsModal from '../components/MarksDetailsModal';

const TeacherDashboard = () => {
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMarks, setSelectedMarks] = useState(null);
  const [filters, setFilters] = useState({
    subject: '',
    examType: '',
    academicYear: new Date().getFullYear().toString()
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      const [studentsResponse, marksResponse] = await Promise.all([
        axios.get('/api/teacher/students'),
        axios.get('/api/teacher/marks', { params: filters })
      ]);
      
      setStudents(studentsResponse.data.data);
      setMarks(marksResponse.data.data);
    } catch (error) {
      toast.error('Failed to fetch data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMarks = async (marksData) => {
    try {
      await axios.post('/api/teacher/add-marks', marksData);
      toast.success('Marks added successfully');
      setShowAddModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add marks');
    }
  };

  const handleEditMarks = async (marksData) => {
    try {
      await axios.put(`/api/teacher/marks/${selectedMarks._id}`, marksData);
      toast.success('Marks updated successfully');
      setShowEditModal(false);
      setSelectedMarks(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update marks');
    }
  };

  const handleDeleteMarks = async (marksId) => {
    if (!window.confirm('Are you sure you want to delete these marks?')) {
      return;
    }

    try {
      await axios.delete(`/api/teacher/marks/${marksId}`);
      toast.success('Marks deleted successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete marks');
    }
  };

  const handleDownloadMarks = async (studentId, studentName) => {
    try {
      const response = await axios.get(`/api/teacher/students/${studentId}/download-marks`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${studentName.replace(/\s+/g, '_')}_marks.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Marks downloaded successfully');
    } catch (error) {
      toast.error('Failed to download marks');
      console.error('Error downloading marks:', error);
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
      const student = students.find(s => s._id === studentObj);
      return student ? student.name : 'Unknown Student';
    }
    return studentObj.name || 'Unknown Student';
  };

  // Download all marks for each unique student
  const handleDownloadAll = async () => {
    // Get unique students from marks
    const uniqueStudents = Array.from(
      marks.reduce((map, mark) => {
        if (mark.student && mark.student._id) {
          map.set(mark.student._id, mark.student);
        }
        return map;
      }, new Map()).values()
    );
    for (const student of uniqueStudents) {
      await handleDownloadMarks(student._id, student.name);
    }
    toast.success('All student mark sheets downloaded');
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
              className="bg-white text-green-600 hover:bg-gray-100 font-medium px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Download className="h-5 w-5" />
              <span>Download All</span>
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
              <p className="text-3xl font-bold">{marks.length}</p>
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
              <p className="text-3xl font-bold">{students.length}</p>
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
              {marks.map((mark) => (
                <tr key={mark._id} className="hover:bg-gray-50 transition-colors">
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
                        onClick={() => handleDeleteMarks(mark._id)}
                        className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-colors"
                        title="Delete Marks"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadMarks(mark.student?._id, mark.student?.name || 'Unknown Student')}
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
          
          {marks.length === 0 && (
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
          students={students}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddMarks}
        />
      )}

      {showEditModal && selectedMarks && (
        <EditMarksModal
          marks={selectedMarks}
          students={students}
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