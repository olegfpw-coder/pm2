import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchArtistsData } from '../api/starpi'; // Импортируем функцию для получения данных
import MarkdownRenderer from '../components/MarkdownRenderer';
import ImageModal from '../components/ImageModal';
// Стили импортируются в main.css

const SingleArtist = () => {
    const { id } = useParams(); // Получаем ID артиста из URL
    const [artist, setArtist] = useState(null); // Состояние для хранения артиста
    const [loading, setLoading] = useState(true); // Состояние для отслеживания загрузки
    const [error, setError] = useState(null); // Состояние для отслеживания ошибок
    const [isModalOpen, setIsModalOpen] = useState(false); // Состояние модального окна
    const [selectedImageIndex, setSelectedImageIndex] = useState(0); // Индекс выбранного изображения

    // Загрузка данных при монтировании компонента
    useEffect(() => {
        const loadArtistData = async () => {
            try {
                const artistsData = await fetchArtistsData();
                const selectedArtist = artistsData.find((item) => item.id === parseInt(id));
                if (selectedArtist) {
                    setArtist(selectedArtist);
                } else {
                    setError('Артист не найден.');
                }
            } catch (error) {
                console.error('Не удалось загрузить артиста:', error);
                setError('Не удалось загрузить данные. Попробуйте позже.');
            } finally {
                setLoading(false); // Завершаем загрузку
            }
        };
        loadArtistData();
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
        <div className="single-artist-page">
            
            <main className="single-artist-container">
                {loading && <p>Загрузка данных артиста...</p>}

                {error && <p style={{ color: 'red' }}>{error}</p>}

                {artist && (
                    <div>
                        <h2>{artist.name}</h2>
                        <p><strong>Звание:</strong> {artist.title}</p>
                        <img src={artist.photo} alt={`Фото ${artist.name}`} />
                        <MarkdownRenderer 
                            content={artist.bio} 
                            className="artist-bio"
                        />

                        {/* Галерея изображений */}
                        {artist.gallery.length > 0 && (
                            <div className="artist-gallery">
                                <h3>Галерея изображений</h3>
                                <div className="mini-gallery-images">
                                    {artist.gallery.map((imageUrl, index) => (
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
                )}

                {/* Модальное окно для просмотра изображений */}
                <ImageModal
                    isOpen={isModalOpen}
                    onClose={closeImageModal}
                    images={artist?.gallery || []}
                    currentIndex={selectedImageIndex}
                    title={`Галерея ${artist?.name || 'артиста'}`}
                />
            </main>
            
        </div>
    );
};

export default SingleArtist;