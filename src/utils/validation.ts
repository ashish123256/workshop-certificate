import { Workshop } from '../types/types';

/**
 * Validates workshop form data
 * @param workshop - Workshop data to validate
 * @returns Object containing validation errors
 */
export const validateWorkshopForm = (workshop: Partial<Workshop>) => {
  const errors: Record<string, string> = {};

  if (!workshop.workshopName?.trim()) {
    errors.workshopName = 'Workshop name is required';
  } else if (workshop.workshopName.length > 100) {
    errors.workshopName = 'Workshop name must be less than 100 characters';
  }

  if (!workshop.collegeName?.trim()) {
    errors.collegeName = 'College name is required';
  }

  if (!workshop.date) {
    errors.date = 'Date is required';
  } else if (new Date(workshop.date) < new Date()) {
    errors.date = 'Date cannot be in the past';
  }

  if (!workshop.time) {
    errors.time = 'Time is required';
  }

  if (!workshop.instructions?.trim()) {
    errors.instructions = 'Instructions are required';
  }

  return errors;
};

/**
 * Validates feedback form data
 * @param formData - Feedback form data
 * @returns Object containing validation errors
 */
export const validateFeedbackForm = (formData: {
  name: string;
  email: string;
  phone: string;
  course: string;
  feedback: string;
}) => {
  const errors: Record<string, string> = {};

  if (!formData.name.trim()) {
    errors.name = 'Name is required';
  }

  if (!formData.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Invalid email format';
  }

  if (!formData.phone.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!/^[\d\s+\-()]{10,15}$/.test(formData.phone)) {
    errors.phone = 'Invalid phone number';
  }

  if (!formData.course.trim()) {
    errors.course = 'Course is required';
  }

  if (!formData.feedback.trim()) {
    errors.feedback = 'Feedback is required';
  }

  return errors;
};

/**
 * Validates certificate template data
 * @param file - File object to validate
 * @returns Object containing validation errors
 */
export const validateCertificateTemplate = (file: File | null) => {
  const errors: Record<string, string> = {};

  if (!file) {
    errors.file = 'File is required';
  } else {
    if (file.type !== 'application/pdf') {
      errors.file = 'Only PDF files are allowed';
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB
      errors.file = 'File size must be less than 5MB';
    }
  }

  return errors;
};

/**
 * Validates OTP code
 * @param otp - OTP code to validate
 * @returns Object containing validation errors
 */
export const validateOTP = (otp: string) => {
  const errors: Record<string, string> = {};

  if (!otp.trim()) {
    errors.otp = 'OTP is required';
  } else if (!/^\d{6}$/.test(otp)) {
    errors.otp = 'OTP must be 6 digits';
  }

  return errors;
};

/**
 * Checks if a workshop form is valid
 * @param workshop - Workshop data to check
 * @returns Boolean indicating if the form is valid
 */
export const isWorkshopValid = (workshop: Partial<Workshop>): boolean => {
  return Object.keys(validateWorkshopForm(workshop)).length === 0;
};