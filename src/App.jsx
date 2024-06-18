import { Routes, Route } from 'react-router-dom';
import Index from './pages/index';
import Publishednews from './pages/publishednews';
import Newsdetails from './pages/newsdetails';
// import "./App.css";

import '../src/assets/css/main.css';
import '../src/assets/css/buttons.css';

function App() {
  return (
    <div className="main-content">
      <div className="content">
        <div className="route-layout">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/publishednews" element={<Publishednews />} />
            <Route path="/newsdetails/:id" element={<Newsdetails />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
