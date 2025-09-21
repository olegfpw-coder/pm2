import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchArtistsData } from '../api/starpi'; // Импортируем функцию для получения данных
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles.css';

const SingleArtist = () => {
    const { id } = useParams(); // Получаем ID артиста из URL
    const [artist, setArtist] = useState(null); // Состояние для хранения артиста
    const [loading, setLoading] = useState(true); // Состояние для отслеживания загрузки
    const [error, setError] = useState(null); // Состояние для отслеживания ошибок

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

    return (
        <div className="single-artist-page">
            <Header />
            
            <main className="single-artist-container">
                {loading && <p>Загрузка данных артиста...</p>}

                {error && <p style={{ color: 'red' }}>{error}</p>}

                {artist && (
                    <div>
                        <h2>{artist.name}</h2>
                        <p><strong>Звание:</strong> {artist.title}</p>
                        <img src={artist.photo} alt={`Фото ${artist.name}`} />
                        <p>{artist.bio}</p>

                        {/* Галерея изображений */}
                        {artist.gallery.length > 0 && (
                            <div className="artist-gallery">
                                <h3>Галерея изображений</h3>
                                <div className="gallery-images">
                                    {artist.gallery.map((imageUrl, index) => (
                                        <img
                                            key={index}
                                            src={imageUrl}
                                            alt={`Изображение ${index + 1}`}
                                            className="gallery-image"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
            
            <Footer />
        </div>
    );
};

export default SingleArtist;