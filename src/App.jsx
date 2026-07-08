import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AgeGateModal from './components/AgeGateModal';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import VideoPlayer from './pages/VideoPlayer';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Usc2257 from './pages/Usc2257';
import Dmca from './pages/Dmca';
import './App.css';

function App() {
  return (
    <Router>
      <AgeGateModal />
      <Navbar />
      <main>
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/search"    element={<SearchResults />} />
          <Route path="/video/:id" element={<VideoPlayer />} />
          <Route path="/terms"     element={<Terms />} />
          <Route path="/privacy"   element={<Privacy />} />
          <Route path="/usc2257"   element={<Usc2257 />} />
          <Route path="/dmca"      element={<Dmca />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
