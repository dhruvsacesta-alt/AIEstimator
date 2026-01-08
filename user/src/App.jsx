import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import AssessmentForm from './pages/Assessment/AssessmentForm';
import Success from './pages/Success';
import { Box } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav style={{ padding: '1rem 0', borderBottom: '1px solid #e2e8f0', background: '#fff', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div
          onClick={() => window.location.href = '/'}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800, fontSize: '1.25rem', cursor: 'pointer', color: '#1e293b' }}
        >
          <div style={{ background: '#1d4ed8', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box size={20} color="white" />
          </div>
          <span>AI Estimator</span>
        </div>

        {/* Desktop Nav */}
        <div className="mobile-hide" style={{ display: 'flex', gap: '2.5rem', fontSize: '0.95rem', fontWeight: '600', color: '#475569' }}>
          <a href="#how-it-works" style={{ color: 'inherit', textDecoration: 'none' }}>How it works</a>
          <a href="#services" style={{ color: 'inherit', textDecoration: 'none' }}>Services</a>
          <a href="#contact" style={{ color: 'inherit', textDecoration: 'none' }}>Contact</a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="desktop-hide"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: '#1e293b',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'none' }} className="mobile-show">
            {/* Logic to show on mobile is handled by CSS later or inline if we define mobile-show */}
          </div>
        </button>
      </div>

      {/* Mobile Menu (Simplified for now) */}
      {isOpen && (
        <div style={{ padding: '1rem', borderTop: '1px solid #e2e8f0', background: 'white', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <a href="#how-it-works" onClick={() => setIsOpen(false)}>How it works</a>
          <a href="#services" onClick={() => setIsOpen(false)}>Services</a>
          <a href="#contact" onClick={() => setIsOpen(false)}>Contact</a>
        </div>
      )}
    </nav>
  );
};

const Footer = () => (
  <footer style={{ padding: '4rem 0 2rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', marginTop: '4rem' }}>
    <div className="container">
      <div className="grid grid-cols-3 md:grid-cols-1" style={{ gap: '3rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 800, fontSize: '1.25rem', marginBottom: '1.5rem', color: '#1e293b' }}>
            <Box size={20} color="#1d4ed8" /> AI Estimator
          </div>
          <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: '400px' }}>
            Providing high-precision moving estimates powered by industry-leading computer vision and AI logistics.
          </p>
        </div>
        <div>
          <h4 style={{ marginBottom: '1.5rem', color: '#1e293b', fontSize: '1rem' }}>Solutions</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', color: '#64748b' }}>
            <span>Local Relocation</span>
            <span>Commercial Moving</span>
            <span>AI Cataloging</span>
          </div>
        </div>
        <div>
          <h4 style={{ marginBottom: '1.5rem', color: '#1e293b', fontSize: '1rem' }}>Support</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', color: '#64748b' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Help Center</span>
          </div>
        </div>
      </div>
      <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #e2e8f0', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
        © 2026 AI Estimator Inc. All rights reserved.
      </div>
    </div>
  </footer>
);

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', background: '#ffffff', color: '#0f172a' }}>
        <Navbar />
        <main style={{ position: 'relative', zIndex: 1 }}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/assessment" element={<AssessmentForm />} />
            <Route path="/success" element={<Success />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
