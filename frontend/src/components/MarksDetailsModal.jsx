import React from 'react';
import { X, User, BookOpen, Calendar, Hash, Award } from 'lucide-react';

const MarksDetailsModal = ({ marks, studentName, onClose }) => {
  const getGradeColor = (grade) => {
    if (grade === 'A+' || grade === 'A' || grade === 'A-') return 'text-green-600';
    if (grade === 'B+' || grade === 'B' || grade === 'B-') return 'text-blue-600';
    if (grade === 'C+' || grade === 'C' || grade === 'C-') return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Marks Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Student</p>
              <p className="font-medium text-gray-900">{studentName}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <BookOpen className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Subject</p>
              <p className="font-medium text-gray-900">{marks.subject}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Exam Type</p>
              <p className="font-medium text-gray-900">{marks.examType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Semester</p>
              <p className="font-medium text-gray-900">{marks.semester}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Marks Obtained</p>
              <p className="font-medium text-gray-900">{marks.marks}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Marks</p>
              <p className="font-medium text-gray-900">{marks.totalMarks}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Percentage</p>
              <p className="font-medium text-gray-900">{marks.percentage?.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Grade</p>
              <p className={`font-medium ${getGradeColor(marks.grade)}`}>
                {marks.grade}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Exam Date</p>
              <p className="font-medium text-gray-900">
                {new Date(marks.examDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Hash className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Academic Year</p>
              <p className="font-medium text-gray-900">{marks.academicYear}</p>
            </div>
          </div>

          {marks.remarks && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Remarks</p>
              <p className="font-medium text-gray-900 bg-gray-50 p-3 rounded-lg">
                {marks.remarks}
              </p>
            </div>
          )}

          <div className="pt-4">
            <button
              onClick={onClose}
              className="w-full btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarksDetailsModal; 