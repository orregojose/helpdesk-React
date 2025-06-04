import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ConsultTickets from './pages/ConsultTickets';
import PublicTicket from './pages/PublicTicket';
import Profile from './pages/Profile';
import Users from './pages/Users';
import TicketDetail from './pages/TicketDetail';
import Report from './pages/Report';
import RegisterTicket from './pages/RegisterTicket';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/consultar-tickets" element={<ConsultTickets />} />
        <Route path="/ticket/:id" element={<TicketDetail />} />
        <Route path="/public-ticket" element={<PublicTicket />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/users" element={<Users />} />
        <Route path="/report" element={<Report />} />
        <Route path="/register-ticket" element={<RegisterTicket />} />
      </Routes>
    </Router>
  );
}

export default App;
