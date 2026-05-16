import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import GamePage from './pages/GamePage';
import ResultPage from './pages/ResultPage';
import CollectionPage from './pages/CollectionPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/game/:id" element={<GamePage />} />
      <Route path="/result/:id" element={<ResultPage />} />
      <Route path="/collection" element={<CollectionPage />} />
    </Routes>
  );
}
