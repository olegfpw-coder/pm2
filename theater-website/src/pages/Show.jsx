import React, { useState, useEffect } from 'react';
import Performance from '../components/Performance';
import { fetchPerformancesData } from '../api/starpi'; // Только Strapi

// Страница "Спектакли" теперь выводит ТОЛЬКО список спектаклей без расписания и кнопки "Купить"

const Performances = () => {
  const [performances, setPerformances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const loadPerformancesData = async () => {
      try {
        setLoading(true);
        setError(null);
        const performancesData = await fetchPerformancesData();
        setPerformances(performancesData);
      } catch (err) {
        console.error('Не удалось загрузить спектакли:', err);
        setError('Не удалось загрузить спектакли. Попробуйте обновить страницу.');
      } finally {
        setLoading(false);
      }
    };

    loadPerformancesData();
  }, []);

  return (
    <div className="performances-page">
      <main className="performances-container">
        <h1>Спектакли</h1>

        {loading && <p>Загрузка спектаклей...</p>}
        {!loading && error && <p style={{ color: '#b22727' }}>{error}</p>}

        {!loading && !error && performances.length === 0 && (
          <p>Список спектаклей пуст.</p>
        )}

        {!loading && !error && performances.length > 0 && (
          performances.map((performance) => (
            <Performance
              key={performance.id}
              id={performance.id}
              image={performance.image}
              title={performance.title}
              creators={performance.creators}
              // QuickTickets на этой странице НЕ используем:
              sessions={[]}                // чтобы компонент не пытался что-то показать
              isLoadingSessions={false}
              quickTicketsEnabled={false}
            />
          ))
        )}
      </main>
    </div>
  );
};

export default Performances;
