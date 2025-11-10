import React, { useState, useEffect } from 'react';
import NewsItem from '../components/NewsItem';
import { fetchNewsPage } from '../api/starpi';
// Стили импортируются в main.css

const News = () => {
    const [news, setNews] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [newsPerPage] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Загрузка данных при монтировании компонента
    useEffect(() => {
        const loadPage = async () => {
            setLoading(true);
            setError(null);
            try {
                const { items, pagination } = await fetchNewsPage(currentPage, newsPerPage);
                const formatted = items.map((item) => ({
                    id: item.id,
                    image: item.image || null,
                    title: item.title || 'Без заголовка',
                    date: item.date || 'Дата не указана',
                    description: item.text || 'Описание недоступно',
                    gallery: item.gallery || [],
                }));
                setNews(formatted);
                setTotalPages(pagination?.pageCount || 1);
            } catch (e) {
                setError('Не удалось загрузить новости');
            } finally {
                setLoading(false);
            }
        };
        loadPage();
    }, [currentPage, newsPerPage]);

    const currentNews = news;

    // Переключение страниц
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="news-page">
            <main className="news-container">
                <h1>Новости театра</h1>

                <div className="news-list">
                    {loading ? (
                        <p>Загрузка...</p>
                    ) : error ? (
                        <p>{error}</p>
                    ) : currentNews.length ? (
                        currentNews.map((item) => (
                            <NewsItem
                                key={item.id}
                                id={item.id}
                                image={item.image}
                                title={item.title}
                                date={item.date}
                                description={item.description}
                            />
                        ))
                    ) : (
                        <p>Новости загружаются...</p>
                    )}
                </div>

                {/* Пагинация */}
                <div className="pagination">
                    {Array.from({ length: totalPages }).map((_, index) => (
                        <button
                            key={index + 1}
                            onClick={() => paginate(index + 1)}
                            className={currentPage === index + 1 ? 'active' : ''}
                            aria-current={currentPage === index + 1 ? 'page' : undefined}
                            disabled={loading}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default News;