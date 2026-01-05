import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import SpamClassifier from './pages/SpamClassifier.jsx';
import Login from './pages/Login.jsx';
import Documentation from './pages/Documentation.jsx';

function App() {
  return (
    <div className="app-shell">
      <NavBar />
      <main className="content space-y-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/spam" element={<SpamClassifier />} />
          <Route path="/login" element={<Login />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
