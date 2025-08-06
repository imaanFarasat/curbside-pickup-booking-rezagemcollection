const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const emailService = require('../utils/emailService');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment-timezone');

const router = express.Router();

// Validation middleware
const validateBooking = [
  body('customerName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('customerEmail')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('customerPhone')
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage('Please provide a valid phone number'),
  body('bookingDate')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid time in HH:MM format'),

  body('specialInstructions')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Special instructions cannot exceed 500 characters')
];

// Create a new booking
router.post('/', validateBooking, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      customerName,
      customerEmail,
      customerPhone,
      bookingDate,
      startTime,
      specialInstructions
    } = req.body;

    // Convert booking date to Toronto timezone
    const torontoDate = moment.tz(bookingDate, 'America/Toronto');
    const now = moment.tz('America/Toronto');

    // Validate booking date (must be in the future)
    if (torontoDate.isBefore(now, 'day')) {
      return res.status(400).json({
        error: 'Booking date must be in the future'
      });
    }

    // Check if it's a valid day (Monday to Saturday)
    const dayOfWeek = torontoDate.day();
    if (dayOfWeek === 0) { // Sunday
      return res.status(400).json({
        error: 'Bookings are not available on Sundays'
      });
    }

    // Validate time (11 AM to 5 PM)
    const [hours, minutes] = startTime.split(':');
    const bookingHour = parseInt(hours);
    
    if (bookingHour < 11 || bookingHour >= 17) {
      return res.status(400).json({
        error: 'Bookings are only available between 11:00 AM and 5:00 PM'
      });
    }

    // Calculate end time (15 minutes later)
    const endTime = moment.tz(`${bookingDate} ${startTime}`, 'America/Toronto')
      .add(15, 'minutes')
      .format('HH:mm');

    // Check if slot is already booked (including declined bookings)
    const existingBooking = await Booking.findOne({
      where: {
        bookingDate: torontoDate.toDate(),
        startTime: startTime,
        status: ['pending', 'confirmed', 'declined']
      }
    });

    if (existingBooking) {
      return res.status(409).json({
        error: 'This time slot is already booked. Please select another time.'
      });
    }

    // Create booking tokens
    const bookingToken = uuidv4();
    const adminToken = uuidv4();

    // Create new booking
    const booking = await Booking.create({
      customerName,
      customerEmail,
      customerPhone,
      bookingDate: torontoDate.toDate(),
      startTime,
      endTime,
      specialInstructions,
      bookingToken,
      adminToken
    });

    // Send confirmation emails
    await emailService.sendCustomerConfirmation(booking);
    await emailService.sendStaffNotification(booking);

    res.status(201).json({
      message: 'Booking created successfully',
      booking: {
        id: booking.id,
        customerName: booking.customerName,
        bookingDate: booking.getFormattedDate(),
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status
      }
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      error: 'Failed to create booking. Please try again.'
    });
  }
});

// Get available time slots for a specific date
router.get('/available-slots/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const torontoDate = moment.tz(date, 'America/Toronto');
    const now = moment.tz('America/Toronto');

    // Validate date
    if (!torontoDate.isValid()) {
      return res.status(400).json({
        error: 'Invalid date format'
      });
    }

    // Check if date is in the past
    if (torontoDate.isBefore(now, 'day')) {
      return res.status(400).json({
        error: 'Cannot book slots in the past'
      });
    }

    // Check if it's Sunday
    if (torontoDate.day() === 0) {
      return res.status(400).json({
        error: 'Bookings are not available on Sundays'
      });
    }

    // Generate all possible time slots (11 AM to 5 PM, 15-minute intervals)
    const slots = [];
    const startHour = 11;
    const endHour = 17;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }

    // Get booked slots for this date (including declined bookings to block those time slots)
    const bookedSlots = await Booking.findAll({
      where: {
        bookingDate: torontoDate.toDate(),
        status: ['pending', 'confirmed', 'declined']
      },
      attributes: ['startTime']
    });

    const bookedTimes = bookedSlots.map(booking => booking.startTime);

    // Filter out booked slots
    const availableSlots = slots.filter(slot => !bookedTimes.includes(slot));

    // If it's today, filter out past times
    const availableSlotsFiltered = torontoDate.isSame(now, 'day') 
      ? availableSlots.filter(slot => {
          const slotTime = moment.tz(`${date} ${slot}`, 'America/Toronto');
          return slotTime.isAfter(now.add(1, 'hour')); // Allow booking 1 hour in advance
        })
      : availableSlots;

    res.json({
      date: torontoDate.format('YYYY-MM-DD'),
      availableSlots: availableSlotsFiltered,
      totalSlots: availableSlotsFiltered.length
    });

  } catch (error) {
    console.error('Error getting available slots:', error);
    res.status(500).json({
      error: 'Failed to get available slots'
    });
  }
});

// Get booking by token (for customer tracking)
router.get('/track/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const booking = await Booking.findOne({ 
      where: { bookingToken: token }
    });
    
    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found'
      });
    }

    res.json({
      booking: {
        id: booking.id,
        customerName: booking.customerName,
        bookingDate: booking.getFormattedDate(),
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        statusDisplay: booking.getStatusDisplay(),
        specialInstructions: booking.specialInstructions,
        createdAt: booking.createdAt
      }
    });

  } catch (error) {
    console.error('Error getting booking:', error);
    res.status(500).json({
      error: 'Failed to get booking details'
    });
  }
});

// Cancel booking (customer initiated)
router.post('/cancel/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const booking = await Booking.findOne({ 
      where: { bookingToken: token }
    });
    
    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        error: 'Booking is already cancelled'
      });
    }

    if (booking.status === 'confirmed') {
      return res.status(400).json({
        error: 'Cannot cancel a confirmed booking. Please contact us directly.'
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({
      message: 'Booking cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      error: 'Failed to cancel booking'
    });
  }
});

module.exports = router; 