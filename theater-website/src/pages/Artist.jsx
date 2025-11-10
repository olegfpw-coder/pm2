import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchArtistsData } from '../api/starpi'; // Импортируем функцию для получения данных
// Стили импортируются в main.css

const Artists = () => {
    const [artists, setArtists] = useState([]); // Состояние для хранения артистов
    const [loading, setLoading] = useState(true); // Состояние для отслеживания загрузки
    const [error, setError] = useState(null); // Состояние для отслеживания ошибок

    // Загрузка данных при монтировании компонента
    useEffect(() => {
        const loadArtistsData = async () => {
            try {
                const artistsData = await fetchArtistsData();
                setArtists(artistsData);
            } catch (error) {
                console.error('Не удалось загрузить артистов:', error);
                setError('Не удалось загрузить данные. Попробуйте позже.');
            } finally {
                setLoading(false); // Завершаем загрузку
            }
        };
        loadArtistsData();
    }, []);

    return (
        <div className="artists-page">
            <main className="artists-container">
                <h2>Артисты театра</h2>

                {loading && <p>Загрузка артистов...</p>}

                {error && <p style={{ color: 'red' }}>{error}</p>}

                {!loading && !error && artists.length > 0 ? (
                    <div className="artist-grid">
                        {artists.map((artist) => (
                            <Link to={`/artists/${artist.id}`} key={artist.id} className="art">
                                <img src={artist.photo} alt={`Фото ${artist.name}`} />
                                <h3>{artist.name}</h3>
                                <p>{artist.title}</p>
                            </Link>
                        ))}
                    </div>
                ) : (
                    !loading && <p>Нет доступных артистов.</p>
                )}
            </main>
        </div>
    );
};

export default Artists;