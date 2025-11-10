import React, { useState, useEffect } from 'react';
import { fetchNewsData, BASE_URL } from '../api/starpi'; // Импортируем функцию и BASE_URL
import { Link } from 'react-router-dom'; // Импортируем компонент Link
import Button from './Button'; // Импортируем новый компонент Button
// Стили импортируются в main.css

const News = () => {
    const [news, setNews] = useState([]); // Состояние для хранения новостей
    const [hoveredImage, setHoveredImage] = useState(null); // Состояние для текущего изображения при наведении

    const resolveUrl = (img) => {
        if (!img) return null;
        if (typeof img === 'string') return img.startsWith('http') ? img : `${BASE_URL}${img}`;
        if (img.url) return img.url.startsWith('http') ? img.url : `${BASE_URL}${img.url}`;
        const attrUrl = img.data?.attributes?.url;
        if (attrUrl) return attrUrl.startsWith('http') ? attrUrl : `${BASE_URL}${attrUrl}`;
        const fmts = img.data?.attributes?.formats;
        if (fmts) {
            const order = ['large', 'medium', 'small', 'thumbnail'];
            for (const key of order) {
                const u = fmts[key]?.url;
                if (u) return u.startsWith('http') ? u : `${BASE_URL}${u}`;
            }
        }
        return null;
    };

    // Загрузка данных при монтировании компонента
    useEffect(() => {
        const loadNewsData = async () => {
            try {
                const newsData = await fetchNewsData();
                // console.log('Данные новостей:', newsData);

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
                            onMouseEnter={() => setHoveredImage(resolveUrl(item.image))}
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
                <Link to="/news">
                    <Button variant="primary" size="md">
                        Читать все новости
                    </Button>
                </Link>
            </div>
            <div className="news-image">
                {/* Если есть изображение, отобразим его */}
                {hoveredImage ? (
                    <img src={hoveredImage} alt="Новость при наведении" />
                ) : Array.isArray(news) && news.length && news[0]?.image ? (
                    <img src={resolveUrl(news[0].image)} alt="Новость по умолчанию" />
                ) : (
                    <p>Изображение недоступно</p>
                )}
            </div>
        </section>
    );
};

export default News;