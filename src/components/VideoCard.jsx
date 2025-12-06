import React from 'react';
import { FaHeart, FaShareAlt } from 'react-icons/fa'; // Íconos interactivos

const VideoCard = ({ video, title }) => {
  if (!video) return <div className="video-placeholder">No se encontró {title}. Intenta una búsqueda más específica.</div>;

  const videoId = video.id.videoId;

  return (
    <div className="video-card">
      <h3 className="video-title">{title}</h3>
      <div className="video-wrapper">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title}
          allowFullScreen
          frameBorder="0"
        ></iframe>
      </div>
      <div className="video-actions">
        {/* Íconos interactuables */}
        <button className="btn-icon"><FaHeart /> Me gusta</button>
        <button className="btn-icon"><FaShareAlt /> Compartir</button>
        <span className="channel-name">Canal: {video.snippet.channelTitle}</span>
      </div>
    </div>
  );
};

export default VideoCard;