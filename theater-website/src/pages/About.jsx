import React, { useState, useEffect } from 'react';
import TheatreCollage from '../components/TheatreCollage';
import { fetchAboutData } from '../api/starpi';
import MarkdownRenderer from '../components/MarkdownRenderer';

const About = () => {
  const [textP1, setTextP1] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchAboutData();

        setTextP1((data?.TextP1 || '').toString());
        setImages(Array.isArray(data?.images) ? data.images : []);
      } catch (err) {
        console.error('Ошибка загрузки данных About:', err);
        setError('Не удалось загрузить информацию о театре. Попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="about-page">
      <main className="about-container">
        {loading && <p className="loading-text">Загрузка информации о театре...</p>}

        {error && (
          <p className="error-text" style={{ color: 'red', textAlign: 'center', padding: 20 }}>
            {error}
          </p>
        )}

        {!loading && !error && (
          <>
            {textP1 && <MarkdownRenderer content={textP1} className="about_p" />}

            {images.length > 0 && (
              <TheatreCollage images={images} title="История театра" />
            )}

            {!textP1 && images.length === 0 && (
              <p className="no-content-text" style={{ textAlign: 'center', padding: 20 }}>
                Информация о театре временно недоступна.
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default About;
