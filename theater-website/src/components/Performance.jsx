import React from 'react';
import './styles.css';

const Performance = ({ id, image, title, description }) => {
    return (
        <div className="performance-container">
            {/* Левая часть - обложка спектакля */}
            <div className="performance-image">
                <img src={image} alt={`Обложка спектакля ${title}`} />
            </div>

            {/* Правая часть - информация о спектакле */}
            <div className="performance-info">
                <h2 className="performance-title">{title.toUpperCase()}</h2>
                <p className="performance-description">
                    {description.length > 150 
                        ? `${description.substring(0, 150)}...` 
                        : description
                    }
                </p>
                <a href={`/performances/${id}`} className="performance-button">
                    ПОДРОБНЕЕ
                </a>
            </div>
        </div>
    );
};

export default Performance;