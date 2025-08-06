import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import BookingForm from './components/BookingForm';
import AdminAccept from './components/AdminAccept';
import AdminDecline from './components/AdminDecline';
import BookingTracking from './components/BookingTracking';
import Header from './components/Header';
import Footer from './components/Footer';


function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-gray-50">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<BookingForm />} />
            <Route path="/track/:token" element={<BookingTracking />} />
            <Route path="/admin/accept/:token" element={<AdminAccept />} />
            <Route path="/admin/decline/:token" element={<AdminDecline />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App; 