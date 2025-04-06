import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../../firebase';
import PhoneVerification from './PhoneVerification';
import EmailVerification from './EmailVerification';
import ProgressSteps from './ProgressSteps';
import LoadingSpinner from '../Shared/LoadingSpinner';
import Notification from '../Shared/Notification';

const FeedbackForm = () => {
  const { uniqueLink } = useParams();
  const [workshop, setWorkshop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    course: '',
    phone: '',
    email: '',
    feedback: ''
  });
  
  // Verification state
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Current step for progress indicator
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const fetchWorkshop = async () => {
      try {
        const q = query(collection(firestore, 'workshops'), where('uniqueLink', '==', uniqueLink));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setError('Invalid workshop link');
          setLoading(false);
          return;
        }
        
        const workshopData = querySnapshot.docs[0].data();
        if (!workshopData.isActive) {
          setError('This workshop form is not currently active');
          setLoading(false);
          return;
        }
        
        setWorkshop({
          id: querySnapshot.docs[0].id,
          ...workshopData
        });
        setLoading(false);
      } catch (err) {
        setError('Error loading workshop');
        setLoading(false);
      }
    };
    
    fetchWorkshop();
  }, [uniqueLink]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePhoneVerified = () => {
    setPhoneVerified(true);
    setCurrentStep(3); // Move to email verification step
  };

  const handleEmailVerified = () => {
    setEmailVerified(true);
    setCurrentStep(4); // Move to feedback step
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneVerified || !emailVerified) return;
    
    setIsSubmitting(true);
    
    try {
      await addDoc(collection(firestore, 'submissions'), {
        workshopId: workshop.id,
        ...formData,
        phoneVerified: true,
        emailVerified: true,
        submittedAt: serverTimestamp()
      });
      
      setSubmitted(true);
      setNotification({ type: 'success', message: 'Feedback submitted successfully!' });
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to submit feedback' });
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!workshop) return <div>Workshop not found</div>;
  if (submitted) return (
    <div className="text-center py-8">
      <h2 className="text-2xl font-bold mb-4">Thank You!</h2>
      <p>Your feedback has been submitted successfully.</p>
      <p>Your certificate will be sent to your email and phone shortly.</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white p-6 rounded shadow-md">
        <h2 className="text-2xl font-bold mb-2">{workshop.workshopName}</h2>
        <p className="text-gray-600 mb-1">{workshop.collegeName}</p>
        <p className="text-gray-500 mb-4">
          {new Date(workshop.date).toLocaleDateString()} at {workshop.time}
        </p>
        
        <ProgressSteps 
          currentStep={currentStep} 
          steps={[
            'Personal Info',
            'Phone Verification',
            'Email Verification',
            'Feedback',
            'Complete'
          ]} 
        />
        
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Workshop Instructions</h3>
          <div dangerouslySetInnerHTML={{ __html: workshop.instructions }} />
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Full Name*</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Course*</label>
                <input
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  disabled={!formData.name || !formData.course}
                >
                  Next: Phone Verification
                </button>
              </div>
            </div>
          )}
          
          {/* Step 2: Phone Verification */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Phone Number*</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
                <PhoneVerification 
                  phone={formData.phone} 
                  onVerified={handlePhoneVerified} 
                  isVerified={phoneVerified}
                />
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => phoneVerified && setCurrentStep(3)}
                  className={`px-4 py-2 rounded text-white ${
                    phoneVerified 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                  disabled={!phoneVerified}
                >
                  Next: Email Verification
                </button>
              </div>
            </div>
          )}
          
          {/* Step 3: Email Verification */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Email*</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
                <EmailVerification 
                  email={formData.email} 
                  onVerified={handleEmailVerified} 
                  isVerified={emailVerified}
                />
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => emailVerified && setCurrentStep(4)}
                  className={`px-4 py-2 rounded text-white ${
                    emailVerified 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                  disabled={!emailVerified}
                >
                  Next: Feedback
                </button>
              </div>
            </div>
          )}
          
          {/* Step 4: Feedback */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Feedback*</label>
                <textarea
                  name="feedback"
                  value={formData.feedback}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  rows={4}
                  required
                />
              </div>
              {notification && (
                <Notification 
                  type={notification.type} 
                  message={notification.message} 
                  onClose={() => setNotification(null)} 
                />
              )}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.feedback}
                  className={`px-4 py-2 rounded text-white ${
                    isSubmitting 
                      ? 'bg-blue-400' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;