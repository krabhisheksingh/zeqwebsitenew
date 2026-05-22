import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor';
import { AnimatePresence } from 'framer-motion';
import LoadingScreen from './components/LoadingScreen';
import ScrollToTop from './components/ScrollToTop';

import Home from './pages/Home';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Careers from './pages/Careers';
import JobApplication from './pages/JobApplication';
import Pipeline from './pages/Pipeline';

// HR Portal (self-contained, no Navbar/Footer)
import HRLogin from './hr/pages/HRLogin';
import EmployeeDashboard from './hr/pages/EmployeeDashboard';
import AdminDashboard from './hr/pages/AdminDashboard';
import BankDetails from './hr/pages/BankDetails';
import HRProtected from './hr/components/HRProtected';

function App() {
  const [loading, setLoading] = useState(window.innerWidth > 768);
  const location = useLocation();

  useEffect(() => {
    // Simulate loading for premium reveal only on initial load (desktop only)
    if (window.innerWidth <= 768) {
      setLoading(false);
      return;
    }
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const isHRRoute = location.pathname.startsWith('/employee-login');

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent selection:text-white transition-colors duration-500">
      <ScrollToTop />
      <CustomCursor />

      {/* ── HR Portal routes bypass loading screen & main layout ── */}
      {isHRRoute && (
        <Routes location={location} key={location.pathname}>
          <Route path="/employee-login" element={<HRLogin />} />
          <Route path="/employee-login/dashboard" element={<HRProtected allowedRoles={['employee']}><EmployeeDashboard /></HRProtected>} />
          <Route path="/employee-login/bank-details" element={<HRProtected allowedRoles={['employee']}><BankDetails /></HRProtected>} />
          <Route path="/employee-login/admin" element={<HRProtected allowedRoles={['superadmin', 'admin']}><AdminDashboard /></HRProtected>} />
        </Routes>
      )}

      {/* ── Main website (existing, unmodified) ── */}
      {!isHRRoute && (
        <>
          <AnimatePresence mode="wait">
            {loading && <LoadingScreen key="loading" />}
          </AnimatePresence>

          {!loading && (
            <>
              <Navbar />
              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={<Home />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/careers" element={<Careers />} />
                  <Route path="/apply/:id" element={<JobApplication />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/pipeline" element={<Pipeline />} />
                </Routes>
              </AnimatePresence>
              <Footer />
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;
