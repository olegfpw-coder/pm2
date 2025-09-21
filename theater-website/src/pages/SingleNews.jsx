import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchNewsData, BASE_URL } from '../api/starpi'; // Импортируем функцию и BASE_URL
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles.css';

const SingleNews = () => {
    const { id } = useParams(); // Получаем ID новости из URL
    const [news, setNews] = useState(null); // Состояние для хранения новости

    // Загрузка данных при монтировании компонента
    useEffect(() => {
        const loadNewsData = async () => {
            try {
                const newsData = await fetchNewsData();
                console.log('Ответ от API:', newsData); // Временный вывод для проверки
                const selectedNews = newsData.find((item) => item.id === parseInt(id));
                if (selectedNews) {
                    console.log('Данные новости:', selectedNews); // Проверяем структуру данных
                    const formattedNews = {
                        id: selectedNews.id,
                        image: `${BASE_URL}${selectedNews.image?.url}` || null,
                        title: selectedNews.title || 'Без заголовка',
                        date: selectedNews.date || 'Дата не указана',
                        description: selectedNews.text || 'Описание недоступно',
                    };
                    setNews(formattedNews);
                }
            } catch (error) {
                console.error('Не удалось загрузить новость:', error);
            }
        };
        loadNewsData();
    }, [id]);

    return (
        <div className="single-news-page">
            <Header />

            <main className="single-news-container">
                {news ? (
                    <div>
                        {/* Блок для изображения */}
                        <div className="news-image">
                            {news.image ? (
                                <img src={news.image} alt={`Новость: ${news.title}`} />
                            ) : (
                                <div className="no-image">Изображение недоступно</div>
                            )}
                        </div>

                        {/* Блок для контента новости */}
                        <div className="news-content">
                            <div className="news-header">
                                <span className="news-date">{news.date}</span>
                                <h2 className="news-title">{news.title}</h2>
                            </div>
                            <p className="news-description">
                                {news.description}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div>Загрузка новости...</div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default SingleNews;