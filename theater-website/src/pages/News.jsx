import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import NewsItem from '../components/NewsItem';
import Footer from '../components/Footer';
import { fetchNewsData, BASE_URL } from '../api/starpi'; // Импортируем функцию и BASE_URL
import '../styles.css';

const News = () => {
    const [news, setNews] = useState([]); // Состояние для хранения всех новостей
    const [currentPage, setCurrentPage] = useState(1); // Текущая страница
    const [newsPerPage] = useState(5); // Количество новостей на странице

    // Загрузка данных при монтировании компонента
    useEffect(() => {
        const loadNewsData = async () => {
            try {
                const newsData = await fetchNewsData();

                // Преобразуем данные в удобный формат
                const formattedNews = newsData.map((item) => ({
                    id: item.id,
                    image: `${BASE_URL}${item.image?.url}` || null, // Прямое обращение к полю image
                    title: item.title || 'Без заголовка', // Прямое обращение к полю title
                    date: item.date || 'Дата не указана', // Прямое обращение к полю date
                    description: item.text || 'Описание недоступно', // Прямое обращение к полю description
                }));

                // Сортируем новости по дате (от новой к старой)
                formattedNews.sort((a, b) => new Date(b.date) - new Date(a.date));

                setNews(formattedNews);
            } catch (error) {
                console.error('Не удалось загрузить новости:', error);
            }
        };
        loadNewsData();
    }, []);

    // Получаем новости для текущей страницы
    const indexOfLastNews = currentPage * newsPerPage; // Индекс последней новости на текущей странице
    const indexOfFirstNews = indexOfLastNews - newsPerPage; // Индекс первой новости на текущей странице
    const currentNews = news.slice(indexOfFirstNews, indexOfLastNews); // Новости для текущей страницы

    // Переключение страниц
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="news-page">
            <Header />

            <main className="news-container">
                <h1>Новости театра</h1>

                <div className="news-list">
                    {currentNews.length ? (
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
                    {Array.from({ length: Math.ceil(news.length / newsPerPage) }).map((_, index) => (
                        <button
                            key={index + 1}
                            onClick={() => paginate(index + 1)}
                            className={currentPage === index + 1 ? 'active' : ''}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default News;