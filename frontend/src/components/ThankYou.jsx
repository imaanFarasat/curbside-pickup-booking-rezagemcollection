import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Mail, Clock, Calendar } from 'lucide-react';

const ThankYou = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Thank You!
            </h1>
            <p className="text-gray-600">
              Your booking request has been submitted successfully.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-center mb-2">
                <Mail className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-blue-900">
                  Check Your Email
                </h3>
              </div>
              <p className="text-blue-700 text-sm">
                We've sent you a confirmation email with your booking details.
              </p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                <h3 className="text-lg font-semibold text-yellow-900">
                  What's Next?
                </h3>
              </div>
              <p className="text-yellow-700 text-sm">
                Our staff will review your booking and send you a final confirmation within the next few hours.
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="w-5 h-5 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-green-900">
                  Important Reminder
                </h3>
              </div>
              <p className="text-green-700 text-sm">
                Please wait for our final confirmation before coming to the store.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-custom-teal text-white py-3 px-4 rounded-lg hover:bg-teal-600 transition-colors font-medium"
            >
              Book Another Appointment
            </button>
            
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Need help? Contact us at{' '}
                <a 
                  href="mailto:info@rezagemcollection.shop" 
                  className="text-custom-teal hover:underline"
                >
                  info@rezagemcollection.shop
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYou; 