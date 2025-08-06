import React from 'react';
import { Link } from 'react-router-dom';
import { Gem, ArrowLeft } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <a 
            href="https://rezagemcollection.ca" 
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Gem className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Reza Gem Collection</h1>
              <p className="text-sm text-gray-600">Curbside Pickup Booking</p>
            </div>
          </a>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a 
              href="https://rezagemcollection.ca" 
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 