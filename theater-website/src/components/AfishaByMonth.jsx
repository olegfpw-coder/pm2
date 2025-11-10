import React, { useEffect, useMemo, useState } from 'react';
import { fetchSessions } from '../api/quicktickets';
import Button from './Button';

const ORG_ID = process.env.REACT_APP_QUICKTICKETS_ORG_ID || null;

const monthNameRu = (date) =>
    date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
        .replace(/^./, (c) => c.toUpperCase());

const groupSessionsByMonth = (sessions) => {
    const groups = new Map();
    sessions.forEach((s) => {
        if (!s?.timeStart) return;
        const d = new Date(s.timeStart * 1000);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(s);
    });
    // сортируем внутри месяца по дате
    for (const [, list] of groups) {
        list.sort((a, b) => a.timeStart - b.timeStart);
    }
    // возвращаем отсортированный по ключу список групп (по возрастанию месяца)
    return Array.from(groups.entries())
        .sort(([a], [b]) => a.localeCompare(b));
};

const AfishaByMonth = () => {
    const [sessions, setSessions] = useState([]);
    const [activeKey, setActiveKey] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchSessions(ORG_ID || null, null);
                const now = Math.floor(Date.now() / 1000);
                const future = (data || []).filter((s) => s.timeStart > now);
                setSessions(future);
            } catch (e) {
                setError(e?.message || 'Не удалось загрузить сеансы QuickTickets');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const groups = useMemo(() => groupSessionsByMonth(sessions), [sessions]);

    useEffect(() => {
        if (groups.length && !activeKey) {
            setActiveKey(groups[0][0]);
        }
    }, [groups, activeKey]);

    if (loading) {
        return (
            <section className="afisha-by-month">
                <h3>Афиша по месяцам (QuickTickets)</h3>
                <p>Загрузка...</p>
            </section>
        );
    }

    if (error) {
        return (
            <section className="afisha-by-month">
                <h3>Афиша по месяцам (QuickTickets)</h3>
                <p style={{ color: 'red' }}>{error}</p>
            </section>
        );
    }

    if (!groups.length) {
        return (
            <section className="afisha-by-month">
                <h3>Афиша по месяцам (QuickTickets)</h3>
                <p>Нет ближайших сеансов.</p>
            </section>
        );
    }

    // Простейшие стили для вкладок (без правок глобальных CSS)
    const tabsWrapStyle = {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        margin: '16px 0 20px 0',
    };
    const tabStyle = (active) => ({
        padding: '8px 14px',
        borderRadius: '999px',
        border: active ? '1px solid #1f4ed8' : '1px solid #d6d8e0',
        background: active ? '#1f4ed8' : '#f6f7fb',
        color: active ? '#ffffff' : '#1f2937',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '14px',
        boxShadow: active ? '0 2px 6px rgba(31,78,216,0.3)' : '0 1px 3px rgba(0,0,0,0.06)',
        transition: 'all .15s ease',
        outline: 'none',
    });
    const monthHeaderStyle = {
        margin: '6px 0 12px 0',
        color: '#111827',
        fontSize: '18px',
        fontWeight: 700,
    };

    return (
        <section className="afisha-by-month">
            <h3>Афиша по месяцам (QuickTickets)</h3>
            <div className="month-tabs" style={tabsWrapStyle}>
                {groups.map(([key]) => {
                    const [y, m] = key.split('-').map(Number);
                    const label = monthNameRu(new Date(y, m - 1, 1));
                    return (
                        <button
                            key={key}
                            className={`month-tab ${activeKey === key ? 'active' : ''}`}
                            style={tabStyle(activeKey === key)}
                            onClick={() => setActiveKey(key)}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>
            <div className="month-content">
                {groups.map(([key, list]) => {
                    if (key !== activeKey) return null;
                    return (
                        <div key={key} className="sessions-list">
                            <div style={monthHeaderStyle}>
                                {(() => {
                                    const [y, m] = key.split('-').map(Number);
                                    return monthNameRu(new Date(y, m - 1, 1));
                                })()}
                            </div>
                            {list.map((s) => {
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
                    );
                })}
            </div>
        </section>
    );
};

export default AfishaByMonth;


