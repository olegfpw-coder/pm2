import React, { useState, useEffect } from 'react';

const ImageModal = ({ 
    isOpen, 
    onClose, 
    images, 
    currentIndex = 0, 
    title = "Галерея изображений" 
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(currentIndex);

    // Обновляем индекс при изменении пропса
    useEffect(() => {
        setCurrentImageIndex(currentIndex);
    }, [currentIndex]);

    // Обработка клавиш
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;
            
            switch (e.key) {
                case 'Escape':
                    onClose();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    goToPrevious();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    goToNext();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, currentImageIndex]);

    const goToPrevious = () => {
        setCurrentImageIndex((prev) => 
            prev === 0 ? images.length - 1 : prev - 1
        );
    };

    const goToNext = () => {
        setCurrentImageIndex((prev) => 
            prev === images.length - 1 ? 0 : prev + 1
        );
    };

    const downloadImage = async () => {
        if (!images[currentImageIndex]) return;
        
        try {
            // Получаем изображение через fetch для обхода CORS
            const response = await fetch(images[currentImageIndex]);
            const blob = await response.blob();
            
            // Создаем URL для blob
            const blobUrl = URL.createObjectURL(blob);
            
            // Создаем временную ссылку для скачивания
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `image-${currentImageIndex + 1}.jpg`;
            link.style.display = 'none';
            
            // Добавляем в DOM, кликаем и удаляем
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Освобождаем память
            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Ошибка при скачивании изображения:', error);
            // Fallback: открываем в новой вкладке
            window.open(images[currentImageIndex], '_blank');
        }
    };

    if (!isOpen || !images || images.length === 0) return null;

    const currentImage = images[currentImageIndex];

    return (
        <div className="image-modal-overlay" onClick={onClose}>
            <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Заголовок модального окна */}
                <div className="image-modal-header">
                    <h3 className="image-modal-title">{title}</h3>
                    <div className="image-modal-controls">
                        <button 
                            className="image-modal-btn image-modal-download"
                            onClick={downloadImage}
                            title="Скачать изображение"
                        >
                            📥 Скачать
                        </button>
                        <button 
                            className="image-modal-btn image-modal-close"
                            onClick={onClose}
                            title="Закрыть"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Основное изображение */}
                <div className="image-modal-main">
                    <button 
                        className="image-modal-nav image-modal-prev"
                        onClick={goToPrevious}
                        disabled={images.length <= 1}
                        title="Предыдущее изображение"
                    >
                        ‹
                    </button>
                    
                    <div className="image-modal-image-container">
                        <img 
                            src={currentImage} 
                            alt={`Изображение ${currentImageIndex + 1}`}
                            className="image-modal-image"
                        />
                    </div>
                    
                    <button 
                        className="image-modal-nav image-modal-next"
                        onClick={goToNext}
                        disabled={images.length <= 1}
                        title="Следующее изображение"
                    >
                        ›
                    </button>
                </div>

                {/* Миниатюры */}
                {images.length > 1 && (
                    <div className="image-modal-thumbnails">
                        {images.map((image, index) => (
                            <img
                                key={index}
                                src={image}
                                alt={`Миниатюра ${index + 1}`}
                                className={`image-modal-thumbnail ${
                                    index === currentImageIndex ? 'active' : ''
                                }`}
                                onClick={() => setCurrentImageIndex(index)}
                            />
                        ))}
                    </div>
                )}

                {/* Счетчик изображений */}
                <div className="image-modal-counter">
                    {currentImageIndex + 1} из {images.length}
                </div>
            </div>
        </div>
    );
};

export default ImageModal;

