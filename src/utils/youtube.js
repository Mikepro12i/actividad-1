import axios from 'axios';

// 1. Asegúrate de que esta variable tenga el prefijo VITE_ y que tu .env esté correcto.
const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3/search';

export const searchGameVideos = async (gameName) => {
  if (!gameName) return null;

  // Función auxiliar para hacer la petición
  const fetchVideo = async (querySuffix) => {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          part: 'snippet',
          maxResults: 1,
          // Búsqueda simplificada: GameName + trailer/review/gameplay
          q: `${gameName} ${querySuffix}`, 
          key: API_KEY,
          type: 'video',
        },
      });
      return response.data.items[0];
    } catch (error) {
      // ⚠️ Importante: Esto mostrará en la consola si la clave API falla (error 400/403).
      console.error(`Error buscando ${querySuffix}:`, error);
      return null;
    }
  };

  // Peticiones en paralelo con sufijos simples
  const [trailer, review, gameplay] = await Promise.all([
    fetchVideo('trailer'),
    fetchVideo('review'),
    fetchVideo('gameplay'),
  ]);

  return { trailer, review, gameplay };
};