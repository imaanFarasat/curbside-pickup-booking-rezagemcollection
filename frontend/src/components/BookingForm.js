import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Calendar, Clock, User, Mail, Phone, MessageSquare } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const BookingForm = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [businessSettings, setBusinessSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    specialInstructions: ''
  });

  useEffect(() => {
    fetchBusinessSettings();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  const fetchBusinessSettings = async () => {
    try {
      const response = await axios.get('/api/slots/settings');
      setBusinessSettings(response.data);
    } catch (error) {
      console.error('Error fetching business settings:', error);
    }
  };

  const fetchAvailableSlots = async (date) => {
    try {
      const formattedDate = date.toISOString().split('T')[0];
      const response = await axios.get(`/api/bookings/available-slots/${formattedDate}`);
      setAvailableSlots(response.data.availableSlots);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      toast.error('Failed to load available time slots');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time');
      return;
    }

    if (!formData.customerName || !formData.customerEmail || !formData.customerPhone) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const bookingData = {
        ...formData,
        bookingDate: selectedDate.toISOString().split('T')[0],
        startTime: selectedTime
      };

      const response = await axios.post('/api/bookings', bookingData);
      
      toast.success('Booking submitted successfully! Check your email for confirmation.');
      
      // Reset form
      setSelectedDate(null);
      setSelectedTime('');
      setFormData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        specialInstructions: ''
      });
      
    } catch (error) {
      console.error('Error submitting booking:', error);
      const errorMessage = error.response?.data?.error || 'Failed to submit booking';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filterDate = (date) => {
    // Disable Sundays and past dates
    const day = date.getDay();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return day !== 0 && date >= today;
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (!businessSettings) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 font-['Inter']">
      <div className="max-w-4xl mx-auto">
        {/* Main Form Section */}
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden border-4 border-gray-900">
          {/* Form Header - Bold black background */}
          <div className="bg-black text-white px-8 py-6 border-b-4 border-gray-900">
            <h2 className="text-2xl font-black">Booking Details</h2>
            <p className="text-gray-300 font-medium text-lg">Please fill in your information below</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Date and Time Selection */}
              <div className="bg-gray-100 rounded-lg p-6 border-2 border-gray-300">
                <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-6 h-6 mr-3 text-red-600" />
                  Appointment Selection
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base font-bold text-gray-900 mb-3">
                      Select Date *
                    </label>
                    <DatePicker
                      selected={selectedDate}
                      onChange={date => {
                        setSelectedDate(date);
                        setSelectedTime('');
                      }}
                      filterDate={filterDate}
                      placeholderText="Choose a date"
                      className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black font-medium"
                      dateFormat="MMMM d, yyyy"
                      minDate={new Date()}
                    />
                  </div>

                  <div>
                    <label className="block text-base font-bold text-gray-900 mb-3">
                      Select Time *
                    </label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      disabled={!selectedDate || availableSlots.length === 0}
                      className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black disabled:bg-gray-200 disabled:cursor-not-allowed font-medium"
                    >
                      <option value="">Choose a time</option>
                      {availableSlots.map(slot => (
                        <option key={slot} value={slot}>
                          {formatTime(slot)}
                        </option>
                      ))}
                    </select>
                    {selectedDate && availableSlots.length === 0 && (
                      <p className="text-sm font-bold text-red-600 mt-2">
                        No available slots for this date
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-gray-100 rounded-lg p-6 border-2 border-gray-300">
                <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center">
                  <User className="w-6 h-6 mr-3 text-red-600" />
                  Customer Information
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base font-bold text-gray-900 mb-3">
                      <User className="inline w-5 h-5 mr-2 text-red-600" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black font-medium"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-bold text-gray-900 mb-3">
                      <Mail className="inline w-5 h-5 mr-2 text-red-600" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="customerEmail"
                      value={formData.customerEmail}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black font-medium"
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-bold text-gray-900 mb-3">
                      <Phone className="inline w-5 h-5 mr-2 text-red-600" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black font-medium"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-bold text-gray-900 mb-3">
                      <MessageSquare className="inline w-5 h-5 mr-2 text-red-600" />
                      Additional Notes
                    </label>
                    <textarea
                      name="specialInstructions"
                      value={formData.specialInstructions}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black font-medium"
                      placeholder="Any additional notes or special instructions for pickup (optional)"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Section */}
              <div className="bg-gray-100 rounded-lg p-6 border-2 border-gray-300">
                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={loading || !selectedDate || !selectedTime}
                    className="bg-custom-teal text-white px-12 py-3 rounded-lg font-black text-lg hover:bg-custom-teal-dark focus:outline-none focus:ring-4 focus:ring-custom-teal/30 disabled:cursor-not-allowed transition-colors border-2 border-gray-900 font-['Inter']"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Submitting...
                      </div>
                    ) : (
                      'Submit Booking'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Information Section */}
        <div className="mt-8 bg-white rounded-lg shadow-2xl p-8 border-4 border-gray-900">
          <h3 className="text-2xl font-black text-gray-900 mb-6">What to Expect</h3>
          <div className="grid md:grid-cols-1 gap-8">
            <div className="bg-teal-50 rounded-lg p-6 border-2 border-teal-200">
              <h4 className="font-black text-teal-900 mb-3 flex items-center text-lg">
                <span className="w-3 h-3 bg-teal-600 rounded-full mr-3"></span>
                After Booking
              </h4>
              <ul className="space-y-2 text-base font-bold text-teal-800">
                <li>• You'll receive a confirmation email</li>
                <li>• Our staff will review your booking</li>
                <li>• We'll send a final confirmation or alternative time</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm; 