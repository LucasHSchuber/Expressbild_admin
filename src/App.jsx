import { Routes, Route } from 'react-router-dom';
// import Index from './pages/index';
import Publishednews from './pages/publishednews';
import Newsdetails from './pages/newsdetails';
import Recentshot from './pages/recentshot';
// import "./App.css";

import '../src/assets/css/buttons.css';

function App() {
  return (
    <div className="main-content">
      <div className="content">
        <div className="route-layout">
          <Routes>
            <Route path="/" element={<Publishednews />} />
            {/* <Route path="/publishednews" element={<Publishednews />} /> */}
            <Route path="/newsdetails/:id" element={<Newsdetails />} />
            <Route path="/recentshot" element={<Recentshot />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
