import { Routes, Route } from 'react-router-dom';
// import Index from './pages/index';
import Publishednews from './pages/publishednews';
import Newsdetails from './pages/newsdetails';
import Recentshot from './pages/recentshot';
import Knowledgebase from './pages/knowledgebase';
import Knowledgedetails from './pages/knowledgedetails';
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
            <Route path="/knowledgebase" element={<Knowledgebase />} />
            <Route path="/knowledgedetails/:id" element={<Knowledgedetails />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
