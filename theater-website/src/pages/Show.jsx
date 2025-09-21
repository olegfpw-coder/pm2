import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Performance from '../components/Performance';
import Footer from '../components/Footer';
import { fetchPerformancesData } from '../api/starpi'; // Импортируем функцию для получения данных
import '../styles.css';

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
            <Header />
            
            <main className="performances-container">
                <h1>Спектакли</h1>
                
                {performances.length ? (
                    performances.map((performance) => (
                        <Performance
                            key={performance.id}
                            id={performance.id}
                            image={performance.image}
                            title={performance.title}
                            description={performance.description}
                        />
                    ))
                ) : (
                    <p>Загрузка спектаклей...</p>
                )}
            </main>
            
            <Footer />
        </div>
    );
};

export default Performances;