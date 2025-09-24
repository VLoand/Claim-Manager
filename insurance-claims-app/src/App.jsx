import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ClaimSubmission from './pages/ClaimSubmission';
import ClaimReview from './pages/ClaimReview';
import About from './pages/About';
import './App.css';

function App() {
  const [claims, setClaims] = useState([]);

  function addClaim(claim) {
    setClaims(prev => [...prev, claim]);
  }

  function updateClaimStatus(id, status) {
    setClaims(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<ClaimSubmission onSubmit={addClaim} />} />
          <Route path="/review" element={<ClaimReview claims={claims} onStatusChange={updateClaimStatus} />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
