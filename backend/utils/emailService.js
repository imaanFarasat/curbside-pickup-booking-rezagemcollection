const nodemailer = require('nodemailer');
const Booking = require('../models/Booking');

class EmailService {
  constructor() {
    console.log('Email configuration:', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS ? '***SET***' : '***NOT SET***'
    });
    
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // Send customer booking confirmation
  async sendCustomerConfirmation(booking) {
    const mailOptions = {
      from: `"Reza Gem Collection" <${process.env.EMAIL_USER}>`,
      to: booking.customerEmail,
      subject: 'Your Curbside Pickup Booking - Reza Gem Collection',
      html: this.getCustomerConfirmationTemplate(booking)
    };

    try {
      await this.transporter.sendMail(mailOptions);
      await booking.update({
        emailSentCustomerConfirmation: true
      });
      console.log(`Customer confirmation email sent to ${booking.customerEmail}`);
      return true;
    } catch (error) {
      console.error('Error sending customer confirmation email:', error);
      return false;
    }
  }

  // Send staff notification
  async sendStaffNotification(booking) {
    const staffEmails = [
      process.env.STAFF_EMAIL_1,
      process.env.STAFF_EMAIL_2
    ].filter(email => email);
    
    console.log('Staff emails configured:', staffEmails);
    
    if (staffEmails.length === 0) {
      console.log('No staff emails configured, skipping staff notification');
      return true;
    }

    const mailOptions = {
      from: `"Reza Gem Collection" <${process.env.EMAIL_USER}>`,
      to: staffEmails.join(', '),
      subject: 'New Curbside Pickup Booking - Action Required',
      html: this.getStaffNotificationTemplate(booking)
    };

    try {
      await this.transporter.sendMail(mailOptions);
      await booking.update({
        emailSentStaffNotification: true
      });
      console.log(`Staff notification email sent to ${staffEmails.join(', ')}`);
      return true;
    } catch (error) {
      console.error('Error sending staff notification email:', error);
      return false;
    }
  }

  // Send final confirmation to customer
  async sendFinalConfirmation(booking) {
    const mailOptions = {
      from: `"Reza Gem Collection" <${process.env.EMAIL_USER}>`,
      to: booking.customerEmail,
      subject: 'Booking Confirmed - Reza Gem Collection',
      html: this.getFinalConfirmationTemplate(booking)
    };

    try {
      await this.transporter.sendMail(mailOptions);
      await booking.update({
        emailSentFinalConfirmation: true
      });
      console.log(`Final confirmation email sent to ${booking.customerEmail}`);
      return true;
    } catch (error) {
      console.error('Error sending final confirmation email:', error);
      return false;
    }
  }

  // Send decline notification to customer
  async sendDeclineNotification(booking) {
    const mailOptions = {
      from: `"Reza Gem Collection" <${process.env.EMAIL_USER}>`,
      to: booking.customerEmail,
      subject: 'Booking Update - Reza Gem Collection',
      html: this.getDeclineNotificationTemplate(booking)
    };

    try {
      await this.transporter.sendMail(mailOptions);
      await booking.update({
        emailSentDeclineNotification: true
      });
      console.log(`Decline notification email sent to ${booking.customerEmail}`);
      return true;
    } catch (error) {
      console.error('Error sending decline notification email:', error);
      return false;
    }
  }

  // Email templates
  getCustomerConfirmationTemplate(booking) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50; margin-bottom: 10px;">Reza Gem Collection</h1>
          <p style="color: #7f8c8d; font-size: 18px;">Curbside Pickup Booking</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #27ae60; margin-bottom: 15px;">Booking Received</h2>
          <p>Dear ${booking.customerName},</p>
          <p>Thank you for your curbside pickup booking with Reza Gem Collection. We have received your request and our staff will review it shortly.</p>
        </div>

        <div style="background-color: #ecf0f1; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #2c3e50; margin-bottom: 15px;">Booking Details</h3>
          <p><strong>Date:</strong> ${booking.getFormattedDate()}</p>
          <p><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</p>
          <p><strong>Name:</strong> ${booking.customerName}</p>
          <p><strong>Phone:</strong> ${booking.customerPhone}</p>
          ${booking.specialInstructions ? `<p><strong>Additional Notes:</strong> ${booking.specialInstructions}</p>` : ''}
        </div>

        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #856404; margin-bottom: 15px;">What's Next?</h3>
          <p>Our staff will review your booking and send you a confirmation email within the next few hours. Please wait for our confirmation before coming to the store.</p>
        </div>

        <div style="background-color: #d1ecf1; padding: 20px; border-radius: 8px;">
          <h3 style="color: #0c5460; margin-bottom: 15px;">Store Information</h3>
          <p><strong>Address:</strong> 30 Bertrand Ave Unit A1 & A2, Scarborough, ON M1L 2P5, Canada</p>
          <p><strong>Hours:</strong> Monday to Saturday, 11:00 AM to 5:00 PM</p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
          <p style="color: #7f8c8d; font-size: 14px;">
            If you have any questions, please contact us at info@rezagemcollection.shop
          </p>
        </div>
      </div>
    `;
  }

  getStaffNotificationTemplate(booking) {
    const acceptUrl = `${process.env.FRONTEND_URL}/admin/accept/${booking.adminToken}`;
    const declineUrl = `${process.env.FRONTEND_URL}/admin/decline/${booking.adminToken}`;
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50; margin-bottom: 10px;">Reza Gem Collection</h1>
          <p style="color: #7f8c8d; font-size: 18px;">New Booking Request</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #e74c3c; margin-bottom: 15px;">Action Required</h2>
          <p>A new curbside pickup booking has been submitted and requires your review.</p>
        </div>

        <div style="background-color: #ecf0f1; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #2c3e50; margin-bottom: 15px;">Booking Details</h3>
          <p><strong>Date:</strong> ${booking.getFormattedDate()}</p>
          <p><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</p>
          <p><strong>Customer:</strong> ${booking.customerName}</p>
          <p><strong>Email:</strong> ${booking.customerEmail}</p>
          <p><strong>Phone:</strong> ${booking.customerPhone}</p>
          ${booking.specialInstructions ? `<p><strong>Additional Notes:</strong> ${booking.specialInstructions}</p>` : ''}
        </div>

        <div style="text-align: center; margin-bottom: 20px;">
          <a href="${acceptUrl}" style="background-color: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-right: 10px; display: inline-block;">Accept Booking</a>
          <a href="${declineUrl}" style="background-color: #e74c3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Decline Booking</a>
        </div>

        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px;">
          <h3 style="color: #856404; margin-bottom: 15px;">Important Notes</h3>
          <p>• Please review the booking details carefully</p>
          <p>• Click "Accept" to confirm the booking and notify the customer</p>
          <p>• Click "Decline" to reject the booking and free up the time slot</p>
          <p>• The customer will be automatically notified of your decision</p>
        </div>
      </div>
    `;
  }

  getFinalConfirmationTemplate(booking) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50; margin-bottom: 10px;">Reza Gem Collection</h1>
          <p style="color: #7f8c8d; font-size: 18px;">Booking Confirmed</p>
        </div>
        
        <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #155724; margin-bottom: 15px;">✅ Booking Confirmed</h2>
          <p>Dear ${booking.customerName},</p>
          <p>Great news! Your curbside pickup booking has been confirmed by our staff.</p>
        </div>

        <div style="background-color: #ecf0f1; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #2c3e50; margin-bottom: 15px;">Confirmed Details</h3>
          <p><strong>Date:</strong> ${booking.getFormattedDate()}</p>
          <p><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</p>
          <p><strong>Name:</strong> ${booking.customerName}</p>
          <p><strong>Phone:</strong> ${booking.customerPhone}</p>
          ${booking.specialInstructions ? `<p><strong>Additional Notes:</strong> ${booking.specialInstructions}</p>` : ''}
        </div>

        <div style="background-color: #d1ecf1; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #0c5460; margin-bottom: 15px;">Pickup Instructions</h3>
          <p><strong>Address:</strong> 30 Bertrand Ave Unit A1 & A2, Scarborough, ON M1L 2P5, Canada</p>
          <p><strong>What to do:</strong></p>
          <ul>
            <li>Arrive at your scheduled time</li>
            <li>Call us when you arrive</li>
            <li>Stay in your vehicle</li>
            <li>We'll bring your items to your car</li>
          </ul>
        </div>

        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px;">
          <h3 style="color: #856404; margin-bottom: 15px;">Important Reminders</h3>
          <p>• Please arrive on time for your appointment</p>
          <p>• Bring a valid ID for pickup</p>
          <p>• Have your phone ready to call us when you arrive</p>
          <p>• If you need to cancel or reschedule, please contact us as soon as possible</p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
          <p style="color: #7f8c8d; font-size: 14px;">
            Thank you for choosing Reza Gem Collection!<br>
            Contact: info@rezagemcollection.shop
          </p>
        </div>
      </div>
    `;
  }

  getDeclineNotificationTemplate(booking) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50; margin-bottom: 10px;">Reza Gem Collection</h1>
          <p style="color: #7f8c8d; font-size: 18px;">Booking Update</p>
        </div>
        
        <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #721c24; margin-bottom: 15px;">Booking Not Available</h2>
          <p>Dear ${booking.customerName},</p>
          <p>We regret to inform you that your requested booking time is not available. Our staff has reviewed your request and unfortunately cannot accommodate this time slot.</p>
        </div>

        <div style="background-color: #ecf0f1; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #2c3e50; margin-bottom: 15px;">Requested Details</h3>
          <p><strong>Date:</strong> ${booking.getFormattedDate()}</p>
          <p><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</p>
          <p><strong>Name:</strong> ${booking.customerName}</p>
        </div>

        <div style="background-color: #d1ecf1; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #0c5460; margin-bottom: 15px;">Next Steps</h3>
          <p>Please visit our booking website to select a different time slot that works for you. We apologize for any inconvenience and look forward to serving you at a more convenient time.</p>
        </div>

        <div style="text-align: center; margin-bottom: 20px;">
          <a href="${process.env.FRONTEND_URL}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Book New Appointment</a>
        </div>

        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px;">
          <h3 style="color: #856404; margin-bottom: 15px;">Available Times</h3>
          <p>• Monday to Saturday</p>
          <p>• 11:00 AM to 5:00 PM</p>
          <p>• 15-minute time slots</p>
          <p>• Real-time availability</p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
          <p style="color: #7f8c8d; font-size: 14px;">
            If you have any questions, please contact us at info@rezagemcollection.shop
          </p>
        </div>
      </div>
    `;
  }
}

module.exports = new EmailService(); 