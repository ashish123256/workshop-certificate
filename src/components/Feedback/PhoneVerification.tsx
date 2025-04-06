import { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface PhoneVerificationProps {
  phone: string;
  onVerified: () => void;
  isVerified: boolean;
}

const PhoneVerification = ({ phone, onVerified, isVerified }: PhoneVerificationProps) => {
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');

  const sendOtp = () => {
    if (!phone) {
      setError('Please enter a valid phone number');
      return;
    }

    // Simulate OTP sending (replace with actual API call)
    setOtpSent(true);
    setCountdown(60);
    setError('');
  };

  const verifyOtp = () => {
    // Simulate verification (replace with actual verification)
    if (otp === '123456') { // Default test OTP
      onVerified();
    } else {
      setError('Invalid OTP code');
    }
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  if (isVerified) {
    return (
      <div className="flex items-center text-green-600 mt-2">
        <CheckCircleIcon className="h-5 w-5 mr-2" />
        <span>Phone number verified</span>
      </div>
    );
  }

  return (
    <div className="mt-2">
      {otpSent ? (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter OTP"
              className="px-3 py-2 border rounded-md w-full max-w-xs"
            />
            <button
              onClick={verifyOtp}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Verify
            </button>
          </div>
          <div className="text-sm text-gray-500">
            {countdown > 0 ? (
              <span>Resend OTP in {countdown}s</span>
            ) : (
              <button
                onClick={sendOtp}
                className="text-blue-600 hover:text-blue-800"
              >
                Resend OTP
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={sendOtp}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Send verification code via SMS
        </button>
      )}
      {error && (
        <div className="flex items-center text-red-600 mt-1">
          <XCircleIcon className="h-5 w-5 mr-1" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
};

export default PhoneVerification;