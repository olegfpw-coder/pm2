import React from 'react';
import { Link } from 'react-router-dom';
import './styles.css';

const NewsItem = ({ id, image, title, date, description }) => {
    return (
        <div className="news-item">
            <div className="news-image">
                {image ? (
                    <img src={image} alt={`Новость: ${title}`} />
                ) : (
                    <div className="no-image">Изображение недоступно</div>
                )}
            </div>

            <div className="news-content">
                <div className="news-header">
                    <span className="news-date">{date}</span>
                    <h2 className="news-title">{title}</h2>
                </div>
                <p className="news-description">
                    {description.length > 120
                        ? `${description.substring(0, 120)}...`
                        : description}
                </p>
                <Link to={`/news/${id}`} className="news-button">
                    ЧИТАТЬ ДАЛЕЕ
                </Link>
            </div>
        </div>
    );
};

export default NewsItem;