import React, { useEffect, useState } from 'react';
import { fetchPerformancesData } from '../api/starpi';

const UpcomingShows = () => {
    const [performances, setPerformances] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchPerformancesData();

                // Сортировка по самой ранней дате
                const sortedPerformances = data.sort((a, b) => {
                    const dateA = new Date(a.dates[0]?.date || '9999-12-31'); // Берем первую дату
                    const dateB = new Date(b.dates[0]?.date || '9999-12-31');
                    return dateA - dateB;
                });

                // Берем только 3 ближайших спектакля
                setPerformances(sortedPerformances.slice(0, 3));
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <section className="upcoming-shows">
           <h2 classNane = "shows-h2">Ближайшие спектакли</h2>
            <div className="shows-grid">
               
                {performances.map((performance) => (
                    <div key={performance.id} className="show">
                        <img src={performance.image} alt={performance.title} />
                        <h3>{performance.title}</h3>
                        <div className="dates-list">
                            {performance.dates.map((dateObj, index) => (
                                <div key={index} className="date-item">
                                    <p>
                                        {new Date(dateObj.date).toLocaleDateString()} ({dateObj.time})
                                    </p>
                                    <a href={dateObj.ticketLink} target="_blank" rel="noopener noreferrer" className="buy-ticket-btn">
                                        Купить билет
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default UpcomingShows;