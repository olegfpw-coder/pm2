import React, { useState, useEffect } from 'react';
import { fetchSliderData } from '../api/starpi';
// Стили импортируются в main.css // Подключаем ваш CSS файл

const Slider = () => {
    const [slides, setSlides] = useState([]); // Состояние для хранения слайдов
    const [currentSlide, setCurrentSlide] = useState(0); // Текущий активный слайд
    const [sliderHeight, setSliderHeight] = useState(0); // Высота слайдера
    const [isPaused, setIsPaused] = useState(false); // Пауза автопрокрутки

    // Загрузка данных при монтировании компонента
    useEffect(() => {
        const loadSliderData = async () => {
            try {
                const sliderData = await fetchSliderData();
                // console.log('Ответ от API (slider):', sliderData);
                // Используем уже подготовленное поле imageUrl из API-утилиты
                const validSlides = (Array.isArray(sliderData) ? sliderData : [])
                    .filter((slide) => !!slide.imageUrl);
                // Сортируем слайды по полю order
                validSlides.sort((a, b) => a.order - b.order);
                setSlides(validSlides);

                // Автоматическое определение высоты слайдера на основе первого изображения
                if (validSlides.length > 0 && validSlides[0].imageUrl) {
                    const img = new Image();
                    img.src = validSlides[0].imageUrl;
                    img.onload = () => {
                        const aspectRatio = img.height / img.width; // Расчет пропорции
                        const width = window.innerWidth; // Ширина экрана
                        let height;

                        // Ограничиваем максимальную высоту для десктопа
                        if (window.innerWidth >= 768) {
                            height = Math.min(width * aspectRatio, 800); // Максимальная высота 800px
                        } else {
                            height = width * aspectRatio; // Полная высота на мобильных устройствах
                        }

                        setSliderHeight(height);
                    };
                }
            } catch (error) {
                console.error('Не удалось загрузить слайды:', error);
            }
        };
        loadSliderData();
    }, []);

    // Логика переключения слайдов
    const nextSlide = () => {
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    // Автоматическое переключение слайдов каждые 5 секунд
    useEffect(() => {
        if (!slides.length || isPaused) return;
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval); // Очистка интервала при размонтировании компонента
    }, [slides, isPaused]);

    // Если слайды еще не загружены, показываем заглушку
    if (!slides.length) {
        return <div className="slider">Загрузка слайдов...</div>;
    }

    const onKeyDown = (e) => {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            prevSlide();
        }
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            nextSlide();
        }
    };

    return (
        <div
            className="slider"
            style={{ height: `${sliderHeight}px` }}
            role="region"
            aria-label="Слайдер афиши"
            tabIndex={0}
            onKeyDown={onKeyDown}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocus={() => setIsPaused(true)}
            onBlur={() => setIsPaused(false)}
        >
            {/* Обертка для слайдов */}
            <div
                className="slider-wrapper"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
                {slides.map((slide) => (
                    <div key={slide.id} className="slide">
                        {/* Проверяем наличие imageUrl перед отображением изображения */}
                        {slide.imageUrl && <img src={slide.imageUrl} alt={slide.title} loading="lazy" />}
                        {/* Если нужно отображать заголовок */}
                    </div>
                ))}
            </div>

            {/* Кнопки переключения */}
            <button className="slider-arrow prev" onClick={prevSlide} aria-label="Предыдущий слайд">
                &#10094; {/* Стрелка влево */}
            </button>
            <button className="slider-arrow next" onClick={nextSlide} aria-label="Следующий слайд">
                &#10095; {/* Стрелка вправо */}
            </button>

            {/* Индикаторы (точки) */}
            {slides.length > 1 && (
                <div className="slider-dots">
                    {slides.map((_, index) => (
                        <div
                            key={index}
                            className={`dot ${index === currentSlide ? 'active' : ''}`}
                            onClick={() => setCurrentSlide(index)}
                        ></div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Slider;