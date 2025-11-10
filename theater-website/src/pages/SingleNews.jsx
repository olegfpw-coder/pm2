import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchNewsData } from '../api/starpi';
import MarkdownRenderer from '../components/MarkdownRenderer';
import ImageModal from '../components/ImageModal';
// Стили импортируются в main.css
const SingleNews = () => {
    const { id } = useParams(); // Получаем ID новости из URL
    const [news, setNews] = useState(null); // Состояние для хранения новости
    const [isModalOpen, setIsModalOpen] = useState(false); // Состояние модального окна
    const [selectedImageIndex, setSelectedImageIndex] = useState(0); // Индекс выбранного изображения

    // Загрузка данных при монтировании компонента
    useEffect(() => {
        const loadNewsData = async () => {
            try {
                const newsData = await fetchNewsData();
                // console.log('Ответ от API:', newsData);
                const selectedNews = newsData.find((item) => item.id === parseInt(id));
                if (selectedNews) {
                    // console.log('Данные новости:', selectedNews);
                    const formattedNews = {
                        id: selectedNews.id,
                        image: selectedNews.image || null,
                        title: selectedNews.title || 'Без заголовка',
                        date: selectedNews.date || 'Дата не указана',
                        description: selectedNews.text || 'Описание недоступно',
                        gallery: selectedNews.gallery || [],
                    };
                    setNews(formattedNews);
                }
            } catch (error) {
                console.error('Не удалось загрузить новость:', error);
            }
        };
        loadNewsData();
    }, [id]);

    // Функция для открытия модального окна с изображением
    const openImageModal = (index) => {
        setSelectedImageIndex(index);
        setIsModalOpen(true);
    };

    // Функция для закрытия модального окна
    const closeImageModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="single-news-page">
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
                            <MarkdownRenderer 
                                content={news.description} 
                                className="news-description"
                            />

                            {/* Галерея изображений */}
                            {news.gallery && news.gallery.length > 0 && (
                                <div className="news-gallery">
                                    <h3>Галерея изображений</h3>
                                    <div className="mini-gallery-images">
                                        {news.gallery.map((imageUrl, index) => (
                                            <img
                                                key={index}
                                                src={imageUrl}
                                                alt={`Изображение ${index + 1}`}
                                                className="mini-gallery-image"
                                                onClick={() => openImageModal(index)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div>Загрузка новости...</div>
                )}

                {/* Модальное окно для просмотра изображений */}
                <ImageModal
                    isOpen={isModalOpen}
                    onClose={closeImageModal}
                    images={news?.gallery || []}
                    currentIndex={selectedImageIndex}
                    title={`Галерея новости "${news?.title || ''}"`}
                />
            </main>
        </div>
    );
};

export default SingleNews;