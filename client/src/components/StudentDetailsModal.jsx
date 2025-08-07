import React from 'react';
import { X, User, Mail, Phone, MapPin, Calendar, Hash } from 'lucide-react';

const StudentDetailsModal = ({ student, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Student Details</h2>
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
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium text-gray-900">{student.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Hash className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Roll Number</p>
              <p className="font-medium text-gray-900">{student.rollNumber}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Class</p>
              <p className="font-medium text-gray-900">{student.className}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Section</p>
              <p className="font-medium text-gray-900">{student.section}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{student.email}</p>
            </div>
          </div>

          {student.phone && (
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{student.phone}</p>
              </div>
            </div>
          )}

          {student.address && (
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium text-gray-900">{student.address}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {student.dateOfBirth && (
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium text-gray-900">
                    {new Date(student.dateOfBirth).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Gender</p>
              <p className="font-medium text-gray-900">{student.gender}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Admission Date</p>
              <p className="font-medium text-gray-900">
                {new Date(student.admissionDate).toLocaleDateString()}
              </p>
            </div>
          </div>

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

export default StudentDetailsModal; 