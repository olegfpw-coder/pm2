// src/components/TheatreCollage.jsx
import React, { useMemo, useState } from 'react';
import ImageModal from './ImageModal';

const TheatreCollage = ({ images = [], title = 'Галерея' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const normalizedImages = useMemo(() => {
    return (images || []).filter(Boolean);
  }, [images]);

  const openImageModal = (index) => {
    setSelectedImageIndex(index);
    setIsModalOpen(true);
  };

  const closeImageModal = () => setIsModalOpen(false);

  const rows = useMemo(() => {
    const result = [];
    for (let i = 0; i < normalizedImages.length; i += 3) {
      result.push(normalizedImages.slice(i, i + 3));
    }
    return result;
  }, [normalizedImages]);

  if (normalizedImages.length === 0) return null;

  return (
    <>
      <section className="upcoming-shows">
        {rows.map((row, rowIndex) => (
          <div className="shows-grid" key={rowIndex}>
            {row.map((src, colIndex) => {
              const idx = rowIndex * 3 + colIndex;
              return (
                <div className="show" key={idx}>
                  <img
                    src={src}
                    alt={`${title} ${idx + 1}`}
                    onClick={() => openImageModal(idx)}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              );
            })}
          </div>
        ))}
      </section>

      <ImageModal
        isOpen={isModalOpen}
        onClose={closeImageModal}
        images={normalizedImages}
        currentIndex={selectedImageIndex}
        title={title}
      />
    </>
  );
};

export default TheatreCollage;
