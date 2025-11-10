import React, { useEffect, useState } from 'react';
import { fetchPerformancesData, BASE_URL } from '../api/starpi';
import Button from './Button';

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

    const resolveUrl = (img) => {
        if (!img) return null;
        if (typeof img === 'string') return img.startsWith('http') ? img : `${BASE_URL}${img}`;
        if (img.url) return img.url.startsWith('http') ? img.url : `${BASE_URL}${img.url}`;
        const attrUrl = img.data?.attributes?.url;
        if (attrUrl) return attrUrl.startsWith('http') ? attrUrl : `${BASE_URL}${attrUrl}`;
        const fmts = img.data?.attributes?.formats;
        if (fmts) {
            const order = ['large', 'medium', 'small', 'thumbnail'];
            for (const key of order) {
                const u = fmts[key]?.url;
                if (u) return u.startsWith('http') ? u : `${BASE_URL}${u}`;
            }
        }
        return null;
    };

    return (
        <section className="upcoming-shows">
           <h2 className = "shows-h2">Ближайшие спектакли</h2>
            <div className="shows-grid">
               
                {performances.map((performance) => (
                    <div key={performance.id} className="show">
                        <img src={resolveUrl(performance.image)} alt={performance.title} />
                        <h3>{performance.title}</h3>
                        <div className="dates-list">
                            {performance.dates.map((dateObj, index) => (
                                <div key={index} className="date-item">
                                    <p>
                                        {new Date(dateObj.date).toLocaleDateString()} ({dateObj.time})
                                    </p>
                                    <a href={dateObj.ticketLink} target="_blank" rel="noopener noreferrer">
                                        <Button variant="secondary" size="sm">
                                            Купить билет
                                        </Button>
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