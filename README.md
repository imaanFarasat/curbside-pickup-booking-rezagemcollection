# Reza Gem Collection - Curbside Pickup Booking System

## Overview
A web-based booking system for curbside pickup services at Reza Gem Collection, allowing customers to book 15-minute time slots for pickup services.

## Business Details
- **Business Name**: Reza Gem Collection
- **Address**: 30 Bertrand Ave Unit A1 & A2, Scarborough, ON M1L 2P5, Canada
- **Service**: Curbside Pickup (15-minute slots)
- **Operating Hours**: Monday to Saturday, 11:00 AM to 5:00 PM

## System Requirements

### Booking Functionality
- Customers can book 15-minute time slots
- Available slots: Monday to Saturday, 11 AM to 5 PM
- Real-time slot availability (slots become unavailable when booked)
- Prevent double-booking of the same time slot

### Email Notifications
1. **Customer Booking Confirmation**
   - Customer receives confirmation email from `info@rezagemcollection.shop`
   - Email includes booking details and pickup instructions

2. **Staff Notification**
   - Staff emails receive notification for review:
     - `imaan.farasat@gmail.com`
     - `rezagemcollection@gmail.com`
   - Staff can accept or decline bookings through email links

3. **Staff Decision Notifications**
   - **If Accepted**: Customer receives final confirmation email
   - **If Declined**: 
     - Customer receives notification to book another time
     - Time slot becomes available again for other customers

### Technical Features
- Real-time availability updates
- Email integration for notifications
- Admin dashboard for staff management
- Mobile-responsive design
- Time zone handling (Eastern Time)

## Technology Stack
- **Frontend**: React.js with TypeScript
- **Backend**: Node.js with Express
- **Database**: MongoDB (for booking data)
- **Email Service**: Nodemailer or SendGrid
- **Deployment**: Vercel/Netlify (frontend), Railway/Heroku (backend)

## File Structure
```
curbsidePickup-booking/
├── frontend/                 # React frontend application
├── backend/                  # Node.js backend API
├── database/                 # Database schemas and migrations
├── emails/                   # Email templates
├── docs/                     # Documentation
└── README.md                 # This file
```

## Development Phases

### Phase 1: Core Booking System
- [ ] Basic booking interface
- [ ] Time slot management
- [ ] Database setup
- [ ] Basic email notifications

### Phase 2: Staff Management
- [ ] Staff email notifications
- [ ] Accept/decline functionality
- [ ] Admin dashboard

### Phase 3: Polish & Deploy
- [ ] UI/UX improvements
- [ ] Email template design
- [ ] Testing
- [ ] Deployment

## Environment Variables
```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=info@rezagemcollection.shop
EMAIL_PASS=your_email_password

# Staff Emails
STAFF_EMAIL_1=imaan.farasat@gmail.com
STAFF_EMAIL_2=rezagemcollection@gmail.com

# Business Configuration
BUSINESS_NAME=Reza Gem Collection
BUSINESS_ADDRESS=30 Bertrand Ave Unit A1 & A2, Scarborough, ON M1L 2P5, Canada
OPENING_HOUR=11
CLOSING_HOUR=17
SLOT_DURATION=15
```

## Getting Started
1. Clone the repository
2. Install dependencies for both frontend and backend
3. Set up environment variables
4. Run the development servers
5. Test the booking flow

## Contact
For technical support or questions about the booking system, please contact the development team. 