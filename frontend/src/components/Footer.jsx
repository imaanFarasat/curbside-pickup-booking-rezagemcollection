import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Business Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Reza Gem Collection</h3>
            <div className="space-y-2 text-gray-300">
              <div className="flex items-start space-x-2">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <p>30 Bertrand Ave Unit A1 & A2<br />Scarborough, ON M1L 2P5, Canada</p>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-5 h-5" />
                <a href="tel:+1234567890" className="hover:text-blue-400 transition-colors">
                  (123) 456-7890
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5" />
                <a href="mailto:info@rezagemcollection.shop" className="hover:text-blue-400 transition-colors">
                  info@rezagemcollection.shop
                </a>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Business Hours</h3>
            <div className="space-y-2 text-gray-300">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <div>
                  <p>Monday - Saturday</p>
                  <p className="text-sm">11:00 AM - 5:00 PM</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                Closed on Sundays
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2 text-gray-300">
              <a href="/" className="block hover:text-blue-400 transition-colors">
                Book Appointment
              </a>
              <a href="mailto:info@rezagemcollection.shop" className="block hover:text-blue-400 transition-colors">
                Contact Us
              </a>
              <a href="mailto:info@rezagemcollection.shop" className="block hover:text-blue-400 transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; 2024 Reza Gem Collection. All rights reserved.</p>
          <p className="text-sm mt-2">
            Curbside pickup booking system
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 