const express = require('express');
const moment = require('moment-timezone');
const Booking = require('../models/Booking');

const router = express.Router();

// Get available slots for a date range
router.get('/available/:startDate/:endDate', async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    
    const start = moment.tz(startDate, 'America/Toronto');
    const end = moment.tz(endDate, 'America/Toronto');
    
    if (!start.isValid() || !end.isValid()) {
      return res.status(400).json({
        error: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    if (start.isAfter(end)) {
      return res.status(400).json({
        error: 'Start date must be before or equal to end date'
      });
    }

    const now = moment.tz('America/Toronto');
    const result = [];

    // Generate slots for each day in the range
    let currentDate = start.clone();
    
    while (currentDate.isSameOrBefore(end)) {
      // Skip Sundays
      if (currentDate.day() === 0) {
        currentDate.add(1, 'day');
        continue;
      }

      // Skip past dates
      if (currentDate.isBefore(now, 'day')) {
        currentDate.add(1, 'day');
        continue;
      }

      const dateStr = currentDate.format('YYYY-MM-DD');
      
      // Generate all possible time slots for this day
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
          bookingDate: currentDate.toDate(),
          status: ['pending', 'confirmed', 'declined']
        },
        attributes: ['startTime']
      });

      const bookedTimes = bookedSlots.map(booking => booking.startTime);
      const availableSlots = slots.filter(slot => !bookedTimes.includes(slot));

      // If it's today, filter out past times
      const availableSlotsFiltered = currentDate.isSame(now, 'day') 
        ? availableSlots.filter(slot => {
            const slotTime = moment.tz(`${dateStr} ${slot}`, 'America/Toronto');
            return slotTime.isAfter(now.add(1, 'hour')); // Allow booking 1 hour in advance
          })
        : availableSlots;

      result.push({
        date: dateStr,
        dayOfWeek: currentDate.format('dddd'),
        availableSlots: availableSlotsFiltered,
        totalSlots: availableSlotsFiltered.length,
        isToday: currentDate.isSame(now, 'day'),
        isPast: currentDate.isBefore(now, 'day')
      });

      currentDate.add(1, 'day');
    }

    res.json({
      startDate: start.format('YYYY-MM-DD'),
      endDate: end.format('YYYY-MM-DD'),
      slots: result
    });

  } catch (error) {
    console.error('Error getting available slots:', error);
    res.status(500).json({
      error: 'Failed to get available slots'
    });
  }
});

// Get next available slots (for quick booking)
router.get('/next-available', async (req, res) => {
  try {
    const now = moment.tz('America/Toronto');
    const result = [];
    
    // Look for available slots in the next 7 days
    for (let i = 0; i < 7; i++) {
      const checkDate = now.clone().add(i, 'days');
      
      // Skip Sundays
      if (checkDate.day() === 0) {
        continue;
      }

      const dateStr = checkDate.format('YYYY-MM-DD');
      
      // Generate all possible time slots
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
          bookingDate: checkDate.toDate(),
          status: ['pending', 'confirmed', 'declined']
        },
        attributes: ['startTime']
      });

      const bookedTimes = bookedSlots.map(booking => booking.startTime);
      const availableSlots = slots.filter(slot => !bookedTimes.includes(slot));

      // If it's today, filter out past times
      const availableSlotsFiltered = checkDate.isSame(now, 'day') 
        ? availableSlots.filter(slot => {
            const slotTime = moment.tz(`${dateStr} ${slot}`, 'America/Toronto');
            return slotTime.isAfter(now.add(1, 'hour'));
          })
        : availableSlots;

      if (availableSlotsFiltered.length > 0) {
        result.push({
          date: dateStr,
          dayOfWeek: checkDate.format('dddd'),
          availableSlots: availableSlotsFiltered.slice(0, 5), // Limit to first 5 slots
          totalAvailable: availableSlotsFiltered.length,
          isToday: checkDate.isSame(now, 'day')
        });
      }

      // Stop if we have enough results
      if (result.length >= 3) {
        break;
      }
    }

    res.json({
      nextAvailableSlots: result
    });

  } catch (error) {
    console.error('Error getting next available slots:', error);
    res.status(500).json({
      error: 'Failed to get next available slots'
    });
  }
});

// Get business hours and settings
router.get('/settings', (req, res) => {
  res.json({
    businessName: process.env.BUSINESS_NAME || 'Reza Gem Collection',
    businessAddress: process.env.BUSINESS_ADDRESS || '30 Bertrand Ave Unit A1 & A2, Scarborough, ON M1L 2P5, Canada',
    openingHour: parseInt(process.env.OPENING_HOUR) || 11,
    closingHour: parseInt(process.env.CLOSING_HOUR) || 17,
    slotDuration: parseInt(process.env.SLOT_DURATION) || 15,
    timezone: 'America/Toronto',
    operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    closedDays: ['Sunday']
  });
});

module.exports = router; 