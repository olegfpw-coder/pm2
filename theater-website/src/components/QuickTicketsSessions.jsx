import React, { useEffect, useState } from 'react';
import { fetchSessions } from '../api/quicktickets';
import Button from './Button';

// ID или алиас организации: REACT_APP_QUICKTICKETS_ORG_ID
const ORG_ID = process.env.REACT_APP_QUICKTICKETS_ORG_ID || null;

const QuickTicketsSessions = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                // Проверка, что настроены токены
                const hasTokens = Boolean(process.env.REACT_APP_QUICKTICKETS_API_TOKEN) && Boolean(process.env.REACT_APP_QUICKTICKETS_API_SALT);
                if (!hasTokens) {
                    setError('QuickTickets API токены не настроены (.env).');
                    return;
                }

                // Если ORG_ID не указан — API позволит искать по всем, но это дольше
                const data = await fetchSessions(ORG_ID || null, null);

                const now = Math.floor(Date.now() / 1000);
                const upcoming = (data || [])
                    .filter((s) => s.timeStart > now)
                    .sort((a, b) => a.timeStart - b.timeStart);

                setSessions(upcoming);
            } catch (e) {
                setError(e?.message || 'Не удалось загрузить сеансы QuickTickets');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) {
        return (
            <section className="quicktickets-sessions">
                <h3>Ближайшие показы (QuickTickets)</h3>
                <p>Загрузка расписания...</p>
            </section>
        );
    }

    if (error) {
        return (
            <section className="quicktickets-sessions">
                <h3>Ближайшие показы (QuickTickets)</h3>
                <p style={{ color: 'red' }}>{error}</p>
            </section>
        );
    }

    if (!sessions.length) {
        return (
            <section className="quicktickets-sessions">
                <h3>Ближайшие показы (QuickTickets)</h3>
                <p>Нет ближайших сеансов.</p>
            </section>
        );
    }

    return (
        <section className="quicktickets-sessions">
            <h3>Ближайшие показы (QuickTickets)</h3>
            <div className="sessions-list">
                {sessions.map((s) => {
                    const dt = new Date(s.timeStart * 1000);
                    const dateStr = dt.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
                    const timeStr = dt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
                    return (
                        <div key={s.id} className="session-item">
                            <div className="session-info">
                                <div className="session-title">{s.eventName || 'Спектакль'}</div>
                                <div className="session-date-time">
                                    <span className="session-date">{dateStr}</span>
                                    <span className="session-time">{timeStr}</span>
                                </div>
                                {s.hall?.name && <div className="session-hall">Зал: {s.hall.name}</div>}
                                {(s.minPrice || s.maxPrice) && (
                                    <div className="session-price">
                                        Цена: {s.minPrice === s.maxPrice ? `${s.minPrice} ₽` : `${s.minPrice ?? ''} - ${s.maxPrice ?? ''} ₽`}
                                    </div>
                                )}
                                {s.pushkincard && <div className="session-pushkincard">💳 Пушкинская карта</div>}
                            </div>
                            {s.url && (
                                <a href={s.url} target="_blank" rel="noopener noreferrer" className="session-ticket-link">
                                    <Button variant="primary" size="md">Купить билет</Button>
                                </a>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default QuickTicketsSessions;



