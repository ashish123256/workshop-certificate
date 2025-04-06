import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../../firebase';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { generateRandomString } from '../../utils/helpers';
import { validateWorkshopForm } from '../../utils/validation';
import Notification from '../Shared/Notification';

const WorkshopForm = ({ setShowForm }: { setShowForm: (show: boolean) => void }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    collegeName: '',
    workshopName: '',
    date: '',
    time: '',
    instructions: '',
    isActive: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleInstructionsChange = (value: string) => {
    setFormData({
      ...formData,
      instructions: value
    });
  };

  const saveDraft = async () => {
    if (!user) return;
    
    try {
      await addDoc(collection(firestore, 'drafts'), {
        ...formData,
        adminId: user.uid,
        status: 'draft',
        updatedAt: serverTimestamp()
      });
      setNotification({ type: 'success', message: 'Draft saved successfully' });
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to save draft' });
      console.error('Error saving draft:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateWorkshopForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const uniqueLink = generateRandomString(16);
      await addDoc(collection(firestore, 'workshops'), {
        ...formData,
        adminId: user?.uid,
        uniqueLink,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      setNotification({ type: 'success', message: 'Workshop created successfully' });
      setTimeout(() => setShowForm(false), 1500);
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to create workshop' });
      console.error('Error adding workshop:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4">Create New Workshop Form</h2>
      
      {notification && (
        <Notification 
          type={notification.type} 
          message={notification.message} 
          onClose={() => setNotification(null)} 
        />
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-2">College Name*</label>
            <input
              type="text"
              name="collegeName"
              value={formData.collegeName}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded ${errors.collegeName ? 'border-red-500' : ''}`}
              required
            />
            {errors.collegeName && <p className="text-red-500 text-sm mt-1">{errors.collegeName}</p>}
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Workshop Name*</label>
            <input
              type="text"
              name="workshopName"
              value={formData.workshopName}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded ${errors.workshopName ? 'border-red-500' : ''}`}
              required
            />
            {errors.workshopName && <p className="text-red-500 text-sm mt-1">{errors.workshopName}</p>}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-2">Date*</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded ${errors.date ? 'border-red-500' : ''}`}
              required
            />
            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Time*</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded ${errors.time ? 'border-red-500' : ''}`}
              required
            />
            {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Instructions</label>
          <ReactQuill
            theme="snow"
            value={formData.instructions}
            onChange={handleInstructionsChange}
            modules={{
              toolbar: [
                ['bold', 'italic', 'underline'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['link'],
                ['clean']
              ]
            }}
            className="border rounded"
          />
        </div>
        
        <div className="mb-6 flex items-center">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="mr-2"
            id="activateForm"
          />
          <label htmlFor="activateForm" className="text-gray-700">
            Activate Form Immediately
          </label>
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={saveDraft}
            className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 rounded text-white ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isSubmitting ? 'Creating...' : 'Create Workshop'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkshopForm;