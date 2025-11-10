import React, { useEffect, useState } from 'react';

// Стили импортируются в main.css
import { fetchRepertoireMonths } from '../api/starpi'; // Импортируем функцию для получения данных
import AfishaByMonth from '../components/AfishaByMonth';

const Afisha = () => {
    const [months, setMonths] = useState([]);

    useEffect(() => {
        const loadRepertoireData = async () => {
            try {
                const repertoireData = await fetchRepertoireMonths();
                setMonths(repertoireData);
            } catch (error) {
                console.error('Не удалось загрузить данные:', error);
            }
        };
        loadRepertoireData();
    }, []);

    // Функция для открытия изображения в новой вкладке
    const openImageInNewTab = (imageUrl) => {
        console.log('Путь к изображению:', imageUrl); // Логируем путь к изображению
        window.open(imageUrl, '_blank'); // Открываем изображение в новой вкладке
    };

    return (
        <div className="repertoire-page">


            <div className="hero-banner">
                <div className="hero-content">
                    <h2>Приобретите билеты на репертуар на сайте QuickTickets</h2>
                    <a 
                        href="https://quicktickets.ru" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="buy-button"
                    >
                        Купить билет
                    </a>
                </div>
            </div>

            {/* Афиша по месяцам из QuickTickets */}
            <AfishaByMonth />

            <div className="repertoire-months">
                {months.length > 0 ? (
                    months.map((month) => (
                        <div key={month.id} className="month-card">
                            <img 
                                src={month.image} 
                                alt={`Репертуар ${month.name}`} 
                                className="month-image"
                            />
                            <h3>Репертуар {month.name}</h3>
                            <button 
                                className="view-button" 
                                onClick={() => openImageInNewTab(month.image)}
                            >
                                Смотреть целиком
                            </button>
                        </div>
                    ))
                ) : (
                    <p>Загрузка данных...</p>
                )}
            </div>

        </div>
    );
};

export default Afisha;