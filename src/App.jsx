import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AgeGateModal from './components/AgeGateModal';
import './App.css';

const Home = lazy(() => import('./pages/Home'));
const Categories = lazy(() => import('./pages/Categories'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const VideoPlayer = lazy(() => import('./pages/VideoPlayer'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Usc2257 = lazy(() => import('./pages/Usc2257'));
const Dmca = lazy(() => import('./pages/Dmca'));

// A simple loading fallback
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--color-accent)' }}>
    <div className="loading-spinner"></div>
  </div>
);

function App() {
  return (
    <Router>
      <AgeGateModal />
      <Navbar />
      <main>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"          element={<Home />} />
            <Route path="/cats/"     element={<Categories />} />
            <Route path="/search"    element={<SearchResults />} />
            <Route path="/cat/:catName" element={<SearchResults />} />
            <Route path="/tag/:tagName" element={<SearchResults />} />
            <Route path="/video/:id/:slug" element={<VideoPlayer />} />
            <Route path="/video/:id"       element={<VideoPlayer />} />
            <Route path="/terms"     element={<Terms />} />
            <Route path="/privacy"   element={<Privacy />} />
            <Route path="/usc2257"   element={<Usc2257 />} />
            <Route path="/dmca"      element={<Dmca />} />
            <Route path="/:id"       element={<VideoPlayer />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
