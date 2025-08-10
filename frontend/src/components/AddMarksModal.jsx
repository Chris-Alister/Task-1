import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X } from 'lucide-react';

const schema = yup.object({
  studentId: yup.string().required('Student is required'),
  subject: yup.string().required('Subject is required'),
  examType: yup.string().required('Exam type is required'),
  marks: yup.number().required('Marks are required').min(0, 'Marks cannot be negative').max(100, 'Marks cannot exceed 100'),
  totalMarks: yup.number().required('Total marks are required').min(1, 'Total marks must be at least 1'),
  academicYear: yup.string().required('Academic year is required'),
  semester: yup.string().required('Semester is required'),
  remarks: yup.string(),
}).required();

const AddMarksModal = ({ onClose, onSubmit, students }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      examType: 'Midterm',
      totalMarks: 100,
      academicYear: new Date().getFullYear().toString(),
      semester: '1st'
    }
  });

  const watchedMarks = watch('marks');
  const watchedTotalMarks = watch('totalMarks');

  const handleFormSubmit = async (data) => {
    await onSubmit(data);
    reset();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New Marks</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student *
            </label>
            <select
              {...register('studentId')}
              className={`input ${errors.studentId ? 'border-red-500' : ''}`}
            >
              <option value="">Select a student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} - {student.rollNumber} ({student.className}-{student.section})
                </option>
              ))}
            </select>
            {errors.studentId && (
              <p className="mt-1 text-sm text-red-600">{errors.studentId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject *
            </label>
            <input
              type="text"
              {...register('subject')}
              className={`input ${errors.subject ? 'border-red-500' : ''}`}
              placeholder="Enter subject name"
            />
            {errors.subject && (
              <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Exam Type *
            </label>
            <select
              {...register('examType')}
              className={`input ${errors.examType ? 'border-red-500' : ''}`}
            >
              <option value="Midterm">Midterm</option>
              <option value="Final">Final</option>
              <option value="Quiz">Quiz</option>
              <option value="Assignment">Assignment</option>
              <option value="Project">Project</option>
            </select>
            {errors.examType && (
              <p className="mt-1 text-sm text-red-600">{errors.examType.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marks Obtained *
              </label>
              <input
                type="number"
                {...register('marks')}
                className={`input ${errors.marks ? 'border-red-500' : ''}`}
                placeholder="0-100"
                min="0"
                max="100"
              />
              {errors.marks && (
                <p className="mt-1 text-sm text-red-600">{errors.marks.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Marks *
              </label>
              <input
                type="number"
                {...register('totalMarks')}
                className={`input ${errors.totalMarks ? 'border-red-500' : ''}`}
                placeholder="100"
                min="1"
              />
              {errors.totalMarks && (
                <p className="mt-1 text-sm text-red-600">{errors.totalMarks.message}</p>
              )}
            </div>
          </div>

          {watchedMarks && watchedTotalMarks && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                Percentage: {((watchedMarks / watchedTotalMarks) * 100).toFixed(1)}%
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Academic Year *
              </label>
              <input
                type="text"
                {...register('academicYear')}
                className={`input ${errors.academicYear ? 'border-red-500' : ''}`}
                placeholder="2024"
              />
              {errors.academicYear && (
                <p className="mt-1 text-sm text-red-600">{errors.academicYear.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Semester *
              </label>
              <select
                {...register('semester')}
                className={`input ${errors.semester ? 'border-red-500' : ''}`}
              >
                <option value="1st">1st</option>
                <option value="2nd">2nd</option>
                <option value="3rd">3rd</option>
                <option value="4th">4th</option>
                <option value="5th">5th</option>
                <option value="6th">6th</option>
                <option value="7th">7th</option>
                <option value="8th">8th</option>
              </select>
              {errors.semester && (
                <p className="mt-1 text-sm text-red-600">{errors.semester.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remarks
            </label>
            <textarea
              {...register('remarks')}
              className="input"
              rows="3"
              placeholder="Enter any remarks or comments"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? 'Adding...' : 'Add Marks'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMarksModal; 