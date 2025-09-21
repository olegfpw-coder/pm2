// src/pages/About.jsx
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Collage from '../components/TheatreCollage'; // Убедись, что путь правильный
import { fetchAboutData } from '../api/starpi'; // Импортируем функцию
import '../styles.css'; // Убедись, что путь к стилям правильный

const About = () => {
    const [textP1, setTextP1] = useState(''); // Для первого текста (строка)
    const [textP2, setTextP2] = useState(''); // Для второго текста (строка)
    const [loading, setLoading] = useState(true); // Состояние загрузки
    const [error, setError] = useState(null); // Состояние ошибки

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchAboutData(); // Получаем данные из Strapi

                // Устанавливаем текст как строку
                // Если data.textP1 или data.textP2 - это объект Markdown, .toString() преобразует его в строку,
                // хотя это может быть не совсем читаемый формат.
                // Если это обычный текст, то просто установится как есть.
                setTextP1(data.textP1?.toString() || '');
                setTextP2(data.textP2?.toString() || '');
            } catch (err) {
                console.error('Ошибка загрузки данных:', err);
                setError('Не удалось загрузить информацию о театре. Попробуйте позже.');
            } finally {
                setLoading(false); // Завершаем загрузку независимо от результата
            }
        };

        loadData();
    }, []); // Пустой массив зависимостей - эффект выполняется один раз после монтирования

    return (
        <div className="about-page">
            <Header />

            <main className="about-container">
                {/* Отображение состояния загрузки */}
                {loading && <p className="loading-text">Загрузка информации о театре...</p>}

                {/* Отображение состояния ошибки */}
                {error && <p className="error-text" style={{ color: 'red', textAlign: 'center', padding: '20px' }}>{error}</p>}

                {/* Отображение контента, если нет ошибок и загрузка завершена */}
                {!loading && !error && (
                    <>
                        {/* Отображаем текст как обычный абзац */}
                        {/* Используем dangerouslySetInnerHTML только если вы уверены, что текст безопасен (например, чистый Markdown без HTML) */}
                        {/* В большинстве случаев лучше отображать как обычный текст */}
                        {textP1 && <p className="about_p">{textP1}</p>}

                        <Collage /> {/* Компонент коллажа */}

                        {textP2 && <p className="about_p">{textP2}</p>}
                    </>
                )}

                {/* Сообщение, если данных нет (не ошибка, просто пусто) */}
                {!loading && !error && !textP1 && !textP2 && (
                    <p className="no-content-text" style={{ textAlign: 'center', padding: '20px' }}>
                        Информация о театре временно недоступна.
                    </p>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default About;