import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CheckCircle, Clock, XCircle, Calendar, User, Package, MessageSquare } from 'lucide-react';

const BookingTracking = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, [token]);

  const fetchBooking = async () => {
    try {
      const response = await axios.get(`/api/bookings/track/${token}`);
      setBooking(response.data.booking);
    } catch (error) {
      console.error('Error fetching booking:', error);
      toast.error('Booking not found');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-600" />;
      case 'declined':
        return <XCircle className="w-6 h-6 text-red-600" />;
      case 'cancelled':
        return <XCircle className="w-6 h-6 text-gray-600" />;
      default:
        return <Clock className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'declined':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
            The booking you're looking for could not be found. Please check your tracking link.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Book New Appointment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Status
          </h1>
          <p className="text-gray-600">
            Track your curbside pickup booking
          </p>
        </div>

        <div className="space-y-6">
          {/* Status */}
          <div className={`border rounded-lg p-4 ${getStatusColor(booking.status)}`}>
            <div className="flex items-center justify-center space-x-3">
              {getStatusIcon(booking.status)}
              <div>
                <h3 className="text-lg font-semibold">Status: {booking.statusDisplay}</h3>
                <p className="text-sm opacity-90">
                  {booking.status === 'pending' && 'Your booking is under review'}
                  {booking.status === 'confirmed' && 'Your booking has been confirmed'}
                  {booking.status === 'declined' && 'Your booking was not available'}
                  {booking.status === 'cancelled' && 'Your booking has been cancelled'}
                </p>
              </div>
            </div>
          </div>

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

          {/* Status-specific Information */}
          {booking.status === 'confirmed' && (
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">✅ Your booking is confirmed!</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Please arrive at your scheduled time</li>
                <li>• Call us when you arrive at the store</li>
                <li>• Stay in your vehicle</li>
                <li>• We'll bring your items to your car</li>
                <li>• Bring a valid ID for pickup</li>
              </ul>
            </div>
          )}

          {booking.status === 'pending' && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">⏳ Your booking is under review</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Our staff is reviewing your booking</li>
                <li>• You'll receive an email confirmation soon</li>
                <li>• Please wait for our final confirmation</li>
                <li>• Don't come to the store until confirmed</li>
              </ul>
            </div>
          )}

          {booking.status === 'declined' && (
            <div className="bg-red-50 rounded-lg p-4">
              <h4 className="font-medium text-red-900 mb-2">❌ Booking not available</h4>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• This time slot is not available</li>
                <li>• Please book a new appointment</li>
                <li>• We apologize for any inconvenience</li>
                <li>• Contact us if you need assistance</li>
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {booking.status === 'declined' && (
              <button
                onClick={() => navigate('/')}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Book New Appointment
              </button>
            )}
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Back to Home
            </button>
          </div>

          {/* Contact Information */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Need Help?</h4>
            <p className="text-sm text-blue-800">
              If you have any questions about your booking, please contact us at{' '}
              <a href="mailto:info@rezagemcollection.shop" className="underline">
                info@rezagemcollection.shop
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingTracking; 