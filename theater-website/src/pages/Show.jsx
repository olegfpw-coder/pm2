import React, { useState, useEffect } from 'react';
import Performance from '../components/Performance';
import { fetchPerformancesData } from '../api/starpi'; // Импортируем функцию для получения данных
import { findSessionsByPerformanceTitle } from '../api/quicktickets';
// Стили импортируются в main.css

const QUICKTICKETS_ORGANISATION_ID = process.env.REACT_APP_QUICKTICKETS_ORG_ID || null;
const HAS_QUICKTICKETS_CREDENTIALS =
    !!process.env.REACT_APP_QUICKTICKETS_API_TOKEN && !!process.env.REACT_APP_QUICKTICKETS_API_SALT;

const Performances = () => {
    const [performances, setPerformances] = useState([]); // Состояние для хранения спектаклей
    const [sessionsByPerformance, setSessionsByPerformance] = useState({});
    const [sessionsLoading, setSessionsLoading] = useState(false);
    const [sessionsError, setSessionsError] = useState(null);

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

    useEffect(() => {
        if (!HAS_QUICKTICKETS_CREDENTIALS) {
            return;
        }
        if (!performances.length) {
            return;
        }

        let isCancelled = false;

        const loadSessions = async () => {
            setSessionsLoading(true);
            setSessionsError(null);

            const groupedByTitle = new Map();
            performances.forEach((performance) => {
                if (!performance.title) return;
                const normalizedTitle = performance.title.trim().toLowerCase();
                if (!normalizedTitle) return;
                if (!groupedByTitle.has(normalizedTitle)) {
                    groupedByTitle.set(normalizedTitle, {
                        title: performance.title,
                        ids: [],
                    });
                }
                groupedByTitle.get(normalizedTitle).ids.push(performance.id);
            });

            const titleEntries = Array.from(groupedByTitle.values());
            if (!titleEntries.length) {
                setSessionsByPerformance({});
                setSessionsLoading(false);
                return;
            }

            try {
                const results = await Promise.allSettled(
                    titleEntries.map(async ({ title }) => {
                        const sessions = await findSessionsByPerformanceTitle(
                            QUICKTICKETS_ORGANISATION_ID || null,
                            title
                        );
                        return { title, sessions };
                    })
                );

                if (isCancelled) return;

                const nextMap = {};
                let hasErrors = false;

                results.forEach((result, index) => {
                    const entry = titleEntries[index];
                    if (result.status === 'fulfilled') {
                        entry.ids.forEach((performanceId) => {
                            nextMap[performanceId] = result.value.sessions;
                        });
                    } else {
                        hasErrors = true;
                        entry.ids.forEach((performanceId) => {
                            nextMap[performanceId] = [];
                        });
                        console.error(
                            `Не удалось получить сеансы QuickTickets для спектакля "${entry.title}":`,
                            result.reason
                        );
                    }
                });

                setSessionsByPerformance(nextMap);
                if (hasErrors) {
                    setSessionsError(
                        'Не удалось загрузить расписание для некоторых спектаклей. Проверьте консоль.'
                    );
                }
            } catch (error) {
                if (isCancelled) return;
                console.error('Ошибка при загрузке сеансов QuickTickets:', error);
                setSessionsError('Не удалось загрузить расписание QuickTickets.');
            } finally {
                if (!isCancelled) {
                    setSessionsLoading(false);
                }
            }
        };

        loadSessions();

        return () => {
            isCancelled = true;
        };
    }, [performances, HAS_QUICKTICKETS_CREDENTIALS, QUICKTICKETS_ORGANISATION_ID]);

    const quickTicketsEnabled = HAS_QUICKTICKETS_CREDENTIALS && performances.length > 0;

    return (
        <div className="performances-page">
            <main className="performances-container">
                <h1>Спектакли</h1>
                {quickTicketsEnabled && (
                    <div className="performances-quicktickets-status">
                        {sessionsLoading && <p>Загрузка расписания QuickTickets…</p>}
                        {!sessionsLoading && sessionsError && (
                            <p style={{ color: '#b22727' }}>{sessionsError}</p>
                        )}
                    </div>
                )}
                {!HAS_QUICKTICKETS_CREDENTIALS && (
                    <div className="performances-quicktickets-warning">
                        <p>
                            Чтобы показывать расписание из QuickTickets, добавьте переменные окружения{' '}
                            <code>REACT_APP_QUICKTICKETS_API_TOKEN</code>,{' '}
                            <code>REACT_APP_QUICKTICKETS_API_SALT</code>{' '}
                            {`${
                                QUICKTICKETS_ORGANISATION_ID
                                    ? 'и укажите REACT_APP_QUICKTICKETS_ORG_ID.'
                                    : 'и, при необходимости, REACT_APP_QUICKTICKETS_ORG_ID.'
                            }`}
                        </p>
                    </div>
                )}
                
                {performances.length ? (
                    performances.map((performance) => (
                        <Performance
                            key={performance.id}
                            id={performance.id}
                            image={performance.image}
                            title={performance.title}
                            creators={performance.creators}
                            sessions={sessionsByPerformance[performance.id] || []}
                            isLoadingSessions={sessionsLoading}
                            quickTicketsEnabled={quickTicketsEnabled}
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