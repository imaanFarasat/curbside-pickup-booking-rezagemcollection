import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { XCircle, User, Calendar, Clock, Package } from 'lucide-react';

const AdminDecline = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [token]);

  const fetchBooking = async () => {
    try {
      const response = await axios.get(`/api/admin/decline/${token}`);
      setBooking(response.data.booking);
    } catch (error) {
      console.error('Error fetching booking:', error);
      toast.error('Booking not found or already processed');
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    setProcessing(true);
    try {
      await axios.get(`/api/admin/decline/${token}`);
      toast.success('Booking declined successfully! Customer has been notified.');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Error declining booking:', error);
      const errorMessage = error.response?.data?.error || 'Failed to decline booking';
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-red-800 mb-4">Booking Not Found</h1>
          <p className="text-red-600 mb-4">
            This booking could not be found or has already been processed.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Decline Booking
          </h1>
          <p className="text-gray-600">
            Review the booking details below and confirm decline
          </p>
        </div>

        <div className="space-y-6">
          {/* Booking Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Booking Details
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Date</p>
                <p className="text-gray-900">{booking.bookingDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Time</p>
                <p className="text-gray-900">{booking.startTime} - {booking.endTime}</p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Customer Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-600">Name</p>
                <p className="text-gray-900">{booking.customerName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-gray-900">{booking.customerEmail}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Phone</p>
                <p className="text-gray-900">{booking.customerPhone}</p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {(booking.itemsDescription || booking.specialInstructions) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Additional Information
              </h3>
              <div className="space-y-3">
                {booking.itemsDescription && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Items Description</p>
                    <p className="text-gray-900">{booking.itemsDescription}</p>
                  </div>
                )}
                {booking.specialInstructions && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Special Instructions</p>
                    <p className="text-gray-900">{booking.specialInstructions}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleDecline}
              disabled={processing}
              className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {processing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <XCircle className="w-5 h-5 mr-2" />
                  Decline Booking
                </div>
              )}
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Warning */}
          <div className="bg-red-50 rounded-lg p-4">
            <h4 className="font-medium text-red-900 mb-2">⚠️ Important:</h4>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• The customer will receive a decline notification email</li>
              <li>• The time slot will become available again for other customers</li>
              <li>• The booking status will be updated to "Declined"</li>
              <li>• This action cannot be undone</li>
            </ul>
          </div>

          {/* Information */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Alternative Options:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Consider contacting the customer to suggest alternative times</li>
              <li>• You can manually create a new booking for a different time</li>
              <li>• The customer can book a new appointment through the website</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDecline; 