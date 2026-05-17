import React from 'react';
import './App.css'; 
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginPage from './Pages/Login';
import SignUpPage from './Pages/SignUp';
import EventPage from './Pages/Event';
import BookingsPage from './Pages/Bookings';

function App() {
  return (
    <BrowserRouter>
    <Navbar/>
    <div className="main-content">
         <Routes>
             <Route path="/events" element={<EventPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/" element={<Navigate replace to="/events" />} />
        </Routes>
    </div>
    </BrowserRouter>
  );
}

export default App;
