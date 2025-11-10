import React, { useState, useEffect } from 'react';
import Performance from '../components/Performance';
import { fetchPerformancesData } from '../api/starpi'; // Импортируем функцию для получения данных
// Стили импортируются в main.css

const Performances = () => {
    const [performances, setPerformances] = useState([]); // Состояние для хранения спектаклей

    // Загрузка данных при монтировании компонента
    useEffect(() => {
        const loadPerformancesData = async () => {
            try {
                const performancesData = await fetchPerformancesData();
                setPerformances(performancesData);
            } catch (error) {
                console.error('Не удалось загрузить спектакли:', error);
            }
        };
        loadPerformancesData();
    }, []);

    return (
        <div className="performances-page">
            <main className="performances-container">
                <h1>Спектакли</h1>
                
                {performances.length ? (
                    performances.map((performance) => (
                        <Performance
                            key={performance.id}
                            id={performance.id}
                            image={performance.image}
                            title={performance.title}
                            creators={performance.creators}
                        />
                    ))
                ) : (
                    <p>Загрузка спектаклей...</p>
                )}
            </main>
        </div>
    );
};

export default Performances;