import React, { useState } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { searchGameVideos } from './utils/youtube';
import VideoCard from './components/VideoCard';

// Íconos necesarios, importados CORRECTAMENTE aquí:
import { FaSearch, FaSun, FaMoon, FaGamepad } from 'react-icons/fa'; 

import './App.css'; // Importa los estilos

// Componente que usa el contexto de tema
const GameSearchApp = () => {
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setGameData(null); // Limpiar datos anteriores
    const data = await searchGameVideos(query);
    setGameData(data);
    setLoading(false);
  };

  return (
    <div>
      {/* Header con búsqueda y selector de tema */}
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaGamepad size={40} />
          <h1>GameFinder</h1>
        </div>
        
        <form onSubmit={handleSearch} className="search-box">
          <input 
            type="text" 
            placeholder="Escribe un videojuego..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit"><FaSearch /></button>
        </form>

        {/* Botón interactivo para cambiar el tema */}
        <button onClick={toggleTheme} style={{ background: 'transparent', color: 'inherit', border: '1px solid currentColor' }}>
          {theme === 'light' ? <FaMoon size={20} /> : <FaSun size={20} />}
        </button>
      </header>

      {/* Contenido Principal */}
      <main>
        {loading && <p style={{textAlign: 'center', fontSize: '1.5rem'}}>Buscando videos...</p>}

        {!loading && gameData && (
          <div className="results-container">
            <h2 style={{marginBottom: '2rem', borderBottom: '2px solid var(--accent)', display: 'inline-block'}}>
              Resultados para: {query}
            </h2>
            
            <div className="results-grid">
              <VideoCard title="🎬 Tráiler Oficial" video={gameData.trailer} />
              <VideoCard title="📝 Reseña / Review" video={gameData.review} />
              <VideoCard title="🎮 Gameplay" video={gameData.gameplay} />
            </div>
          </div>
        )}

        {!loading && !gameData && (
          <div style={{textAlign: 'center', opacity: 0.5, marginTop: '5rem'}}>
            <h3>Busca un juego para ver su contenido</h3>
          </div>
        )}
      </main>
    </div>
  );
};

// Componente Raíz que provee el contexto del tema a toda la app
function App() {
  return (
    <ThemeProvider>
      <GameSearchApp />
    </ThemeProvider>
  );
}

export default App;