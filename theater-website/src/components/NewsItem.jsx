import React from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';
import MarkdownRenderer from './MarkdownRenderer';
// Стили импортируются в main.css

const NewsItem = ({ id, image, title, date, description }) => {
    return (
        <div className="news-item">
            <div className="news-image">
                {image ? (
                    <img
                        src={image}
                        alt={`Новость: ${title}`}
                        loading="lazy"
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/logo512.png';
                        }}
                    />
                ) : (
                    <div className="no-image">Изображение недоступно</div>
                )}
            </div>

            <div className="news-content">
                <div className="news-header">
                    <span className="news-date">{date}</span>
                    <h2 className="news-title">{title}</h2>
                </div>
                <MarkdownRenderer 
                    content={description.length > 120
                        ? `${description.substring(0, 120)}...`
                        : description
                    }
                    className="news-description"
                />
                <Link to={`/news/${id}`}>
                    <Button variant="primary" size="md">
                        ЧИТАТЬ ДАЛЕЕ
                    </Button>
                </Link>

                {/* Мини-галерея изображений убрана */}
            </div>
        </div>
    );
};

export default NewsItem;