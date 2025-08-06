const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  customerName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Customer name is required' },
      len: { args: [1, 100], msg: 'Name cannot exceed 100 characters' }
    }
  },
  customerEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Customer email is required' },
      isEmail: { msg: 'Please enter a valid email' }
    }
  },
  customerPhone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Customer phone is required' }
    }
  },
  bookingDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Booking date is required' }
    }
  },
  startTime: {
    type: DataTypes.STRING(5),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Start time is required' },
      is: {
        args: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        msg: 'Invalid time format. Use HH:MM format'
      }
    }
  },
  endTime: {
    type: DataTypes.STRING(5),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'End time is required' },
      is: {
        args: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        msg: 'Invalid time format. Use HH:MM format'
      }
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'declined', 'cancelled'),
    defaultValue: 'pending'
  },
  bookingToken: {
    type: DataTypes.STRING,
    allowNull: false
  },
  adminToken: {
    type: DataTypes.STRING,
    allowNull: false
  },
  specialInstructions: {
    type: DataTypes.TEXT,
    validate: {
      len: { args: [0, 500], msg: 'Special instructions cannot exceed 500 characters' }
    }
  },
  itemsDescription: {
    type: DataTypes.STRING(200),
    validate: {
      len: { args: [0, 200], msg: 'Items description cannot exceed 200 characters' }
    }
  },
  emailSentCustomerConfirmation: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  emailSentStaffNotification: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  emailSentFinalConfirmation: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  emailSentDeclineNotification: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'bookings',
  timestamps: true,
  hooks: {
    beforeCreate: (booking) => {
      // Generate tokens if not provided
      if (!booking.bookingToken) {
        booking.bookingToken = require('crypto').randomBytes(32).toString('hex');
      }
      if (!booking.adminToken) {
        booking.adminToken = require('crypto').randomBytes(32).toString('hex');
      }
    }
  }
});

// Instance methods
Booking.prototype.isPast = function() {
  const now = new Date();
  const bookingDateTime = new Date(this.bookingDate);
  const [hours, minutes] = this.startTime.split(':');
  bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return bookingDateTime < now;
};

Booking.prototype.getStatusDisplay = function() {
  const statusMap = {
    pending: 'Pending Review',
    confirmed: 'Confirmed',
    declined: 'Declined',
    cancelled: 'Cancelled'
  };
  return statusMap[this.status] || this.status;
};

Booking.prototype.getFormattedDate = function() {
  if (!this.bookingDate) return 'Date not available';
  
  // Handle both string and Date objects
  const date = typeof this.bookingDate === 'string' ? new Date(this.bookingDate) : this.bookingDate;
  
  return date.toLocaleDateString('en-CA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

Booking.prototype.getFormattedTime = function() {
  return `${this.startTime} - ${this.endTime}`;
};

module.exports = Booking; 