const express = require('express');
const { sequelize } = require('../config/database');
const Booking = require('../models/Booking');
const emailService = require('../utils/emailService');

const router = express.Router();

// Accept booking (staff action)
router.get('/accept/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    console.log('Admin accept request received for token:', token);
    
    const booking = await Booking.findOne({ 
      where: { adminToken: token }
    });
    
    console.log('Booking found:', booking ? 'Yes' : 'No');
    if (booking) {
      console.log('Booking status:', booking.status);
      console.log('Booking ID:', booking.id);
    }
    
    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found or invalid token'
      });
    }

    if (booking.status === 'confirmed') {
      return res.status(400).json({
        error: 'Booking is already confirmed'
      });
    }

    if (booking.status === 'declined') {
      return res.status(400).json({
        error: 'Cannot accept a declined booking'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        error: 'Cannot accept a cancelled booking'
      });
    }

    // Update booking status
    booking.status = 'confirmed';
    await booking.save();

    // Send final confirmation email to customer
    console.log('Attempting to send final confirmation email to:', booking.customerEmail);
    const emailResult = await emailService.sendFinalConfirmation(booking);
    console.log('Final confirmation email result:', emailResult);

    res.json({
      message: 'Booking confirmed successfully',
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
    console.error('Error accepting booking:', error);
    res.status(500).json({
      error: 'Failed to accept booking'
    });
  }
});

// Decline booking (staff action)
router.get('/decline/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    console.log('Admin decline request received for token:', token);
    
    const booking = await Booking.findOne({ 
      where: { adminToken: token }
    });
    
    console.log('Booking found:', booking ? 'Yes' : 'No');
    if (booking) {
      console.log('Booking status:', booking.status);
      console.log('Booking ID:', booking.id);
    }
    
    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found or invalid token'
      });
    }

    if (booking.status === 'declined') {
      return res.status(400).json({
        error: 'Booking is already declined'
      });
    }

    if (booking.status === 'confirmed') {
      return res.status(400).json({
        error: 'Cannot decline a confirmed booking'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        error: 'Cannot decline a cancelled booking'
      });
    }

    // Update booking status
    booking.status = 'declined';
    await booking.save();

    // Send decline notification to customer
    console.log('Attempting to send decline notification email to:', booking.customerEmail);
    const emailResult = await emailService.sendDeclineNotification(booking);
    console.log('Decline notification email result:', emailResult);

    res.json({
      message: 'Booking declined successfully',
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
    console.error('Error declining booking:', error);
    res.status(500).json({
      error: 'Failed to decline booking'
    });
  }
});

// Get all bookings (for admin dashboard)
router.get('/bookings', async (req, res) => {
  try {
    const { status, date, page = 1, limit = 20 } = req.query;
    
    const query = {};
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Filter by date
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.bookingDate = { [sequelize.Op.between]: [startOfDay, endOfDay] };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const bookings = await Booking.findAll({
      where: query,
      order: [['bookingDate', 'ASC'], ['startTime', 'ASC']],
      offset: skip,
      limit: parseInt(limit),
      attributes: { exclude: ['bookingToken', 'adminToken'] }
    });

    const total = await Booking.count({ where: query });

    res.json({
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error getting bookings:', error);
    res.status(500).json({
      error: 'Failed to get bookings'
    });
  }
});

// Get booking statistics
router.get('/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const [totalBookings, todayBookings, pendingBookings, confirmedBookings, nextWeekBookings] = await Promise.all([
      Booking.count(),
      Booking.count({
        where: {
          bookingDate: {
            [sequelize.Op.gte]: today,
            [sequelize.Op.lt]: tomorrow
          }
        }
      }),
      Booking.count({
        where: { status: 'pending' }
      }),
      Booking.count({
        where: { status: 'confirmed' }
      }),
      Booking.count({
        where: {
          bookingDate: {
            [sequelize.Op.gte]: today,
            [sequelize.Op.lt]: nextWeek
          }
        }
      })
    ]);

    const result = {
      totalBookings,
      todayBookings,
      pendingBookings,
      confirmedBookings,
      nextWeekBookings
    };

    res.json(result);

  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      error: 'Failed to get statistics'
    });
  }
});

// Get booking by ID (for admin details)
router.get('/booking/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findByPk(id);
    
    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found'
      });
    }

    res.json({
      booking: {
        id: booking.id,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone,
        bookingDate: booking.getFormattedDate(),
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        statusDisplay: booking.getStatusDisplay(),
        itemsDescription: booking.itemsDescription,
        specialInstructions: booking.specialInstructions,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        emailSent: booking.emailSent
      }
    });

  } catch (error) {
    console.error('Error getting booking details:', error);
    res.status(500).json({
      error: 'Failed to get booking details'
    });
  }
});

module.exports = router; 