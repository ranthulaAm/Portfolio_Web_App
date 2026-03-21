/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Navbar from './components/Navbar';
import { usePortfolioData } from './hooks/usePortfolioData';
import { hexToRgb } from './utils/colors';

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';
  const { data, loading } = usePortfolioData();
  
  const secondaryColor = data.secondaryColor || '#1dbf73';
  const secondaryRgb = hexToRgb(secondaryColor);
  
  const primaryColor = data.primaryColor || '#050505';
  const primaryRgb = hexToRgb(primaryColor);

  useEffect(() => {
    const root = document.documentElement;
    const pColor = isAdmin ? '#f9fafb' : primaryColor;
    const pRgb = isAdmin ? '249, 250, 251' : primaryRgb;
    const sColor = isAdmin ? '#1dbf73' : secondaryColor;
    const sRgb = isAdmin ? '29, 191, 115' : secondaryRgb;

    root.style.setProperty('--primary', pColor);
    root.style.setProperty('--primary-rgb', pRgb);
    root.style.setProperty('--secondary', sColor);
    root.style.setProperty('--secondary-rgb', sRgb);
  }, [isAdmin, primaryColor, primaryRgb, secondaryColor, secondaryRgb]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isAdmin ? 'bg-gray-50' : 'bg-[var(--primary)]'}`} style={{ '--secondary': isAdmin ? '#1dbf73' : secondaryColor, '--primary': isAdmin ? '#f9fafb' : primaryColor } as any}>
        <div className="w-12 h-12 border-4 border-[var(--secondary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans selection:bg-[var(--secondary)] selection:text-white relative ${isAdmin ? 'bg-gray-50 text-gray-900' : 'text-white'}`}>
      {!isAdmin && <div className="atmosphere"></div>}
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
