import React, { useState, useEffect } from 'react';
import { fetchNewsData, BASE_URL } from '../api/starpi'; // Импортируем функцию для получения данных новостей
import { Link } from 'react-router-dom'; // Импортируем компонент Link
import './styles.css';

const News = () => {
    const [news, setNews] = useState([]); // Состояние для хранения новостей
    const [hoveredImage, setHoveredImage] = useState(null); // Состояние для текущего изображения при наведении

    // Загрузка данных при монтировании компонента
    useEffect(() => {
        const loadNewsData = async () => {
            try {
                const newsData = await fetchNewsData();
                console.log('Данные новостей:', newsData); // Временный вывод для проверки

                if (Array.isArray(newsData)) {
                    // Сортируем новости по дате (от новой к старой)
                    const sortedNews = newsData.sort((a, b) => new Date(b.date) - new Date(a.date));
                    setNews(sortedNews);
                } else {
                    console.error('Полученные данные не являются массивом:', newsData);
                }
            } catch (error) {
                console.error('Не удалось загрузить новости:', error);
            }
        };
        loadNewsData();
    }, []);

    return (
        <section className="news">
            <div className="news-list">
                <h2>Новости театра</h2>
                {Array.isArray(news) && news.length ? (
                    news.slice(0, 2).map((item) => (
                        <Link
                            to={`/news/${item.id}`}
                            key={item.id}
                            className="news-item"
                            onMouseEnter={() => item.image?.url && setHoveredImage(item.image.url)}
                            onMouseLeave={() => setHoveredImage(null)}
                        >
                            <div>
                                <p>{item.date}</p>
                                <h3>{item.title}</h3>
                                <p>
                                    {item.text?.length > 100
                                        ? `${item.text.substring(0, 100)}...`
                                        : item.text || 'Описание недоступно'}
                                </p>
                            </div>
                        </Link>
                    ))
                ) : (
                    <p>Загрузка новостей...</p>
                )}
                <Link to="/news" className="news-btn">
                    Читать все новости
                </Link>
            </div>
            <div className="news-image">
                {/* Если есть изображение, отобразим его */}
                {hoveredImage ? (
                    <img src={`${BASE_URL}${hoveredImage}`} alt="Новость при наведении" />
                ) : Array.isArray(news) && news.length && news[0]?.image?.url ? (
                    <img src={`${BASE_URL}${news[0].image.url}`} alt="Новость по умолчанию" />
                ) : (
                    <p>Изображение недоступно</p>
                )}
            </div>
        </section>
    );
};

export default News;