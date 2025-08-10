import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X } from 'lucide-react';

const schema = yup.object({
  name: yup.string().required('Name is required'),
  rollNumber: yup.string().required('Roll number is required'),
  className: yup.string().required('Class is required'),
  section: yup.string().required('Section is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string(),
  address: yup.string(),
  dateOfBirth: yup.date(),
  gender: yup.string().required('Gender is required'),
}).required();

const EditStudentModal = ({ student, onClose, onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: student.name,
      rollNumber: student.rollNumber,
      className: student.className,
      section: student.section,
      email: student.email,
      phone: student.phone || '',
      address: student.address || '',
      dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
      gender: student.gender
    }
  });

  const handleFormSubmit = async (data) => {
    await onSubmit(data);
    reset();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Student</h2>
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
              Full Name *
            </label>
            <input
              type="text"
              {...register('name')}
              className={`input ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Enter full name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Roll Number *
            </label>
            <input
              type="text"
              {...register('rollNumber')}
              className={`input ${errors.rollNumber ? 'border-red-500' : ''}`}
              placeholder="Enter roll number"
            />
            {errors.rollNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.rollNumber.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class *
              </label>
              <input
                type="text"
                {...register('className')}
                className={`input ${errors.className ? 'border-red-500' : ''}`}
                placeholder="e.g., 10th"
              />
              {errors.className && (
                <p className="mt-1 text-sm text-red-600">{errors.className.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section *
              </label>
              <input
                type="text"
                {...register('section')}
                className={`input ${errors.section ? 'border-red-500' : ''}`}
                placeholder="e.g., A"
              />
              {errors.section && (
                <p className="mt-1 text-sm text-red-600">{errors.section.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              {...register('email')}
              className={`input ${errors.email ? 'border-red-500' : ''}`}
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              {...register('phone')}
              className="input"
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              {...register('address')}
              className="input"
              rows="3"
              placeholder="Enter address"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                {...register('dateOfBirth')}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender *
              </label>
              <select
                {...register('gender')}
                className={`input ${errors.gender ? 'border-red-500' : ''}`}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && (
                <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
              )}
            </div>
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
              {isSubmitting ? 'Updating...' : 'Update Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudentModal; 