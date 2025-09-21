import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPerformancesData } from '../api/starpi'; // Импортируем функцию для получения данных
import Header from '../components/Header'; // Импортируем Header
import Footer from '../components/Footer'; // Импортируем Footer
import '../styles.css';

const SinglePerformance = () => {
    const { id } = useParams(); // Получаем ID спектакля из URL
    const [performance, setPerformance] = useState(null); // Состояние для хранения спектакля
    const [loading, setLoading] = useState(true); // Состояние для отслеживания загрузки
    const [error, setError] = useState(null); // Состояние для отслеживания ошибок

    // Загрузка данных при монтировании компонента
    useEffect(() => {
        const loadPerformanceData = async () => {
            try {
                const performancesData = await fetchPerformancesData();
                const selectedPerformance = performancesData.find((item) => item.id === parseInt(id));
                if (selectedPerformance) {
                    setPerformance(selectedPerformance);
                } else {
                    setError('Спектакль не найден.');
                }
            } catch (error) {
                console.error('Не удалось загрузить спектакль:', error);
                setError('Не удалось загрузить данные. Попробуйте позже.');
            } finally {
                setLoading(false); // Завершаем загрузку
            }
        };
        loadPerformanceData();
    }, [id]);

    return (
        <div className="single-performance-page">
            {/* Header */}
            <Header />

            {/* Основной контент */}
            <main className="single-performance-container">
                {loading && <p>Загрузка спектакля...</p>}

                {error && <p style={{ color: 'red' }}>{error}</p>}

                {performance && (
                    <div>
                        <h2>{performance.title.toUpperCase()}</h2>
                        <img src={performance.image} alt={`Обложка спектакля ${performance.title}`} />
                        <p>{performance.description}</p>

                        {/* Галерея изображений */}
                        {performance.gallery.length > 0 && (
                            <div className="performance-gallery">
                                <h3>Галерея изображений</h3>
                                <div className="gallery-images">
                                    {performance.gallery.map((imageUrl, index) => (
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

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default SinglePerformance;