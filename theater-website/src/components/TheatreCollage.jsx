import React, { useState } from 'react';
import ImageModal from './ImageModal';
import scene1 from "../img/About_theatre/HistoryTH (1).jpg";
import scene2 from "../img/About_theatre/HistoryTH (2).jpg";
import scene3 from "../img/About_theatre/HistoryTH (3).jpg";
import scene4 from "../img/About_theatre/HistoryTH (4).jpg";
import scene5 from "../img/About_theatre/HistoryTH (5).jpg";
import scene6 from "../img/About_theatre/HistoryTH (6).jpg";

const UpcomingShows = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    // Массив всех изображений
    const images = [scene1, scene2, scene3, scene4, scene5, scene6];

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
        <>
            <section className="upcoming-shows">
                <div className="shows-grid">
                    <div className="show">
                        <img 
                            src={scene1} 
                            alt="История театра 1" 
                            onClick={() => openImageModal(0)}
                        />
                    </div>
                    <div className="show">
                        <img 
                            src={scene2} 
                            alt="История театра 2" 
                            onClick={() => openImageModal(1)}
                        />
                    </div>
                    <div className="show">
                        <img 
                            src={scene3} 
                            alt="История театра 3" 
                            onClick={() => openImageModal(2)}
                        />
                    </div>
                </div>
                <div className="shows-grid">
                    <div className="show">
                        <img 
                            src={scene4} 
                            alt="История театра 4" 
                            onClick={() => openImageModal(3)}
                        />
                    </div>
                    <div className="show">
                        <img 
                            src={scene5} 
                            alt="История театра 5" 
                            onClick={() => openImageModal(4)}
                        />
                    </div>
                    <div className="show">
                        <img 
                            src={scene6} 
                            alt="История театра 6" 
                            onClick={() => openImageModal(5)}
                        />
                    </div>
                </div>
            </section>

            {/* Модальное окно для просмотра изображений */}
            <ImageModal
                isOpen={isModalOpen}
                onClose={closeImageModal}
                images={images}
                currentIndex={selectedImageIndex}
                title="История театра"
            />
        </>
    );
};

export default UpcomingShows;