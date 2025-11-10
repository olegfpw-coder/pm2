import React from 'react';
import Button from './Button';
import MarkdownRenderer from './MarkdownRenderer';
// Стили импортируются в main.css

const Performance = ({ id, image, title, creators }) => {
    return (
        <div className="performance-container">
            {/* Левая часть - обложка спектакля */}
            <div className="performance-image">
                <img src={image} alt={`Обложка спектакля ${title}`} />
            </div>

            {/* Правая часть - информация о спектакле */}
            <div className="performance-info">
                <h2 className="performance-title">{title.toUpperCase()}</h2>
                {creators ? (
                    <div className="performance-creators-preview">
                        <h3 className="creators-preview-title">Создатели спектакля:</h3>
                        <MarkdownRenderer 
                            content={creators}
                            className="performance-description"
                        />
                    </div>
                ) : (
                    <p className="performance-description">Информация о создателях недоступна</p>
                )}
                <a href={`/performances/${id}`}>
                    <Button variant="primary" size="md">
                        ПОДРОБНЕЕ
                    </Button>
                </a>
            </div>
        </div>
    );
};

export default Performance;